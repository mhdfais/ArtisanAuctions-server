import { IApprovalRequest } from "../IApprovalRequest";

export interface IAdminService {
  login(email: string, password: string): Promise<any>;
  refresh(refreshToken: string): Promise<any>
  getApprovals():Promise<IApprovalRequest[]|null>
  approve(id: string): Promise<void>
  reject(id: string): Promise<void>
}
