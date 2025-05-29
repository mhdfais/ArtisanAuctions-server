
import { Types } from "mongoose";
import { ApprovalRequestStatus, ApprovalRequestType } from "../enums/commonEnums";

export interface IApprovalRequest {
  _id?: Types.ObjectId;
  requester: Types.ObjectId;
  type: ApprovalRequestType;
  targetRef?: Types.ObjectId; 
  targetModel:string
  status: ApprovalRequestStatus;
  reason?: string;
  createdAt?: Date;
}