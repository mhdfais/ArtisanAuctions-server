import { UserDocument } from "../../models/User";
import { IUser } from "../IUser";

export interface IUserService {
  sentOtp(email: string, session: any): Promise<void>;
  verifyOtp(inputOtp: string, session: any): Promise<boolean>;
  registerData(name: string, email: string, password: string): Promise<IUser>;
  resetPassword(newPassword: string, email: string): Promise<void>;
  findByEmailAndSentOtp(emaiil: string, session: any): Promise<void>;
  refresh(refreshToken: string):Promise<any>
  logout(userId:string):Promise<void>
  login(email:string,password:string):Promise<any>
  getUserDetails(id: string):Promise<UserDocument |null>
  updateProfile(id:string,data:Partial<UserDocument>):Promise<UserDocument |null>
}
