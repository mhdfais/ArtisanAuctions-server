import mongoose, { Schema } from "mongoose";
import { IBid } from "../interfaces/IBid";

const bidSchema = new Schema<IBid>(
  {
    artworkId: { type: Schema.Types.ObjectId, ref: "Artwork", required: true },
    bidderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    placedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Bid", bidSchema);
