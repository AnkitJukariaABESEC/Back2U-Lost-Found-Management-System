import { INITIAL_ITEMS, INITIAL_CLAIMS } from './mockData.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

const STORAGE_KEY_ITEMS = 'back2u_items_v2';
const STORAGE_KEY_CLAIMS = 'back2u_claims_v2';

// Ensure previous version keys are cleaned
try {
  localStorage.removeItem('back2u_items_v1');
  localStorage.removeItem('back2u_claims_v1');
} catch {
  // ignore
}

export const itemService = {
  // Fetch all items (MongoDB Atlas -> Supabase -> LocalStorage)
  async getItems() {
    // 1. Try MongoDB Atlas Serverless API
    try {
      const res = await fetch('/api/items');
      if (res.ok) {
        const data = await res.json();
        if (data.connected && Array.isArray(data.items)) {
          // Cache in local storage for instant offline loading
          localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(data.items));
          return data.items;
        }
      }
    } catch {
      // API not available or offline, fallback to Supabase / LocalStorage
    }

    // 2. Try Supabase fallback
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((row) => ({
            id: row.id,
            title: row.title,
            reportType: row.report_type || 'FOUND',
            category: row.category,
            description: row.description,
            location: row.location_found || row.location,
            date: row.date_found || row.date,
            imageUrl: row.image_url,
            status: row.status,
            finderOrSeekerName: row.finder_name,
            rollNumber: row.finder_roll_no,
            classDepartment: row.finder_class,
            contactPhone: row.contact_phone,
            contactEmail: row.contact_email,
            officeHandoverLocation: row.office_handover_location,
            createdAt: row.created_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local store:', err);
      }
    }

    // 3. LocalStorage fallback
    const stored = localStorage.getItem(STORAGE_KEY_ITEMS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_ITEMS;
    }
  },

  // Save new item (MongoDB Atlas + Supabase + LocalStorage)
  async createItem(item) {
    const newItem = {
      ...item,
      id: 'item-' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    // 1. Save to MongoDB Atlas
    try {
      await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
    } catch {
      // offline / local fallback
    }

    // 2. Save to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('items').insert({
          title: newItem.title,
          report_type: newItem.reportType,
          category: newItem.category,
          description: newItem.description,
          location_found: newItem.location,
          date_found: newItem.date,
          image_url: newItem.imageUrl,
          status: newItem.status,
          finder_name: newItem.finderOrSeekerName,
          finder_roll_no: newItem.rollNumber,
          finder_class: newItem.classDepartment,
          contact_phone: newItem.contactPhone,
          contact_email: newItem.contactEmail,
          office_handover_location: newItem.officeHandoverLocation,
        });
      } catch (err) {
        console.warn('Supabase insert failed, saved to local cache:', err);
      }
    }

    // 3. Update LocalStorage cache
    const items = await this.getItems();
    const updated = [newItem, ...items.filter((it) => it.id !== newItem.id)];
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(updated));
    return newItem;
  },

  // Automatically delete item when claimed/returned
  async deleteItem(itemId) {
    // 1. Delete from MongoDB Atlas
    try {
      await fetch(`/api/items?id=${encodeURIComponent(itemId)}`, {
        method: 'DELETE',
      });
    } catch {
      // local fallback
    }

    // 2. Delete from Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('items').delete().eq('id', itemId);
      } catch (err) {
        console.warn('Supabase delete failed:', err);
      }
    }

    // 3. Delete from LocalStorage
    const items = await this.getItems();
    const remainingItems = items.filter((item) => item.id !== itemId);
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(remainingItems));

    // Also clean any claims for this item
    const claims = await this.getClaims();
    const remainingClaims = claims.filter((c) => c.itemId !== itemId);
    localStorage.setItem(STORAGE_KEY_CLAIMS, JSON.stringify(remainingClaims));

    return remainingItems;
  },

  // Update item status (if marked as returned, automatically deletes it)
  async updateItemStatus(itemId, status) {
    if (status === 'RETURNED') {
      return await this.deleteItem(itemId);
    }

    // 1. Update in MongoDB Atlas
    try {
      await fetch('/api/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, status }),
      });
    } catch {
      // local fallback
    }

    // 2. Update in Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('items').update({ status }).eq('id', itemId);
      } catch (err) {
        console.warn('Supabase update failed:', err);
      }
    }

    // 3. Update in LocalStorage
    const items = await this.getItems();
    const updated = items.map((item) =>
      item.id === itemId ? { ...item, status } : item
    );
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(updated));
    return updated;
  },

  // Fetch claims
  async getClaims() {
    try {
      const res = await fetch('/api/claims');
      if (res.ok) {
        const data = await res.json();
        if (data.connected && Array.isArray(data.claims)) {
          localStorage.setItem(STORAGE_KEY_CLAIMS, JSON.stringify(data.claims));
          return data.claims;
        }
      }
    } catch {
      // fallback
    }

    const stored = localStorage.getItem(STORAGE_KEY_CLAIMS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_CLAIMS, JSON.stringify(INITIAL_CLAIMS));
      return INITIAL_CLAIMS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_CLAIMS;
    }
  },

  // Submit a claim
  async submitClaim(claimData) {
    const newClaim = {
      ...claimData,
      id: 'claim-' + Date.now(),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClaim),
      });
    } catch {
      // fallback
    }

    const claims = await this.getClaims();
    const updatedClaims = [newClaim, ...claims];
    localStorage.setItem(STORAGE_KEY_CLAIMS, JSON.stringify(updatedClaims));

    // Update item status to CLAIM_PENDING
    await this.updateItemStatus(claimData.itemId, 'CLAIM_PENDING');

    return newClaim;
  },

  // Update claim status: when APPROVED, automatically deletes the item from feed!
  async updateClaimStatus(claimId, status) {
    try {
      await fetch('/api/claims', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: claimId, status }),
      });
    } catch {
      // fallback
    }

    const claims = await this.getClaims();
    let targetItemId = null;

    const updatedClaims = claims.map((c) => {
      if (c.id === claimId) {
        targetItemId = c.itemId;
        return { ...c, status };
      }
      return c;
    });

    localStorage.setItem(STORAGE_KEY_CLAIMS, JSON.stringify(updatedClaims));

    if (targetItemId) {
      if (status === 'APPROVED') {
        // Automatically delete the item from the feed when claimed!
        await this.deleteItem(targetItemId);
      } else {
        await this.updateItemStatus(targetItemId, 'AVAILABLE');
      }
    }
  },

  // Reset to clean empty state
  resetDemoData() {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_CLAIMS, JSON.stringify([]));
    localStorage.removeItem('back2u_items_v1');
    localStorage.removeItem('back2u_claims_v1');
  }
};
