import { ObjectId } from "mongoose";
import { IWallet } from "../interfaces/IWallet";
import { IWalletRepository } from "../interfaces/repositoryInterfaces/IWalletRepository";
import Wallet from "../models/Wallet";
import { CustomError } from "../errors/customError";
import HttpStatusCode from "../enums/httpStatusCodes";

export class WalletRepository implements IWalletRepository{
    async create(wallet:Partial<IWallet>):Promise<IWallet>{
        try {
            const newWallet=new Wallet(wallet)
            return await newWallet.save()
        } catch (error) {
            console.error(error)
            throw new CustomError('Failed to create wallet',HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async update(id: string | ObjectId, wallet: Partial<IWallet>): Promise<IWallet> {
        try {
            const updatedWallet=await Wallet.findByIdAndUpdate(id,wallet,{new:true})
            if(!updatedWallet) throw new CustomError('wallet not found',HttpStatusCode.NOT_FOUND)
                return updatedWallet
        } catch (error) {
            throw new CustomError('failed to update wallet',HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }
}