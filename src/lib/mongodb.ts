import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = { appName: 'haircut-ai-grooming' };

declare global {
  // eslint-disable-next-line no-var
  var haircutMongoClient: MongoClient | undefined;
}

const client = global.haircutMongoClient ?? new MongoClient(
  uri || 'mongodb://127.0.0.1:27017/haircut',
  options,
);

if (process.env.NODE_ENV !== 'production') global.haircutMongoClient = client;

export const clientPromise = Promise.resolve(client);

export async function getDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MongoDB is not configured. Set MONGODB_URI before using account features.');
  }
  return client.db(process.env.MONGODB_DB_NAME || 'haircut');
}
