import mongoose, { Schema } from "mongoose";
import { IWallet } from "../interfaces/IWallet";

const WalletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    balance: { type: Number, required: true, default: 0 },
    holds: [
      {
        artworkId: { type: Schema.Types.ObjectId, ref: "Artwork" },
        amount: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Wallet", WalletSchema);
