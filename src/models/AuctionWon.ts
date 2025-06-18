import mongoose, { Schema } from "mongoose";
import { IAuctionWon } from "../interfaces/IAuctionWon";

const auctionWonSchema = new Schema<IAuctionWon>({
  artworkId: { type: Schema.Types.ObjectId, ref: "Artwork", required: true },
  winnerId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  sellerId: { type: mongoose.Types.ObjectId, ref: "Seller", required: true },
  bidId: { type: mongoose.Types.ObjectId, ref: "Bid", required: true },
  address: {
    address: { type: String },
    state: { type: String },
    district: { type: String },
    place: { type: String },
    pincode: { type: Number },
  },
  amount: { type: Number, required: true },
  platformCharge: { type: Number, required: true },
  amountToSeller: { type: Number, required: true },
  paymentStatus: { type: String, required: true },
  receiptUrl: { type: String },
  status: {
    type: String,
    enum: ["pending", "shipped", "delivered"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("AuctionWon", auctionWonSchema);
