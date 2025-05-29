import { ApprovalRequestStatus } from "../enums/commonEnums";
import { IApprovalRequest } from "../interfaces/IApprovalRequest";
import { IApprovalRequestRepository } from "../interfaces/repositoryInterfaces/IApprovalRequestRepository";
import ApprovalRequest from "../models/ApprovalRequest";

export class ApprovalRequestRepository implements IApprovalRequestRepository {
  async createApprovalRequest(
    data: Partial<IApprovalRequest>
  ): Promise<IApprovalRequest> {
    return ApprovalRequest.create(data);
  }

  async getApprovals(): Promise<IApprovalRequest[] | null> {
    return ApprovalRequest.find({ status: "pending" })
      .populate("targetRef")
      .populate("requester");
  }

  async updateApprovalRequestStatus(id: string,status:string): Promise<IApprovalRequest | null> {
    return ApprovalRequest.findByIdAndUpdate(
      id,
      {
        status: status,
      },
      { new: true }
    );
  }
}
