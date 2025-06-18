import { Request, Response } from "express";
import { errorHandler } from "../utils/handleError";
import { CustomError } from "../errors/customError";
import HttpStatusCode from "../enums/httpStatusCodes";
import { inject, injectable } from "tsyringe";
import { IAdminService } from "../interfaces/serviceInterfaces/IAdminService";

@injectable()
export class AdminController {
  constructor(@inject("adminService") private AdminService: IAdminService) {}

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        throw new CustomError(
          "email and password is required",
          HttpStatusCode.BAD_REQUEST
        );

      const { accessToken, refreshToken, user } = await this.AdminService.login(
        email,
        password
      );
      res
        .cookie("admin_refresh_token", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // ------------------ 7 days
        })
        .cookie("admin_access_token", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 15 * 60 * 1000, // ---------------------- 15 minutes
        })
        .json({ user })
        .status(HttpStatusCode.OK);
    } catch (error) {
      errorHandler(error, res);
    }
  };

  refresh = async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.admin_refresh_token;
      // console.log(token)
      if (!refreshToken)
        throw new CustomError("Token not found", HttpStatusCode.UNAUTHORIZED);

      const { accessToken } = await this.AdminService.refresh(refreshToken);
      // console.log(accessToken)
      res.cookie("admin_access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // ------------------ 15 minutes
      });
      res.json({ message: "Token refreshed" });
    } catch (error) {
      errorHandler(error, res);
    }
  };

  getApprovals = async (req: Request, res: Response) => {
    try {
      const approvals = await this.AdminService.getApprovals();
      // console.log(approvals)
      return res.status(HttpStatusCode.OK).json(approvals);
    } catch (error) {
      errorHandler(error, res);
    }
  };

  approve = async (req: Request, res: Response) => {
    try {
      const approvalId = req.params.approvalId;
      await this.AdminService.approve(approvalId);
      res.status(HttpStatusCode.OK).json({message:'application approved'})
    } catch (error) {
      errorHandler(error, res);
    }
  };

  reject = async (req: Request, res: Response) => {
    try {
      // console.log(req.params.approvalId,'------------------')
      const approvalId = req.params.approvalId;
      await this.AdminService.reject(approvalId);
      res.status(HttpStatusCode.OK).json({message:'application rejected'})
    } catch (error) {
      errorHandler(error, res);
    }
  };

  findAllArtworks=async(req:Request,res:Response)=>{
    try {
      const artworks=await this.AdminService.findAllArtworks()
      return res.status(HttpStatusCode.OK).json({success:true,artworks})
    } catch (error) {
      errorHandler(error,res)
    }
  }

  findAllUsers=async(req:Request,res:Response)=>{
    try {
      const users=await this.AdminService.findAllUsers()
      res.status(HttpStatusCode.OK).json({success:true,users})
    } catch (error) {
      errorHandler(error,res)
    }
  }

  findAllSellers=async(req:Request,res:Response)=>{
    try {
      const sellers=await this.AdminService.findAllSellers()
      res.status(HttpStatusCode.OK).json({success:true,sellers})
    } catch (error) {
      errorHandler(error,res)
    }
  }
}
