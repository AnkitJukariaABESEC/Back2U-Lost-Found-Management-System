import { getDatabase, isMongoConfigured } from './lib/mongodb.js';

// In-memory fallback for environments without MongoDB URI configured
if (!global._verificationsCache) {
  global._verificationsCache = new Map();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const memoryCache = global._verificationsCache;

  // GET: Check verification status across devices (?email=...)
  if (req.method === 'GET') {
    const { email } = req.query || {};
    if (!email) {
      return res.status(400).json({ error: 'Email parameter required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check in MongoDB if configured
    if (isMongoConfigured()) {
      try {
        const { db } = await getDatabase();
        if (db) {
          const record = await db.collection('verifications').findOne({
            email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') },
          });

          if (record && record.status === 'VERIFIED') {
            return res.status(200).json({
              verified: true,
              email: cleanEmail,
              verifiedAt: record.verifiedAt,
            });
          }
        }
      } catch (err) {
        console.warn('MongoDB verification check error:', err);
      }
    }

    // 2. Check in-memory cache fallback
    const memRecord = memoryCache.get(cleanEmail);
    if (memRecord && memRecord.status === 'VERIFIED') {
      return res.status(200).json({
        verified: true,
        email: cleanEmail,
        verifiedAt: memRecord.verifiedAt,
      });
    }

    return res.status(200).json({
      verified: false,
      email: cleanEmail,
    });
  }

  // POST: Create pending token or Mark email as verified
  if (req.method === 'POST') {
    const { action, email, token } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // ACTION: verify (User clicked the link from ANY device)
    if (action === 'verify') {
      const now = new Date().toISOString();

      // Update in-memory cache
      memoryCache.set(cleanEmail, {
        email: cleanEmail,
        status: 'VERIFIED',
        verifiedAt: now,
      });

      // Update in MongoDB
      if (isMongoConfigured()) {
        try {
          const { db } = await getDatabase();
          if (db) {
            await db.collection('verifications').updateOne(
              { email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } },
              {
                $set: {
                  email: cleanEmail,
                  status: 'VERIFIED',
                  verifiedAt: now,
                  updatedAt: now,
                },
              },
              { upsert: true }
            );
          }
        } catch (err) {
          console.warn('MongoDB verification update error:', err);
        }
      }

      return res.status(200).json({
        success: true,
        verified: true,
        email: cleanEmail,
        message: 'Email successfully verified across all devices',
      });
    }

    // ACTION: create (Pending link generated)
    if (action === 'create') {
      const now = new Date().toISOString();

      memoryCache.set(cleanEmail, {
        email: cleanEmail,
        token,
        status: 'PENDING',
        createdAt: now,
      });

      if (isMongoConfigured()) {
        try {
          const { db } = await getDatabase();
          if (db) {
            await db.collection('verifications').updateOne(
              { email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } },
              {
                $set: {
                  email: cleanEmail,
                  token,
                  status: 'PENDING',
                  createdAt: now,
                  updatedAt: now,
                },
              },
              { upsert: true }
            );
          }
        } catch (err) {
          console.warn('MongoDB pending verification save error:', err);
        }
      }

      return res.status(200).json({
        success: true,
        email: cleanEmail,
        message: 'Verification token registered',
      });
    }

    return res.status(400).json({ error: 'Invalid action. Use "create" or "verify".' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
