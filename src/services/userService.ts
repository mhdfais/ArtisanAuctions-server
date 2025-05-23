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
import { Roles } from "../enums/commonEnums";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/generateToken";

const OTP_EXPIRATION_TIME_MS = 2 * 60 * 1000; // ------------------------ 2 minutes

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject("userRepository") private UserRepository: IUserRepository,
    @inject("emailService") private EmailService: IEmailService,
    @inject("walletRepository") private WalletRepository: IWalletRepository
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

  async updatePassword(newPassword: string, email: string): Promise<void> {
    const hashPassword = await bcrypt.hash(newPassword, 10);
    await this.UserRepository.updatePasswordByEmail(hashPassword, email);
  }

  async refresh(refreshToken: string): Promise<any> {
    const payload = verifyRefreshToken(refreshToken);
    // console.log(payload)
    const user = await this.UserRepository.findById(payload.id);
    if (!user || user.refreshToken !== refreshToken)
      throw new CustomError("Invalid refresh token", HttpStatusCode.FORBIDDEN);
    if (!user?._id || !user?.email || !user?.role) {
      throw new CustomError("User ID, Email, role are missing", HttpStatusCode.FORBIDDEN);
    }
    const accessToken = generateAccessToken(user._id.toString(),user.email,user.role);
    // await this.UserRepository.updateRefreshToken(
    //   user._id.toString(),
    //   newTokens.refreshToken
    // );
    // let accessToken=
    return { accessToken,user:{
      name:user.name,
      email:user.email,
      role:user.role
    }};
  }

  async logout(userId: string): Promise<void> {
    await this.UserRepository.clearRefreshToken(userId);
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

    const accessToken = generateAccessToken(user._id.toString(),user.email,user.role);
    const refreshToken = generateRefreshToken(user._id.toString(),user.email,user.role);
    user.refreshToken = refreshToken;
    await user.save();
    return {
      accessToken,
      refreshToken,
      user: {
        name: user.name,
        email: user.email,
        role:user.role
      },
    };
  }

  async getUserDetails(id:string){
    const user=await this.UserRepository.findById(id)
    return user
  }
}
