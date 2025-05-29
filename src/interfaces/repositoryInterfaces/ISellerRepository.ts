import { ISeller } from "../ISeller";

export interface ISellerRepository {
  // getSellerStatus(userId: string): Promise<ISeller | null>;
  findById(id: string): Promise<ISeller | null>;
  updateApprovalStatus(
    id: string,
    status: string,
    isActive?: boolean
  ): Promise<ISeller | null>;
}
