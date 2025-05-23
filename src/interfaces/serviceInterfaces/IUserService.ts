import { IUser } from "../IUser";

export interface IUserService {
  sentOtp(email: string, session: any): Promise<void>;
  verifyOtp(inputOtp: string, session: any): Promise<boolean>;
  registerData(name: string, email: string, password: string): Promise<IUser>;
  updatePassword(newPassword: string, email: string): Promise<void>;
  findByEmailAndSentOtp(emaiil: string, session: any): Promise<void>;
  refresh(refreshToken: string):Promise<any>
  logout(userId:string):Promise<void>
  login(email:string,password:string):Promise<any>
}
