import { injectable } from "tsyringe";
import { IUser } from "../interfaces/IUser";
import { IUserRepository } from "../interfaces/repositoryInterfaces/IUserRepository";
import User, { UserDocument } from "../models/User";
import { CustomError } from "../errors/customError";
import HttpStatusCode from "../enums/httpStatusCodes";
import { verifyRefreshToken } from "../utils/generateToken";

@injectable()
export class UserRepository implements IUserRepository {
  async createUser(data: IUser): Promise<UserDocument> {
    return await User.create(data);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return User.findOne({ email });
  }

  async resetPasswordByEmail(
    hashPassword: string,
    email: string
  ): Promise<void> {
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { password: hashPassword } },
      { new: true }
    );
    if (!user)
      throw new CustomError(
        "Failed to update password",
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
  }

  async findById(id: string): Promise<UserDocument | null> {
    return await User.findById(id);
  }

  async updateRefreshToken(id: string, token: string): Promise<void | null> {
    return User.findByIdAndUpdate(id, { refreshToken: token });
  }

  async findByRefreshToken(refreshToken: string): Promise<UserDocument | null> {
    return User.findOne({ refreshToken });
  }

  async updateProfile(
    id: string,
    data: Partial<UserDocument>
  ): Promise<UserDocument | null> {
    return User.findByIdAndUpdate(id, data);
  }

  async updateFcmToken(
    userId: string,
    fcmToken: string
  ): Promise<UserDocument | null> {
    return User.findByIdAndUpdate(userId, { fcmToken }, { new: true });
  }

  async addtoListing(
    userId: string,
    artworkId: string
  ): Promise<UserDocument | null> {
    return User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { listings: artworkId },
      },
      { new: true }
    );
  }

  // async updatePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
  //   const user=await User.findById(id)

  // }
}
