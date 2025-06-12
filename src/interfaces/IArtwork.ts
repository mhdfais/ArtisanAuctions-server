import { Document, ObjectId } from "mongoose";

export enum ArtCategory {
  PAINTING = "Painting",
  SCULPTURE = "Sculpture",
  PHOTOGRAPHY = "Photography",
  OTHER = "Other",
}

export enum Medium {
  OIL = "Oil",
  ACRYLIC = "Acrylic",
  WATERCOLOR = "Watercolor",
  INK = "Ink",
  CHARCOAL = "Charcoal",
  MIXED = "Mixed",
  OTHER = "Other",
}

export interface IArtwork extends Document {
  _id: string | ObjectId;
  sellerId?: ObjectId | string;
  title: string;
  yearCreated: number;
  dimensions: {
    height: number;
    width: number;
  };
  category: ArtCategory;
  medium: Medium;
  description: string;
  images: string[];

  auctionStartTime?: Date;
  auctionEndTime?: Date;
  reservePrice?: number;
  approvalStatus?: "pending" | "approved" | "rejected";
  rejectionReason?: string;

  highestBid?: number;
  highestBidderId?: ObjectId;
  winnerId?: ObjectId;
  isActive: Boolean;
  isEnded:Boolean
  
  createdAt?: Date;
  updatedAt?: Date;
}
