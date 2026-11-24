import { getDatabase, isMongoConfigured } from './lib/mongodb.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!isMongoConfigured) {
    return res.status(200).json({
      connected: false,
      message: 'MONGODB_URI not configured in environment variables',
      items: [],
    });
  }

  const db = await getDatabase();
  if (!db) {
    return res.status(500).json({
      connected: false,
      error: 'Failed to connect to MongoDB cluster',
    });
  }

  const collection = db.collection('items');

  try {
    // GET: Retrieve all active items
    if (req.method === 'GET') {
      const items = await collection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      // Clean MongoDB _id to string or remove to match frontend structure
      const cleaned = items.map((doc) => {
        const { _id, ...rest } = doc;
        return {
          id: rest.id || _id.toString(),
          ...rest,
        };
      });

      return res.status(200).json({
        connected: true,
        items: cleaned,
      });
    }

    // POST: Create a new reported lost/found item
    if (req.method === 'POST') {
      const itemData = req.body;
      if (!itemData || !itemData.title) {
        return res.status(400).json({ error: 'Item title is required' });
      }

      const newItem = {
        ...itemData,
        id: itemData.id || 'item-' + Date.now(),
        createdAt: itemData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await collection.insertOne(newItem);

      return res.status(201).json({
        success: true,
        item: newItem,
      });
    }

    // PATCH: Update status (e.g. CLAIM_PENDING, RETURNED)
    if (req.method === 'PATCH') {
      const { id, status } = req.body || {};
      if (!id || !status) {
        return res.status(400).json({ error: 'Item ID and status required' });
      }

      const result = await collection.updateOne(
        { id },
        { $set: { status, updatedAt: new Date().toISOString() } }
      );

      return res.status(200).json({
        success: true,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      });
    }

    // DELETE: Delete item once approved or returned
    if (req.method === 'DELETE') {
      const { id } = req.query || req.body || {};
      if (!id) {
        return res.status(400).json({ error: 'Item ID is required for deletion' });
      }

      await collection.deleteOne({ id });
      return res.status(200).json({ success: true, deletedId: id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API /api/items error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
