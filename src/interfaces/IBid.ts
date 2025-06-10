import { Types } from "mongoose";

export interface IBid extends Document {
  _id: Types.ObjectId;
  artworkId: Types.ObjectId;
  bidderId: Types.ObjectId;
  amount: number;
  placedAt: Date;
}
