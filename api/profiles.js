import { getDatabase, isMongoConfigured } from './lib/mongodb.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!isMongoConfigured()) {
    return res.status(200).json({
      connected: false,
      message: 'MONGODB_URI not configured in Vercel environment variables',
      profiles: [],
    });
  }

  const { db, error } = await getDatabase();
  if (!db) {
    return res.status(200).json({
      connected: false,
      error: error || 'Failed to connect to MongoDB cluster',
      profiles: [],
    });
  }

  const collection = db.collection('profiles');

  try {
    // GET: Query profiles by email, roll number, admission number, or list
    if (req.method === 'GET') {
      const { email, query } = req.query || {};

      if (email) {
        const cleanEmail = email.trim().toLowerCase();
        const profile = await collection.findOne({
          email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') },
        });

        if (profile) {
          const { _id, ...rest } = profile;
          return res.status(200).json({ success: true, profile: rest });
        }
        return res.status(404).json({ success: false, message: 'Profile not found' });
      }

      if (query) {
        const cleanQuery = query.trim().toLowerCase();
        const profile = await collection.findOne({
          $or: [
            { email: { $regex: new RegExp(`^${cleanQuery}$`, 'i') } },
            { rollNumber: { $regex: new RegExp(`^${cleanQuery}$`, 'i') } },
            { admissionNumber: { $regex: new RegExp(`^${cleanQuery}$`, 'i') } },
            { id: query },
          ],
        });

        if (profile) {
          const { _id, ...rest } = profile;
          return res.status(200).json({ success: true, profile: rest });
        }
        return res.status(404).json({ success: false, message: 'Profile not found' });
      }

      // Return all profiles
      const docs = await collection.find({}).toArray();
      const profiles = docs.map((d) => {
        const { _id, ...rest } = d;
        return rest;
      });

      return res.status(200).json({ connected: true, profiles });
    }

    // POST: Upsert profile (Insert new or update existing)
    if (req.method === 'POST') {
      const profileData = req.body;
      if (!profileData || !profileData.email) {
        return res.status(400).json({ error: 'Email is required for Campus Profile' });
      }

      const cleanEmail = profileData.email.trim().toLowerCase();
      const profileToSave = {
        ...profileData,
        email: cleanEmail,
        id: profileData.id || 'usr-' + Date.now(),
        updatedAt: new Date().toISOString(),
      };

      await collection.updateOne(
        { email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } },
        { $set: profileToSave },
        { upsert: true }
      );

      return res.status(200).json({
        success: true,
        connected: true,
        profile: profileToSave,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API /api/profiles error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
