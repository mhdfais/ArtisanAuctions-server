import { UserDocument } from "../../models/User";
import { IArtwork } from "../IArtwork";
import { IAuctionWon } from "../IAuctionWon";
import { IBid } from "../IBid";
import { ISeller } from "../ISeller";
import { ITransaction } from "../ITransaction";
import { IUser } from "../IUser";

export interface IUserService {
  sentOtp(email: string, session: any): Promise<void>;
  verifyOtp(inputOtp: string, session: any): Promise<boolean>;
  registerData(name: string, email: string, password: string): Promise<IUser>;
  resetPassword(newPassword: string, email: string): Promise<void>;
  findByEmailAndSentOtp(emaiil: string, session: any): Promise<void>;
  refresh(refreshToken: string): Promise<any>;
  logout(userId: string): Promise<void>;
  login(email: string, password: string): Promise<any>;
  getUserDetails(id: string): Promise<UserDocument | null>;
  updateProfile(
    id: string,
    data: Partial<UserDocument>
  ): Promise<UserDocument | null>;
  applyForSeller(id: string, idNumber: string, address: string): Promise<void>;
  getSellerStatus(userId: string): Promise<ISeller | null>;
  updatePassword(
    email: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void>;
  addArtwork(
    userId: string,
    data: any,
    files: Express.Multer.File[]
  ): Promise<void>;
  getArtworks(userId: string): Promise<IArtwork[] | null>;
  scheduleAuction(
    artworkId: string,
    startTime: string,
    endTime: string
  ): Promise<void>;
  getAllArtworks(): Promise<IArtwork[] | null>;
  getArtworkById(id: string): Promise<IArtwork | null>;
  getArtworkBidHistory(artworkId: string): Promise<IBid[] | null>;
  getBids(userId: string): Promise<any>;
  getTransactions(userId: string): Promise<ITransaction[] | null>;
  getWonAuctions(winnerId: string): Promise<any>;
  updateAddress(wonAuctionId:string,addressData:object):Promise<void>
  getSellerWonAuctions(userId: string):Promise<any>
  updateStatusAsShipped(id:string):Promise<void>
}
