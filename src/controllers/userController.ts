import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { errorHandler } from "../utils/handleError";
import { CustomError } from "../errors/customError";
import HttpStatusCode from "../enums/httpStatusCodes";
import { IAuthPayload } from "../interfaces/IAuthPayload";
import { UserService } from "../services/userService";

@injectable()
export class UserController {
  constructor(@inject('userService') private UserService:UserService) {}

  getUserDetails = async (req: Request, res: Response) => {
    try {
      if (!req.user)
        throw new CustomError(
          "Unauthorized : user not found",
          HttpStatusCode.UNAUTHORIZED
        );
      const user = req.user as IAuthPayload
      const userId=user.id 

      const userDetails=await this.UserService.getUserDetails(userId)
      res.status(HttpStatusCode.OK).json({
        user:{
            name:userDetails?.name,
            email:userDetails?.email,
            phone:userDetails?.phone,
            bio:userDetails?.bio,
            profileImages:userDetails?.profileImage,
            bids:userDetails?.bids,
        }
      })
    } catch (error) {
        errorHandler(error,res)
    }
  };
}
