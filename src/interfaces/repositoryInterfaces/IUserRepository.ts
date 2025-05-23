import { UserDocument } from "../../models/User";

export interface IUserRepository {
  findByEmail(email: string): Promise<UserDocument | null>;
  createUser(data:Partial<UserDocument>):Promise<UserDocument>
  updatePasswordByEmail(hashPassword:string,email:string):Promise<void>
  findById(id:string):Promise<Partial<UserDocument> | null>
  updateRefreshToken(id: string, token: string):Promise<void | null>
  clearRefreshToken (id: string):Promise<void | null>
}
