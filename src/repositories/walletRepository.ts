import { ObjectId } from "mongoose";
import { IWallet } from "../interfaces/IWallet";
import { IWalletRepository } from "../interfaces/repositoryInterfaces/IWalletRepository";
import Wallet from "../models/Wallet";
import { CustomError } from "../errors/customError";
import HttpStatusCode from "../enums/httpStatusCodes";

export class WalletRepository implements IWalletRepository {
  async findByUserId(userId: string): Promise<IWallet | null> {
    return Wallet.findOne({ userId });
  }

  async create(balance: number): Promise<IWallet> {
    return Wallet.create({ balance: 0 });
  }

  async findByAndUpdate(id: string, userId: string):Promise<IWallet | null> {
    return await Wallet.findByIdAndUpdate(id, {
      userId,
    });
  }

  async updateBalance(walletId: string, amount: number): Promise<IWallet> {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) throw new Error("Wallet not found");
    wallet.balance += amount;
    return wallet.save();
  }

  async getWallet(userId:string):Promise<IWallet|null>{
    return await Wallet.findOne({userId})
  }

  async findById(id:string):Promise<IWallet|null>{
    return await Wallet.findById(id)
  }
}
