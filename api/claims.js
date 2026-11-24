import { getDatabase, isMongoConfigured } from './lib/mongodb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!isMongoConfigured) {
    return res.status(200).json({
      connected: false,
      claims: [],
    });
  }

  const db = await getDatabase();
  if (!db) {
    return res.status(500).json({ error: 'Failed to connect to MongoDB cluster' });
  }

  const collection = db.collection('claims');

  try {
    if (req.method === 'GET') {
      const claims = await collection.find({}).sort({ createdAt: -1 }).toArray();
      const cleaned = claims.map((doc) => {
        const { _id, ...rest } = doc;
        return { id: rest.id || _id.toString(), ...rest };
      });
      return res.status(200).json({ connected: true, claims: cleaned });
    }

    if (req.method === 'POST') {
      const claimData = req.body;
      const newClaim = {
        ...claimData,
        id: claimData.id || 'claim-' + Date.now(),
        status: claimData.status || 'PENDING',
        createdAt: claimData.createdAt || new Date().toISOString(),
      };
      await collection.insertOne(newClaim);
      return res.status(201).json({ success: true, claim: newClaim });
    }

    if (req.method === 'PATCH') {
      const { id, status } = req.body || {};
      if (!id || !status) {
        return res.status(400).json({ error: 'Claim ID and status required' });
      }
      await collection.updateOne({ id }, { $set: { status, updatedAt: new Date().toISOString() } });
      return res.status(200).json({ success: true, id, status });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API /api/claims error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
