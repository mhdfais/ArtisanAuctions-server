import mongoose, { model, Schema, Types } from "mongoose";
import { IApprovalRequest } from "../interfaces/IApprovalRequest";
import { ApprovalRequestStatus, ApprovalRequestType } from "../enums/commonEnums";

const approvalRequestSchema = new Schema<IApprovalRequest>({
  requester: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: Object.values(ApprovalRequestType),
    required: true,
  },
   targetRef: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetModel'
  },
  targetModel: {
    type: String,
    required: true,
    enum: ['Seller', 'Artwork']
  },
  status: {
    type: String,
    enum: Object.values(ApprovalRequestStatus),
    default: ApprovalRequestStatus.PENDING,
    required: true,
  },
  reason: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('ApprovalRequest',approvalRequestSchema)