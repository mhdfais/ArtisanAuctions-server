import { NextFunction, Request, Response } from "express";
import { CustomError } from "../errors/customError";
import HttpStatusCode from "../enums/httpStatusCodes";
import { verifyAccessToken } from "../utils/generateToken";
import { IAuthPayload } from "../interfaces/IAuthPayload";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.access_token;
  if (!token)
    throw new CustomError(
      "Unauthorized, Token not found",
      HttpStatusCode.UNAUTHORIZED
    );

  try {
    const user = verifyAccessToken(token);
    req.user = user;
    next();
  } catch (error) {
    throw new CustomError("Invalid or expired token", HttpStatusCode.FORBIDDEN);
  }
};

export const requireRole = (...alowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user=req.user as IAuthPayload
    if(!alowedRoles.includes(user.role)){
        throw new CustomError('Forbidden: Insufficient role',HttpStatusCode.FORBIDDEN)
    }

    next()
  };
};
