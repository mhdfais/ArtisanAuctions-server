import { ISellerRepository } from "../interfaces/repositoryInterfaces/ISellerRepository";
import HttpStatusCode from "../enums/httpStatusCodes";
import { CustomError } from "../errors/customError";
import { IUser } from "./../interfaces/IUser";
import { IUserRepository } from "./../interfaces/repositoryInterfaces/IUserRepository";
import { injectable, inject } from "tsyringe";
import { IEmailService } from "../interfaces/serviceInterfaces/IEmailService";
import { IUserService } from "../interfaces/serviceInterfaces/IUserService";
import bcrypt from "bcrypt";
import { generateUniqueId } from "../utils/generateUniqueId";
import { IWallet } from "../interfaces/IWallet";
import { IWalletRepository } from "../interfaces/repositoryInterfaces/IWalletRepository";
import { ApprovalRequestType, Roles } from "../enums/commonEnums";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/generateToken";
import { UserDocument } from "../models/User";
import Seller from "../models/Seller";
import ApprovalRequest from "../models/ApprovalRequest";
import { IApprovalRequestRepository } from "../interfaces/repositoryInterfaces/IApprovalRequestRepository";
import { ISeller } from "../interfaces/ISeller";

const OTP_EXPIRATION_TIME_MS = 2 * 60 * 1000; // ------------------------ 2 minutes

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject("userRepository") private UserRepository: IUserRepository,
    @inject("emailService") private EmailService: IEmailService,
    @inject("walletRepository") private WalletRepository: IWalletRepository,
    @inject("sellerRepository") private SellerRepository: ISellerRepository,
    @inject("approvalRequestRepository")
    private ApprovalRequestRepository: IApprovalRequestRepository
  ) {}

  async sentOtp(email: string, session: any): Promise<void> {
    const existingUser = await this.UserRepository.findByEmail(email);
    if (existingUser)
      throw new CustomError("User already exists", HttpStatusCode.BAD_REQUEST);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    session.otp = otp;
    session.email = email;
    session.otpExpiresAt = Date.now() + OTP_EXPIRATION_TIME_MS;

    await this.EmailService.sendOtpEmail(email, otp);
  }

  async verifyOtp(inputOtp: string, session: any): Promise<boolean> {
    if (!session.otp || !session.otpExpiresAt) {
      // console.log('dsdsdsds',session)
      throw new CustomError(
        "OTP not found in session",
        HttpStatusCode.UNAUTHORIZED
      );
    }

    if (Date.now() > session.otpExpiresAt) {
      throw new CustomError("OTP expired", HttpStatusCode.UNAUTHORIZED);
    }

    if (inputOtp !== session.otp) {
      throw new CustomError("Invalid OTP", HttpStatusCode.UNAUTHORIZED);
    }

    session.otp = null;
    session.email = null;
    session.otpExpiresAt = null;

    return true;
  }

  async registerData(
    name: string,
    email: string,
    password: string
  ): Promise<IUser> {
    const hashPassword = await bcrypt.hash(password, 10);
    const userId = generateUniqueId("user");

    let wallet: IWallet | null = null;
    try {
      wallet = await this.WalletRepository.create({
        // userId: null,
        availableBalance: 0,
        reservedBalance: 0,
      });
      const newUser = await this.UserRepository.createUser({
        name,
        email,
        password: hashPassword,
        userId,
        role: Roles.USER,
      });
      // console.log(newUser);/////////////////////////////////////////////////////////
      await this.WalletRepository.update(wallet._id, {
        userId: newUser._id,
      });

      return newUser;
    } catch (error) {
      // console.error(error);////////////////////////////////////////////////////
      throw new CustomError(
        "Registration failed",
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByEmailAndSentOtp(email: string, session: any): Promise<void> {
    const userExist = await this.UserRepository.findByEmail(email);
    if (userExist) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      session.otp = otp;
      session.email = email;
      session.otpExpiresAt = Date.now() + OTP_EXPIRATION_TIME_MS;

      await this.EmailService.sendOtpEmail(email, otp);
    } else {
      throw new CustomError("Email not found", HttpStatusCode.UNAUTHORIZED);
    }
  }

  async resetPassword(newPassword: string, email: string): Promise<void> {
    const hashPassword = await bcrypt.hash(newPassword, 10);
    await this.UserRepository.resetPasswordByEmail(hashPassword, email);
  }

  async refresh(refreshToken: string): Promise<any> {
    const payload = verifyRefreshToken(refreshToken);
    // console.log(payload)
    const user = await this.UserRepository.findById(payload.id);
    if (!user || user.refreshToken !== refreshToken)
      throw new CustomError("Invalid refresh token", HttpStatusCode.FORBIDDEN);
    if (!user?._id || !user?.email || !user?.role) {
      throw new CustomError(
        "User ID, Email, role are missing",
        HttpStatusCode.FORBIDDEN
      );
    }
    const accessToken = generateAccessToken(
      user._id.toString(),
      user.email,
      user.role
    );
    // await this.UserRepository.updateRefreshToken(
    //   user._id.toString(),
    //   newTokens.refreshToken
    // );
    // let accessToken=
    return {
      accessToken,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const user = await this.UserRepository.findByRefreshToken(refreshToken);
    if (!user)
      throw new CustomError("user not found ", HttpStatusCode.FORBIDDEN);

    user.refreshToken = null;
    await user.save();
  }

  async login(email: string, password: string): Promise<any> {
    const user = await this.UserRepository.findByEmail(email);
    if (!user)
      throw new CustomError("Invalid credentials", HttpStatusCode.BAD_REQUEST);

    if (!user.password) {
      throw new CustomError("Password is missing", HttpStatusCode.BAD_REQUEST);
    }
    const passMatch = await bcrypt.compare(password, user.password);
    if (!passMatch)
      throw new CustomError("Invalid credentials", HttpStatusCode.BAD_REQUEST);

    const accessToken = generateAccessToken(
      user._id.toString(),
      user.email,
      user.role
    );
    const refreshToken = generateRefreshToken(
      user._id.toString(),
      user.email,
      user.role
    );
    user.refreshToken = refreshToken;
    await user.save();
    return {
      accessToken,
      refreshToken,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getUserDetails(id: string): Promise<UserDocument | null> {
    const user = await this.UserRepository.findById(id);
    return user;
  }

  async updateProfile(
    id: string,
    data: Partial<UserDocument>
  ): Promise<UserDocument | null> {
    return this.UserRepository.updateProfile(id, data);
  }

  async updatePassword(
    email: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.UserRepository.findByEmail(email);
    if (!user)
      throw new CustomError("User not found", HttpStatusCode.NOT_FOUND);

    const isMatch = await bcrypt.compare(currentPassword, user?.password!);
    if (!isMatch)
      throw new CustomError(
        "Current password in inorrect",
        HttpStatusCode.UNAUTHORIZED
      );

    if (currentPassword === newPassword)
      throw new CustomError(
        "New password cannot be same as your old passowrd",
        HttpStatusCode.BAD_REQUEST
      );

    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    await user.save();
  }

  async applyForSeller(
    id: string,
    idNumber: string,
    address: string
  ): Promise<void> {
    const user = await this.UserRepository.findById(id);
    if (!user)
      throw new CustomError("user not found", HttpStatusCode.NOT_FOUND);

    const seller = new Seller({
      userId: user._id,
      sellerSince: Date.now(),
      address: address,
      identificationNumber: idNumber,
    });
    await seller.save();

    const approvalRequest = new ApprovalRequest({
      requester: user._id,
      targetRef: seller._id,
      targetModel: "Seller",
      type: ApprovalRequestType.SELLER_APPLICATION,
    });
    await approvalRequest.save();

    user.sellerId = seller._id;
    // console.log(seller,'-------------------------------')
    await user.save();
  }

  async getSellerStatus(userId: string): Promise<ISeller | null> {
    const user = await this.UserRepository.findById(userId);
    const sellerId = user?.sellerId;
    if (!sellerId)
      throw new CustomError("sellerId not found", HttpStatusCode.NOT_FOUND);
    const seller = await this.SellerRepository.findById(sellerId?.toString());
    return seller;
  }
}
