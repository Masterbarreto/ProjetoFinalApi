import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

export async function getDb() {
  if (!client.topology || client.topology.isDestroyed()) {
    await client.connect();
  }
  return client.db(process.env.DB_NAME);
}
