import mongoose, { Schema } from "mongoose";
import { IArtwork } from "../interfaces/IArtwork";

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

const artSchema = new Schema<IArtwork>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      required: [true, "Seller ID is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      minlength: [3, "Title must be at least 3 characters"],
    },
    yearCreated: {
      type: Number,
      min: [1000, "Year must be valid"],
      max: [new Date().getFullYear(), "Year cannot be in the future"],
    },
    dimensions: {
      height: { type: Number, required: true },
      width: { type: Number, required: true },
    },
    category: {
      type: String,
      enum: Object.values(ArtCategory),
      required: [true, "Category is required"],
    },
    medium: {
      type: String,
      enum: Object.values(Medium),
      required: [true, "Medium is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [30, "Description must be at least 30 characters"],
    },
    images: {
      type: [String],
      required: true,
    },

    auctionStartTime: { type: Date },
    auctionEndTime: { type: Date },
    reservePrice: {
      type: Number,
      min: [0, "Reserve price must be positive"],
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: null,
    },

    highestBid: {
      type: Number,
      default: 0,
    },
    highestBidderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    winnerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isEnded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Artwork", artSchema);
