import mongoose, { Schema } from "mongoose";
import { IAuctionWon } from "../interfaces/IAuctionWon";

const auctionWonSchema=new Schema<IAuctionWon>({
    artworkId:{type:mongoose.Types.ObjectId,ref:'Artwork',required:true},
    winnerId:{type:mongoose.Types.ObjectId,ref:'User',required:true},
    sellerId:{type:mongoose.Types.ObjectId,ref:'Seller',required:true},
    bidId:{type:mongoose.Types.ObjectId,ref:'Bid',required:true},
    amount:{type:Number,required:true},
    platformCharge:{type:Number,required:true},
    amountToSeller:{type:Number,required:true},
    paymentStatus:{type:String,required:true},
    receiptUrl:{type:String},
    createdAt:{type:Date,default:Date.now}
})

export default mongoose.model('AuctionWon',auctionWonSchema)