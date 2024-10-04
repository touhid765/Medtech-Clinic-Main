import mongoose from 'mongoose';
import { MongoClient, GridFSBucket } from 'mongodb';

let gfs;
let bucket;

export const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected: ", conn.connection.host);

    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db();
    bucket = new GridFSBucket(db);

    console.log("GridFS initialized");

  } catch (error) {
    console.error("Error connecting MongoDB: ", error.message);
    process.exit(1);
  }
};

// Export GridFS instance for use in other modules
export { bucket };
