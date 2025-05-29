import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { errorHandler } from "../utils/handleError";
import { CustomError } from "../errors/customError";
import HttpStatusCode from "../enums/httpStatusCodes";
import { IAuthPayload } from "../interfaces/IAuthPayload";
import { UserService } from "../services/userService";
import { IUserService } from "../interfaces/serviceInterfaces/IUserService";

interface IUpdateData {
  name: string;
  phone: string;
  bio: string;
  profileImage?: string;
}

@injectable()
export class UserController {
  constructor(@inject("userService") private UserService: IUserService) {}

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

  
}
