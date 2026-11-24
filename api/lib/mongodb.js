import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
};

let client;
let clientPromise;

export const isMongoConfigured = Boolean(
  uri && 
  (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'))
);

if (isMongoConfigured) {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export async function getDatabase(dbName = 'back2u') {
  if (!isMongoConfigured) {
    return null;
  }
  try {
    const clientInstance = await clientPromise;
    return clientInstance.db(dbName);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    return null;
  }
}
