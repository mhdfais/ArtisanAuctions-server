import mongoose, { ObjectId, Types } from "mongoose";

export interface IWallet extends Document {
  _id: ObjectId;
  userId: string | mongoose.Types.ObjectId | null;
  balance: number;
  holds?: [
    {
      artworkId: Types.ObjectId;
      amount: Number;
    }
  ];
}
