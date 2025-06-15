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
import { IArtworkRepository } from "../interfaces/repositoryInterfaces/IArtworkRepository";
import { IArtwork } from "../interfaces/IArtwork";
import { IApprovalRequest } from "../interfaces/IApprovalRequest";
import { Types } from "mongoose";
import { IBid } from "../interfaces/IBid";
import { IBidRepository } from "../interfaces/repositoryInterfaces/IBidRepository";
import { ITransactionRepository } from "../interfaces/repositoryInterfaces/ITransactionRepository";
import { ITransaction } from "../interfaces/ITransaction";

const OTP_EXPIRATION_TIME_MS = 2 * 60 * 1000; // ------------------------ 2 minutes

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject("userRepository") private UserRepository: IUserRepository,
    @inject("emailService") private EmailService: IEmailService,
    @inject("walletRepository") private WalletRepository: IWalletRepository,
    @inject("sellerRepository") private SellerRepository: ISellerRepository,
    @inject("approvalRequestRepository")
    private ApprovalRequestRepository: IApprovalRequestRepository,
    @inject("artworkRepository") private ArtworkRepository: IArtworkRepository,
    @inject("bidRepository") private BidRepository: IBidRepository,
    @inject("transactionRepository")
    private TransactionRepository: ITransactionRepository
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
      wallet = await this.WalletRepository.create(0);
      const newUser = await this.UserRepository.createUser({
        name,
        email,
        password: hashPassword,
        userId,
        role: Roles.USER,
      });
      // console.log(newUser);/////////////////////////////////////////////////////////
      await this.WalletRepository.findByAndUpdate(
        wallet._id.toString(),
        newUser._id.toString()
      );

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

  async addArtwork(
    userId: string,
    data: any,
    files: Express.Multer.File[]
  ): Promise<void> {
    const user = await this.UserRepository.findById(userId);
    if (!user)
      throw new CustomError("User not found", HttpStatusCode.NOT_FOUND);

    if (!user.isSeller || !user.sellerId) {
      throw new CustomError("User is not a seller", HttpStatusCode.FORBIDDEN);
    }

    if (!files || files.length === 0) {
      throw new CustomError(
        "At least one image is required",
        HttpStatusCode.BAD_REQUEST
      );
    }

    const { height, width, ...rest } = data;
    const imagePaths = files.map((file) => file.path);

    const artwork: IArtwork = {
      ...rest,
      dimensions: {
        height: Number(height),
        width: Number(width),
      },
      sellerId: user.sellerId,
      images: imagePaths,
    };
    // console.log('--------------hii')
    const newArtwork = await this.ArtworkRepository.create(artwork);
    if (!newArtwork)
      throw new CustomError(
        "failed to create artwork",
        HttpStatusCode.NO_CONTENT
      );

    const approvalRequestdata: IApprovalRequest = {
      requester: user._id,
      type: ApprovalRequestType.ARTWORK_SUBMISSION,
      targetModel: "Artwork",
      targetRef: newArtwork?._id,
    };
    await this.ApprovalRequestRepository.createApprovalRequest(
      approvalRequestdata
    );
  }

  async getArtworks(userId: string): Promise<IArtwork[] | null> {
    const user = await this.UserRepository.findById(userId);
    const sellerId = user?.sellerId;

    if (!sellerId || !user.isSeller)
      throw new CustomError("user is not a seller", HttpStatusCode.FORBIDDEN);

    const artworks = await this.ArtworkRepository.findBySellerId(
      sellerId.toString()
    );
    return artworks;
  }

  async scheduleAuction(
    artworkId: string,
    startTime: string,
    endTime: string
  ): Promise<void> {
    const artwork = await this.ArtworkRepository.findByAndUpdate(
      artworkId,
      startTime,
      endTime
    );
    if (!artwork)
      throw new CustomError(
        "failed to update schedule time",
        HttpStatusCode.NOT_FOUND
      );
  }

  async getAllArtworks(): Promise<IArtwork[] | null> {
    const artworks = await this.ArtworkRepository.getAllArtworks();
    if (!artworks)
      throw new CustomError(
        "faileed to get artworks",
        HttpStatusCode.NOT_FOUND
      );

    return artworks;
  }

  async getArtworkById(id: string): Promise<IArtwork | null> {
    const artwork = await this.ArtworkRepository.findById(id);
    if (!artwork)
      throw new CustomError("artwork not found", HttpStatusCode.NOT_FOUND);

    return artwork;
  }

  async getArtworkBidHistory(artworkId: string): Promise<IBid[] | null> {
    const bids = await this.BidRepository.getBidsByArtwork(artworkId);
    if (!bids)
      throw new CustomError("bids not found", HttpStatusCode.NOT_FOUND);

    return bids;
  }

  async getBids(userId: string): Promise<any> {
    const bids = await this.BidRepository.getBidsByBidderId(userId);
    if (!bids)
      throw new CustomError("bids not found", HttpStatusCode.NOT_FOUND);

    const processedBids = bids.map((bid) => {
      const artwork = bid.artworkId;

      let status: "active" | "outbid" | "won" = "active";

      if (!artwork || !artwork.highestBidderId) {
        status = "active"; // or handle missing artwork data more gracefully
      } else if (artwork.isEnded) {
        status =
          artwork.highestBidderId.toString() === bid.bidderId.toString()
            ? "won"
            : "outbid";
      } else {
        status =
          artwork.highestBidderId.toString() !== bid.bidderId.toString() &&
          artwork.highestBid !== bid.amount
            ? "outbid"
            : "active";
      }

      return {
        ...bid,
        status,
        currentHighestBid: artwork.highestBid,
        isAuctionEnded: artwork.isEnded,
        auctionEndTime: artwork.auctionEndTime,
      };
    });

    return processedBids;
  }

  async getTransactions(userId: string):Promise<ITransaction[]|null> {
    const wallet = await this.WalletRepository.findByUserId(userId);
    if (!wallet)
      throw new CustomError("wallet not found", HttpStatusCode.NOT_FOUND);

    const transactions = 
      await this.TransactionRepository.findTransactionsByWalletId(
        wallet?._id.toString()
      );
      
      return transactions
  }
}
