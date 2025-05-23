import mongoose, { ObjectId } from "mongoose";
import { Roles } from "../enums/commonEnums";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  name: string;
  phone?: string;
  email: string;
  password?: string;
  profileImage?: string;
  googleId?: string | null;
  bio?: string;
  joinedAt?: Date;
  role: Roles.ADMIN | Roles.USER;
  isBlocked?: boolean;
  bids?: string[];
  listings?: string[];
  walletId: ObjectId | string;
  fcmToken?: string;
  refreshToken?:string
  isSeller: boolean;
  sellerId?: ObjectId | string;
}
