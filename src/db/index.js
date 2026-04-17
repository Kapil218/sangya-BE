import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const buildMongoUri = () => {
  const rawUri = process.env.MONGODB_URI?.trim();

  if (!rawUri) {
    throw new Error(
      "MONGODB_URI is not set. Add a valid mongodb:// or mongodb+srv:// URI."
    );
  }

  const normalizedUri = /^mongodb(\+srv)?:\/\//i.test(rawUri)
    ? rawUri
    : `mongodb://${rawUri}`;

  const connectionUrl = new URL(normalizedUri);
  const dbPath = connectionUrl.pathname.replace(/^\/+|\/+$/g, "");

  connectionUrl.pathname = dbPath ? `/${dbPath}` : `/${DB_NAME}`;

  return connectionUrl.toString();
};

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(buildMongoUri());
    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB connection error ", error);
    process.exit(1);
  }
};

export default connectDB;
