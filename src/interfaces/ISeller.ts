import { Document, ObjectId, Types } from "mongoose";

export interface ISeller extends Document {
  _id: ObjectId;
  userId: Types.ObjectId;
  sellerSince?: Date;
  approvalStatus: "pending" | "approved" | "rejected";
  address: string;
   totalSales:{type:String},
  identificationNumber: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
