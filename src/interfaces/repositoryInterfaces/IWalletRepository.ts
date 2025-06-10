import { ObjectId } from "mongoose";
import { IWallet } from "./../IWallet";

export interface IWalletRepository {
  findByUserId(userId: string): Promise<IWallet | null>;
  create(balance: number): Promise<IWallet>
  updateBalance(walletId: string, amount: number): Promise<IWallet>;
  findByAndUpdate(id: string, userId: string):Promise<IWallet | null>
  findById(id:string):Promise<IWallet|null>
  // getWallet(userId:string):Promise<IWallet|null>
}
