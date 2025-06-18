import bcrypt from "bcrypt";
import { inject, injectable } from "tsyringe";
import { IAdminService } from "../interfaces/serviceInterfaces/IAdminService";
import { IUserRepository } from "../interfaces/repositoryInterfaces/IUserRepository";
import { CustomError } from "../errors/customError";
import HttpStatusCode from "../enums/httpStatusCodes";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/generateToken";
import { IApprovalRequestRepository } from "../interfaces/repositoryInterfaces/IApprovalRequestRepository";
import { IApprovalRequest } from "../interfaces/IApprovalRequest";
import { ISellerRepository } from "../interfaces/repositoryInterfaces/ISellerRepository";
import { ApprovalRequestStatus } from "../enums/commonEnums";
import { IEmailService } from "../interfaces/serviceInterfaces/IEmailService";
import { IArtworkRepository } from "../interfaces/repositoryInterfaces/IArtworkRepository";
import { IArtwork } from "../interfaces/IArtwork";

@injectable()
export class AdminService implements IAdminService {
  constructor(
    @inject("userRepository") private UserRepository: IUserRepository,
    @inject("approvalRequestRepository")
    private ApprovalRequestRepository: IApprovalRequestRepository,
    @inject("sellerRepository") private SellerRepository: ISellerRepository,
    @inject("emailService") private EmailService: IEmailService,
    @inject("artworkRepository") private ArtworkRepository: IArtworkRepository
  ) {}

