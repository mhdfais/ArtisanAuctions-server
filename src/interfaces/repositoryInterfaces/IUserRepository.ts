import { UserDocument } from "../../models/User";

export interface IUserRepository {
  findByEmail(email: string): Promise<UserDocument | null>;
  createUser(data: Partial<UserDocument>): Promise<UserDocument>;
  resetPasswordByEmail(hashPassword: string, email: string): Promise<void>;
  findById(id: string): Promise<UserDocument | null>;
  updateRefreshToken(id: string, token: string): Promise<void | null>;
  findByRefreshToken(refreshToken: string): Promise<UserDocument | null>;
  updateProfile(id: string, data: Partial<UserDocument>): Promise<UserDocument | null>
  updateFcmToken(userId: string, fcmToken: string): Promise<UserDocument | null>
  // updatePassword(id:string,currentPassword:string,newPassword:string):Promise<void>
}
