import mongoose, { Schema } from "mongoose";
import { IWallet } from "../interfaces/IWallet";

const WalletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    availableBalance: { type: Number, required: true, default: 0 },
    reservedBalance: {
      type: Number,
      required: true,
      min: [0, "reserved balance cannot be negative"],
    },
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Wallet", WalletSchema);
