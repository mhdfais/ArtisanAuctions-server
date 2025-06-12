import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { errorHandler } from "../utils/handleError";
import { CustomError } from "../errors/customError";
import HttpStatusCode from "../enums/httpStatusCodes";
import { IAuthPayload } from "../interfaces/IAuthPayload";
import { IUserService } from "../interfaces/serviceInterfaces/IUserService";
import { IStripeService } from "../interfaces/serviceInterfaces/IStripeService";

interface IUpdateData {
  name: string;
  phone: string;
  bio: string;
  profileImage?: string;
}

@injectable()
export class UserController {
  constructor(
    @inject("userService") private UserService: IUserService,
    @inject("stripeService") private StripeService: IStripeService
  ) {}

  getUserDetails = async (req: Request, res: Response) => {
    try {
      if (!req.user)
        throw new CustomError(
          "Unauthorized : user not found",
          HttpStatusCode.UNAUTHORIZED
        );
      const user = req.user as IAuthPayload;
      const userId = user.id;

      const userDetails = await this.UserService.getUserDetails(userId);
      res.status(HttpStatusCode.OK).json({
        user: {
          name: userDetails?.name,
          email: userDetails?.email,
          phone: userDetails?.phone,
          bio: userDetails?.bio,
          profileImage: userDetails?.profileImage,
          bids: userDetails?.bids,
          isSeller: userDetails?.isSeller,
        },
      });
    } catch (error) {
      errorHandler(error, res);
    }
  };

  updateProfile = async (req: Request, res: Response) => {
    try {
      if (!req.user)
        throw new CustomError(
          "Unauthorized : user not found",
          HttpStatusCode.UNAUTHORIZED
        );
      const user = req.user as IAuthPayload;
      const userId = user.id;

      const updateData: IUpdateData = {
        name: req.body.name,
        phone: req.body.phone,
        bio: req.body.bio,
      };
      if (req.file) {
        updateData.profileImage = req.file.path;
      }

      const updatedUser = await this.UserService.updateProfile(
        userId,
        updateData
      );
      if (!updatedUser) {
        throw new CustomError("User not found", HttpStatusCode.NOT_FOUND);
      }

      res
        .status(HttpStatusCode.OK)
        .json({ message: "Profile updated successfully " });
    } catch (error) {
      errorHandler(error, res);
    }
  };

