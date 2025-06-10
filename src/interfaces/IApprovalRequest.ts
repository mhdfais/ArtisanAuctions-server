
import { ObjectId, Types } from "mongoose";
import { ApprovalRequestStatus, ApprovalRequestType } from "../enums/commonEnums";

export interface IApprovalRequest {
  _id?: Types.ObjectId;
  requester: Types.ObjectId;
  type: ApprovalRequestType;
  targetRef: ObjectId|string; 
  targetModel:string
  status?: ApprovalRequestStatus;
  reason?: string;
  createdAt?: Date;
}