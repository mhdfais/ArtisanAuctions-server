import mongoose, { Schema } from "mongoose";
import { ITransaction } from "../interfaces/ITransaction";

const tranactionSchema = new Schema<ITransaction>({
  walletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true },
  amount: { type: Number, required: true },
  type: {
    type: String,
    enum: ["deposit", "withdrawal", "transfer", "bid"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  stripePaymentIntendId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Transaction',tranactionSchema)
