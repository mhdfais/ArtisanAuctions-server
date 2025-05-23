import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("mongo uri not found");
    }
    await mongoose.connect(uri);
    console.log("db connected");
  } catch (error) {
    console.error("error from db", error);
  }
};
