const STORAGE_KEY_PROFILES = 'back2u_profiles_v1';
const STORAGE_KEY_CURRENT_USER = 'back2u_current_user_v1';

export const profileService = {
  // Get all registered campus profiles from local cache
  getAllProfiles() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Sync profiles from MongoDB Atlas database
  async syncProfiles() {
    try {
      const res = await fetch('/api/profiles');
      if (res.ok) {
        const data = await res.json();
        if (data.connected && Array.isArray(data.profiles) && data.profiles.length > 0) {
          const local = this.getAllProfiles();
          const map = new Map();
          local.forEach((p) => map.set(p.email?.toLowerCase(), p));
          data.profiles.forEach((p) => map.set(p.email?.toLowerCase(), { ...map.get(p.email?.toLowerCase()), ...p }));
          const merged = Array.from(map.values());
          localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(merged));
          return merged;
        }
      }
    } catch (err) {
      console.warn('Profile sync from server failed:', err);
    }
    return this.getAllProfiles();
  },

  // Save or update a profile during Sign Up (saves locally + MongoDB Atlas)
  async saveProfile(profileData) {
    const profiles = this.getAllProfiles();
    const cleanEmail = profileData.email?.trim().toLowerCase();
    const existingIndex = profiles.findIndex(
      (p) => p.email?.toLowerCase() === cleanEmail || p.id === profileData.id
    );

    const profile = {
      ...profileData,
      email: cleanEmail,
      id: profileData.id || 'usr-' + Date.now(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      profiles[existingIndex] = { ...profiles[existingIndex], ...profile };
    } else {
      profiles.push(profile);
    }

    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
    // Automatically log in newly signed up user
    this.setCurrentUser(profile);

    // Save to MongoDB Atlas in background
    try {
      await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
    } catch (err) {
      console.warn('MongoDB profile save failed, cached locally:', err);
    }

    return profile;
  },

  // Login using ONLY email ID (checks local cache first, then MongoDB Atlas cloud)
  async login(email) {
    if (!email) {
      return { success: false, message: 'Please enter your college email ID.' };
    }
    const clean = email.trim().toLowerCase();

    // 1. Try local cache first
    let profiles = this.getAllProfiles();
    let found = profiles.find((p) => p.email?.toLowerCase() === clean);

    // 2. If not found locally, query MongoDB Atlas
    if (!found) {
      try {
        const res = await fetch(`/api/profiles?email=${encodeURIComponent(clean)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.profile) {
            found = data.profile;
            // Cache locally
            profiles.push(found);
            localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
          }
        }
      } catch (err) {
        console.warn('MongoDB profile lookup failed:', err);
      }
    }

    if (found) {
      this.setCurrentUser(found);
      return { success: true, profile: found };
    }

    return {
      success: false,
      message: 'No registered Campus ID found with this email. Please click "Sign Up" to create your ID.',
    };
  },

  // Logout
  logout() {
    this.setCurrentUser(null);
  },

  // Get active user profile
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  // Switch or set active user
  setCurrentUser(profile) {
    if (profile) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(profile));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  },

  // Find profile by email, roll no, or admission no
  async findProfileByQuery(query) {
    if (!query) return null;
    const clean = query.trim().toLowerCase();
    const profiles = this.getAllProfiles();
    let found = profiles.find(
      (p) =>
        p.email?.toLowerCase() === clean ||
        p.rollNumber?.toLowerCase() === clean ||
        p.admissionNumber?.toLowerCase() === clean ||
        p.id === query
    );

    if (!found) {
      try {
        const res = await fetch(`/api/profiles?query=${encodeURIComponent(clean)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.profile) {
            found = data.profile;
          }
        }
      } catch (err) {
        console.warn('MongoDB query lookup failed:', err);
      }
    }

    return found || null;
  }
};
