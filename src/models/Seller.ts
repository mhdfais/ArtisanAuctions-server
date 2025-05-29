import mongoose, { Schema } from "mongoose";
import { ISeller } from "../interfaces/ISeller";
import { ApprovalRequestStatus } from "../enums/commonEnums";

const sellerSchema = new Schema<ISeller>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  sellerSince: { type: Date },
  approvalStatus: {
    type: String,
    enum: Object.values(ApprovalRequestStatus),
    default: ApprovalRequestStatus.PENDING,
    required: true,
  },
  totalSales:{type:String},
  address: { type: String, required: true },
  identificationNumber: { type: String, required: true },
  isActive: { type: Boolean, default: false },
});

export default mongoose.model('Seller',sellerSchema)