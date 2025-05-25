import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { errorHandler } from "../utils/handleError";
import { CustomError } from "../errors/customError";
import HttpStatusCode from "../enums/httpStatusCodes";
import { IAuthPayload } from "../interfaces/IAuthPayload";
import { UserService } from "../services/userService";

interface IUpdateData {
  name: string;
  phone: string;
  bio: string;
  profileImage?: string;
}

@injectable()
export class UserController {
  constructor(@inject("userService") private UserService: UserService) {}

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
}
