import { ObjectId, Types } from "mongoose";
import { IArtwork } from "./IArtwork";

export interface IAuctionWon extends Document {
  _id: ObjectId;
  artworkId: Types.ObjectId;
  winnerId: ObjectId;
  sellerId: ObjectId;
  bidId: ObjectId;
  amount: number;
  address?: {
    place: string;
    address: string;
    pincode: number;
    state: string;
    district: string;
  };
  platformCharge: number;
  amountToSeller: number;
  paymentStatus: string;
  receiptUrl: string;
  status:string
  createdAt: Date;
}

export interface IPopulatedAuctionWon extends Omit<IAuctionWon, "artworkId"> {
  artworkId: IArtwork;
}