  async login(email: string, password: string): Promise<any> {
    const user = await this.UserRepository.findByEmail(email);
    if (!user)
      throw new CustomError("user not found", HttpStatusCode.BAD_REQUEST);

    if (user.role !== "admin")
      throw new CustomError("unauthorised", HttpStatusCode.FORBIDDEN);

    if (!user.password)
      throw new CustomError("password is required", HttpStatusCode.BAD_REQUEST);

    const isMatch = await bcrypt.compare(password, user.password);
    // console.log(isMatch)
    // console.log(user.password)
    // console.log(user)
    console.log(password);
    if (!isMatch)
      throw new CustomError("invalid credentials", HttpStatusCode.BAD_REQUEST);

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
        email: user.name,
        role: user.role,
      },
    };
  }
  async refresh(refreshToken: string): Promise<any> {
    const payload = verifyRefreshToken(refreshToken);
    const user = await this.UserRepository.findById(payload.id);
    if (!user || user.refreshToken !== refreshToken)
      throw new CustomError("invalid refresh token", HttpStatusCode.FORBIDDEN);

    const accessToken = generateAccessToken(
      user._id.toString(),
      user.email,
      user.role
    );
    return { accessToken };
  }

  async getApprovals(): Promise<IApprovalRequest[] | null> {
    const approvals = await this.ApprovalRequestRepository.getApprovals();
    return approvals;
  }

  async approve(id: string): Promise<void> {
    const status = ApprovalRequestStatus.APPROVED;
    const approved =
      await this.ApprovalRequestRepository.updateApprovalRequestStatus(
        id,
        status
      );
    if (!approved)
      throw new CustomError("request not approved", HttpStatusCode.BAD_REQUEST);

    if (approved.type === "seller_application") {
      const sellerId = approved.targetRef;
      if (!sellerId)
        throw new CustomError("sellerId not found", HttpStatusCode.BAD_REQUEST);

      const approvedSeller = await this.SellerRepository.updateApprovalStatus(
        sellerId.toString(),
        status,
        true
      );
      if (!approvedSeller)
        throw new CustomError(
          "seller and sellerId is required",
          HttpStatusCode.BAD_REQUEST
        );

      const user = await this.UserRepository.findById(
        approvedSeller?.userId.toString()
      );
      if (!user)
        throw new CustomError("user not found", HttpStatusCode.BAD_REQUEST);

      user.isSeller = true;
      await user.save();

      await this.EmailService.sendApprovalNotificationEmail(
        user?.email,
        user?.name,
        "seller",
        status
      );
    } else {
      const artworkId = approved.targetRef;

      const approvedArtwork = await this.ArtworkRepository.updateApprovalStatus(
        artworkId.toString(),
        status
      );
      if (!approvedArtwork || !approvedArtwork._id)
        throw new CustomError(
          "not approved artwork",
          HttpStatusCode.BAD_REQUEST
        );

      const added = await this.UserRepository.addtoListing(
        approved.requester.toString(),
        approvedArtwork?._id.toString()
      );
      if (!added)
        throw new CustomError(
          "failed to add to listing",
          HttpStatusCode.NOT_FOUND
        );

      const user = await this.UserRepository.findById(
        approved.requester.toString()
      );
      if (!user?.email || !user.name)
        throw new CustomError(
          "name and email is requierd",
          HttpStatusCode.BAD_REQUEST
        );

      await this.EmailService.sendApprovalNotificationEmail(
        user?.email,
        user?.name,
        "artwork",
        status
      );
    }
  }

  async reject(id: string): Promise<void> {
    const status = ApprovalRequestStatus.REJECTED;
    const rejected =
      await this.ApprovalRequestRepository.updateApprovalRequestStatus(
        id,
        status
      );

    if (!rejected)
      throw new CustomError("request not rejected", HttpStatusCode.NOT_FOUND);

    if (rejected.type === "seller_application") {
      const sellerId = rejected.targetRef;
      if (!sellerId)
        throw new CustomError("sellerId not found", HttpStatusCode.BAD_REQUEST);

      const rejectedSeller = await this.SellerRepository.updateApprovalStatus(
        sellerId.toString(),
        status
      );
      if (!rejectedSeller)
        throw new CustomError("seller not found", HttpStatusCode.BAD_REQUEST);

      const user = await this.UserRepository.findById(
        rejectedSeller?.userId.toString()
      );
      if (!user)
        throw new CustomError("user not found", HttpStatusCode.BAD_REQUEST);

      await this.EmailService.sendApprovalNotificationEmail(
        user.email,
        user.name,
        "seller",
        status
      );
    } else {
      const artworkId = rejected.targetRef;

      await this.ArtworkRepository.updateApprovalStatus(
        artworkId.toString(),
        status
      );

      const user = await this.UserRepository.findById(
        rejected.requester.toString()
      );
      if (!user?.email || !user.name)
        throw new CustomError(
          "name and email is requierd",
          HttpStatusCode.BAD_REQUEST
        );

      await this.EmailService.sendApprovalNotificationEmail(
        user?.email,
        user?.name,
        "artwork",
        status
      );
    }
  }

  async findAllArtworks(): Promise<any> {
    const artworks = await this.ArtworkRepository.findAllArtworks();
    const processsedArtworks = artworks?.map((artwork) => {
      return {
        title: artwork.title,
        yearCreated: artwork.yearCreated,
        dimensions: artwork.dimensions,
        category: artwork.category,
        medium: artwork.medium,
        description: artwork.description,
        images: artwork.images,
        reservePrice: artwork.reservePrice,
        approvalStatus: artwork.approvalStatus,
        highestBid: artwork.highestBid,
        isActive: artwork.isActive,
        isEnded: artwork.isEnded,
        endTime:artwork.auctionEndTime?.toLocaleString()
      };
    });
    return processsedArtworks;
  }

  async findAllUsers():Promise<any>{
    return await this.UserRepository.findAllUsers()
  }

  async findAllSellers(): Promise<any> {
    const sellers = await this.UserRepository.findAllSellers();
    
    const processedSellers = sellers.map((seller) => {
      const sellerDetail = seller.sellerId;
      return {
        userId: seller.userId,
        name: seller.name,
        email: seller.email,
        artworkCount: seller.listings?.length,
        idNumber:sellerDetail.identificationNumber,
        address:sellerDetail.address,
        approvalStatus:sellerDetail.approvalStatus,
        phone:seller.phone,
        bio:seller.bio
      };
    });
    return processedSellers
  }
}
