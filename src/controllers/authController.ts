import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { inject, injectable } from "tsyringe";
import HttpStatusCode from "../enums/httpStatusCodes";
import { CustomError } from "../errors/customError";
import { errorHandler } from "../utils/handleError";
import User from "../models/User";

@injectable()
export class AuthController {
  constructor(@inject("userService") private UserService: UserService) {}

  requestOtp = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        throw new CustomError("Email is required", HttpStatusCode.BAD_REQUEST);
      }

      await this.UserService.sentOtp(email, req.session);
      console.log(req.session,'requestotp-----------')
      res.status(HttpStatusCode.CREATED).json({ message: "OTP sent to email" });
    } catch (error) {
      errorHandler(error, res);
    }
  };

  verifyOtp = async (req: Request, res: Response) => {
    try {
      const { otp } = req.body;
      if (!otp) {
        throw new CustomError("OTP is required", HttpStatusCode.BAD_REQUEST);
      }
      console.log('gdfgfd',req.session)
      await this.UserService.verifyOtp(otp, req.session);
      res
        .status(HttpStatusCode.OK)
        .json({ message: "OTP verified successfully" });
    } catch (error) {
      errorHandler(error, res);
    }
  };

  registerUser = async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        throw new CustomError(
          "Name, email, and password are required",
          HttpStatusCode.BAD_REQUEST
        );
      }

      const user = await this.UserService.registerData(name, email, password);
      res.status(HttpStatusCode.CREATED).json({
        message: "User registered successfully",
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      errorHandler(error, res);
    }
  };

  findByEmailAndSentOtp = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email)
        throw new CustomError("Email is required", HttpStatusCode.BAD_REQUEST);
      await this.UserService.findByEmailAndSentOtp(email, req.session);
      res.status(HttpStatusCode.OK).json({ message: "Email verified" });
    } catch (error) {
      errorHandler(error, res);
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    try {
      const { newPassword, email } = req.body;
      if (!newPassword || !email)
        throw new CustomError(
          "Password, email are required",
          HttpStatusCode.BAD_REQUEST
        );
      await this.UserService.resetPassword(newPassword, email);
      res
        .status(HttpStatusCode.OK)
        .json({ message: "Password updated successfully" });
    } catch (error) {
      errorHandler(error, res);
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        throw new CustomError(
          "Email and password are required",
          HttpStatusCode.BAD_REQUEST
        );

      const { accessToken, refreshToken, user } = await this.UserService.login(
        email,
        password
      );
      res
        .cookie("refresh_token", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "none",
          maxAge: 7 * 24 * 60 * 60 * 1000, // ------------------ 7 days
        })
        .cookie("access_token", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "none",
          maxAge: 15 * 60 * 1000, // ---------------------- 15 minutes
        })
        .json({ user });
    } catch (error) {
      errorHandler(error, res);
    }
  };

  refresh = async (req: Request, res: Response): Promise<any> => {
    try {
      const token = req.cookies.refresh_token;
      // console.log(token)
      if (!token)
        throw new CustomError("Token not found", HttpStatusCode.UNAUTHORIZED);

      const { accessToken, user } = await this.UserService.refresh(token);
      // console.log(accessToken)
      res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });
      res.json({ message: "Token refreshed" });
    } catch (error) {
      errorHandler(error, res);
    }
  };

  logout = async (req: Request, res: Response):Promise<Response | void> => {
    try {
      const refreshToken = req.cookies.refresh_token;
      if (!refreshToken)
        throw new CustomError(
          "No content : already logged out",
          HttpStatusCode.NO_CONTENT
        );

      await this.UserService.logout(refreshToken);

      res.clearCookie("access_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res
        .status(HttpStatusCode.OK)
        .json({ message: "Logged out successfully" });
    } catch (error) {
      errorHandler(error, res);
    }
  };
}
