import { IApprovalRequest } from "../IApprovalRequest";

export interface IApprovalRequestRepository{
    createApprovalRequest(data:IApprovalRequest):Promise<IApprovalRequest>
    getApprovals(): Promise<IApprovalRequest[]|null>
    updateApprovalRequestStatus(id: string,status:string): Promise<IApprovalRequest | null>
}