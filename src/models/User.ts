import mongoose, { Model, Schema, Document } from "mongoose";
import { IUser } from "../interfaces/IUser";
import { Roles } from "../enums/commonEnums";

export interface UserDocument extends IUser, Document {
  _id: mongoose.Types.ObjectId;
}

export interface UserModel extends Model<UserDocument> {
  // Add any static methods here if needed
}

const userSchema = new Schema<UserDocument>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    profileImage: { type: String },
    googleId: { type: String, default: null },
    bio: { type: String, default: "" },
    joinedAt: { type: Date, default: Date.now },
    role: {
      type: String,
      enum: Object.values(Roles),
      default: Roles.USER,
      required: true,
    },
    isBlocked: { type: Boolean, default: false },
    bids: [{ type: String }],
    listings: [{ type: String }],
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet" },
    fcmToken: { type: String, default: null },
    refreshToken: { type: String },
    isSeller: { type: Boolean, default: false },
    sellerId: { type: Schema.Types.ObjectId, ref: "Seller", default: null },
  },
  { timestamps: true }
);


export default mongoose.model<UserDocument, UserModel>('User', userSchema);
