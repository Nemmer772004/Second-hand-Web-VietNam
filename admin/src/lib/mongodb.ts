import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "luxhome";

let cachedClient: MongoClient | null = null;

export async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = await MongoClient.connect(uri);
  cachedClient = client;
  return client;
}

export async function getCollection(collectionName: string) {
  const client = await connectToDatabase();
  const db = client.db(dbName);
  return db.collection(collectionName);
}
