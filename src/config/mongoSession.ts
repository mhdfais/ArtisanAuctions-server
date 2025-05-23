import MongoStore from "connect-mongo";
import dotenv from "dotenv";

dotenv.config();

const session_db_uri = process.env.MONGO_URI;

export const mongoSessionStoreConfig = MongoStore.create({
  mongoUrl: session_db_uri,
  ttl: 2 * 60,
  collectionName: "sessions",
});
