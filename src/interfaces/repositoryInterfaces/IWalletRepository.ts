import { ObjectId } from 'mongoose';
import { IWallet } from './../IWallet';

export interface IWalletRepository{
    create(wallet:Partial<IWallet>):Promise<IWallet>
    update(id: string | ObjectId, wallet: Partial<IWallet>): Promise<IWallet>;
}