import mongoose, { ObjectId } from "mongoose";

export interface IWallet extends Document {
    _id:ObjectId
    userId:string | mongoose.Types.ObjectId | null,
    availableBalance:number,
    reservedBalance:number,
    createdAt:Date,
    updatedAt:Date
}