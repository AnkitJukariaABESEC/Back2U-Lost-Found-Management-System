import { MongoClient } from 'mongodb';

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
};

let client = null;
let clientPromise = null;

export function getMongoUri() {
  return process.env.MONGODB_URI || '';
}

export function isMongoConfigured() {
  const uri = getMongoUri();
  return Boolean(
    uri && 
    (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'))
  );
}

export async function getDatabase(dbName = 'back2u') {
  const uri = getMongoUri();
  if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
    return { db: null, error: 'MONGODB_URI is not configured in Vercel environment variables' };
  }

  try {
    if (!clientPromise) {
      client = new MongoClient(uri, options);
      clientPromise = client.connect();
    }
    const clientInstance = await clientPromise;
    return { db: clientInstance.db(dbName), error: null };
  } catch (err) {
    // Reset so subsequent requests can retry instead of caching the rejected promise
    client = null;
    clientPromise = null;
    console.error('MongoDB connection failure:', err);
    return {
      db: null,
      error: err.message || String(err),
      name: err.name || 'ConnectionError',
      code: err.code || null,
    };
  }
}
