const STORAGE_KEY_PROFILES = 'back2u_profiles_v1';
const STORAGE_KEY_CURRENT_USER = 'back2u_current_user_v1';

export const profileService = {
  // Get all registered campus profiles
  getAllProfiles() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Save or update a profile during Sign Up
  saveProfile(profileData) {
    const profiles = this.getAllProfiles();
    const existingIndex = profiles.findIndex(
      (p) => p.email?.toLowerCase() === profileData.email?.toLowerCase() || p.id === profileData.id
    );

    const profile = {
      ...profileData,
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
    return profile;
  },

  // Login using ONLY email ID
  login(email) {
    if (!email) {
      return { success: false, message: 'Please enter your college email ID.' };
    }
    const clean = email.trim().toLowerCase();
    const profiles = this.getAllProfiles();
    const found = profiles.find((p) => p.email?.toLowerCase() === clean);

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
  findProfileByQuery(query) {
    if (!query) return null;
    const clean = query.trim().toLowerCase();
    const profiles = this.getAllProfiles();
    return profiles.find(
      (p) =>
        p.email?.toLowerCase() === clean ||
        p.rollNumber?.toLowerCase() === clean ||
        p.admissionNumber?.toLowerCase() === clean ||
        p.id === query
    ) || null;
  }
};
