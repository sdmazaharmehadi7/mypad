import tls from 'tls';
import { MongoClient } from 'mongodb';

// Ensure Node 24+ negotiates TLS 1.2 with MongoDB Atlas to avoid OpenSSL 3.3 TLS 1.3 handshake alert 80
if (typeof tls !== 'undefined' && tls.DEFAULT_MAX_VERSION && tls.DEFAULT_MAX_VERSION !== 'TLSv1.2') {
  try {
    tls.DEFAULT_MAX_VERSION = 'TLSv1.2';
  } catch {
    // ignore if immutable in certain runtimes
  }
}

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
};

let clientPromise;

/**
 * Returns a Promise that resolves to the connected MongoClient.
 * Uses a global variable in development to preserve the connection
 * across Next.js hot module reloads, preventing connection leaks.
 */
export function getMongoClientPromise() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      'MONGODB_URI environment variable is missing. Please set MONGODB_URI in your .env.local file.'
    );
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect().catch((err) => {
        global._mongoClientPromise = null;
        throw err;
      });
    }
    return global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      const client = new MongoClient(uri, options);
      clientPromise = client.connect().catch((err) => {
        clientPromise = null;
        throw err;
      });
    }
    return clientPromise;
  }
}

/**
 * Helper to get the target MongoDB database.
 * Default database: "mypad"
 */
export async function getDb(dbName = 'mypad') {
  const client = await getMongoClientPromise();
  return client.db(dbName);
}