  updatePassword = async (req: Request, res: Response) => {
    try {
      // console.log('heee')
      if (!req.user)
        throw new CustomError(
          "Unauthorized : user not found",
          HttpStatusCode.UNAUTHORIZED
        );
      const user = req.user as IAuthPayload;
      const email = user.email;

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword)
        throw new CustomError(
          "New password and current password is requried",
          HttpStatusCode.BAD_REQUEST
        );

      // console.log(req.body,email)
      await this.UserService.updatePassword(
        email,
        currentPassword,
        newPassword
      );
      res.status(HttpStatusCode.OK).json({ message: "Password updated" });
    } catch (error) {
      errorHandler(error, res);
    }
  };

  applyForSeller = async (req: Request, res: Response) => {
    try {
      if (!req.user)
        throw new CustomError(
          "Unauthorized : user not found",
          HttpStatusCode.UNAUTHORIZED
        );
      const user = req.user as IAuthPayload;

      const { idNumber, address } = req.body;
      if (!idNumber || !address)
        throw new CustomError(
          "ID number and address is required",
          HttpStatusCode.BAD_REQUEST
        );
      await this.UserService.applyForSeller(user.id, idNumber, address);
      res.status(HttpStatusCode.OK).json({ message: "Application submitted" });
    } catch (error) {
      errorHandler(error, res);
    }
  };

  getSellerStatus = async (req: Request, res: Response) => {
    try {
      if (!req.user)
        throw new CustomError(
          "Unauthorized : user not found",
          HttpStatusCode.UNAUTHORIZED
        );
      const user = req.user as IAuthPayload;
      // console.log(user);
      const seller = await this.UserService.getSellerStatus(user.id);
      res.status(HttpStatusCode.OK).json({ status: seller?.approvalStatus });
    } catch (error) {
      errorHandler(error, res);
    }
  };

  addArtwork = async (req: Request, res: Response) => {
    try {
      if (!req.user)
        throw new CustomError(
          "Unauthorized : user not found",
          HttpStatusCode.UNAUTHORIZED
        );
      const user = req.user as IAuthPayload;
      // console.log(req.body)
      const data = req.body;
      const files = req.files as Express.Multer.File[];
      await this.UserService.addArtwork(user.id, data, files);
      res.status(HttpStatusCode.CREATED).json({ message: "artwork created." });
    } catch (error) {
      errorHandler(error, res);
    }
  };

  getArtworks = async (req: Request, res: Response) => {
    try {
      if (!req.user)
        throw new CustomError(
          "Unauthorized : user not found",
          HttpStatusCode.UNAUTHORIZED
        );
      const user = req.user as IAuthPayload;
      const artworks = await this.UserService.getArtworks(user.id);
      res.status(HttpStatusCode.OK).json(artworks);
    } catch (error) {
      errorHandler(error, res);
    }
  };

  scheduleAuction = async (req: Request, res: Response) => {
    try {
      // console.log('hi----------------------------------------------')
      const artworkId = req.params.artworkId;
      const { startTime, endTime } = req.body;

      if (!startTime || !endTime || !artworkId)
        throw new CustomError(
          "startTime,endTime and artworkId is required",
          HttpStatusCode.BAD_REQUEST
        );

      await this.UserService.scheduleAuction(artworkId, startTime, endTime);
      return res
        .status(HttpStatusCode.OK)
        .json({ success: true, message: "auction scheduled." });
    } catch (error) {
      errorHandler(error, res);
    }
  };

  getAllArtworks = async (req: Request, res: Response) => {
    try {
      const artworks = await this.UserService.getAllArtworks();
      res.status(HttpStatusCode.OK).json({ success: true, artworks });
    } catch (error) {
      errorHandler(error, res);
    }
  };

  createPaymentIntent = async (req: Request, res: Response) => {
    try {
      if (!req.user)
        throw new CustomError(
          "Unauthorized : user not found",
          HttpStatusCode.UNAUTHORIZED
        );
      const user = req.user as IAuthPayload;
      const { amount } = req.body;
      const { clientSecret, transactionId } =
        await this.StripeService.createPaymentIntent(user.id, amount);
      res.json({ clientSecret, transactionId });
    } catch (error) {
      errorHandler(error, res);
    }
  };

  confirmDeposit = async (req: Request, res: Response) => {
    try {
      const { paymentIntentId } = req.body;
      if (!paymentIntentId) {
        throw new CustomError(
          "Invalid payment intent ID",
          HttpStatusCode.BAD_REQUEST
        );
      }
      const wallet = await this.StripeService.confirmDeposit(paymentIntentId);
      res.json(wallet);
    } catch (err) {
      errorHandler(err, res);
    }
  };

  getWallet = async (req: Request, res: Response) => {
    try {
      if (!req.user)
        throw new CustomError(
          "Unauthorized : user not found",
          HttpStatusCode.UNAUTHORIZED
        );
      const user = req.user as IAuthPayload;
      const wallet = await this.StripeService.getWallet(user.id);
      // console.log(user,wallet,'--------------------------------')
      const walletData = {
        balance: wallet.balance,
      };
      res.status(HttpStatusCode.OK).json({ success: true, walletData });
    } catch (error) {
      errorHandler(error, res);
    }
  };

  getArtworkById = async (req: Request, res: Response) => {
    try {
      const artworkId = req.params.artworkId;
      const artwork = await this.UserService.getArtworkById(artworkId);
      res.status(HttpStatusCode.OK).json({
        success: true,
        details: {
          title: artwork?.title,
          yearCreated: artwork?.yearCreated,
          dimensions: artwork?.dimensions,
          category: artwork?.category,
          medium: artwork?.medium,
          description: artwork?.description,
          images: artwork?.images,
          reservePrice: artwork?.reservePrice,
          highestBid: artwork?.highestBid,
          auctionEndTime: artwork?.auctionEndTime,
          auctionStartTime: artwork?.auctionStartTime,
          isActive:artwork?.isActive,
          isEnded:artwork?.isEnded
        },
      });
    } catch (error) {
      errorHandler(error, res);
    }
  };

  getArtworkBidHistory = async (req: Request, res: Response) => {
    try {
      const artworkId = req.params.artworkId;
      const bids = await this.UserService.getArtworkBidHistory(artworkId);
      // console.log(bids)
      res.status(HttpStatusCode.OK).json({ success: true, bids });
    } catch (error) {
      errorHandler(error, res);
    }
  };
}
