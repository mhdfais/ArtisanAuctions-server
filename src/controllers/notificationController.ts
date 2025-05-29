import { inject, injectable } from "tsyringe";
import { NotificationService } from "../services/NotificationService";
import { CustomError } from "../errors/customError";
import HttpStatusCode from "../enums/httpStatusCodes";
import { IAuthPayload } from "../interfaces/IAuthPayload";
import { errorHandler } from "../utils/handleError";
import { Request, Response } from "express";

@injectable()
export class NotificationController{
    constructor(
        @inject('notificationService') private NotificationService:NotificationService
    ){}

    storeFcmToken = async (req: Request, res: Response) => {
    try {
      if (!req.user)
        throw new CustomError(
          "Unauthorized : user not found",
          HttpStatusCode.UNAUTHORIZED
        );
      const user = req.user as IAuthPayload;

      const { fcmToken } = req.body;
      await this.NotificationService.storeFcmToken(user.id, fcmToken);
      return res
        .status(HttpStatusCode.OK)
        .json({ message: "fcm token stored" });
    } catch (error) {
      errorHandler(error, res);
    }
  };
}