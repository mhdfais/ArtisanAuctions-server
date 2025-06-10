import { ObjectId } from "mongoose";

export interface ITransaction extends Document {
  _id: ObjectId;
  walletId: ObjectId;
  amount: number;
  type: "deposit" | "withdrawal" | "transfer" | "bid";
  status: "pending" | "completed" | "failed";
  stripePaymentIntendId: string; 
  createdAt: Date;
}
