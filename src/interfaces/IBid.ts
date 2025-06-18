import { Types } from "mongoose";
import { IArtwork } from "./IArtwork";

export interface IBid extends Document {
  _id: Types.ObjectId;
  artworkId: Types.ObjectId;
  bidderId: Types.ObjectId;
  bidderName:string
  amount: number;
  placedAt: Date;
}

export interface IPopulatedBid extends Omit<IBid, 'artworkId'> {
  artworkId: IArtwork; 
}