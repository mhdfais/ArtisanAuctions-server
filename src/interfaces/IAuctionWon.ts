import { ObjectId } from "mongoose";

export interface IAuctionWon extends Document{
    _id:ObjectId,
    artworkId:ObjectId,
    winnerId:ObjectId
    sellerId:ObjectId
    bidId:ObjectId,
    amount:Number,
    platformCharge:Number,
    amountToSeller:Number,
    paymentStatus:String,
    receiptUrl:String,
    createdAt:Date
}