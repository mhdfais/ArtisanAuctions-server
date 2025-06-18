import { UserDocument } from "../../models/User";
import { IPopulatedSeller } from "../IUser";

export interface IUserRepository {
  findByEmail(email: string): Promise<UserDocument | null>;
  createUser(data: Partial<UserDocument>): Promise<UserDocument>;
  resetPasswordByEmail(hashPassword: string, email: string): Promise<void>;
  findById(id: string): Promise<UserDocument | null>;
  updateRefreshToken(id: string, token: string): Promise<void | null>;
  findByRefreshToken(refreshToken: string): Promise<UserDocument | null>;
  updateProfile(
    id: string,
    data: Partial<UserDocument>
  ): Promise<UserDocument | null>;
  updateFcmToken(
    userId: string,
    fcmToken: string
  ): Promise<UserDocument | null>;
  addtoListing(userId: string, artworkId: string): Promise<UserDocument | null>;
  findAllUsers(): Promise<UserDocument[]>
  findAllSellers():Promise<IPopulatedSeller[]>
  // updatePassword(id:string,currentPassword:string,newPassword:string):Promise<void>
}
