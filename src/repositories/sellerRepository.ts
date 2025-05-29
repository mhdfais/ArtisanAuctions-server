import { ISeller } from "../interfaces/ISeller";
import { ISellerRepository } from "../interfaces/repositoryInterfaces/ISellerRepository";
import { injectable } from "tsyringe";
import Seller from "../models/Seller";

@injectable()
export class SellerRepository implements ISellerRepository {
  // async getSellerStatus(userId: string): Promise<ISeller | null> {
  //   const user=await 
    
  // }

  async findById(id:string):Promise<ISeller|null>{
    return Seller.findById(id)
  }

  async updateApprovalStatus(
    id: string,
    status: string,
    isActive: boolean = false
  ): Promise<ISeller | null> {
    return Seller.findByIdAndUpdate(
      id,
      { approvalStatus: status, isActive },
      { new: true }
    );
  }
}
