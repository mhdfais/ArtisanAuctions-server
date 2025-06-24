import jwt, { JwtPayload as DefaultJwtPayload } from "jsonwebtoken";
import { JwtPayload } from "../interfaces/IJwtPayload";
import dotenv from "dotenv";
import { ObjectId } from "mongoose";

dotenv.config();
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
// console.log(process.env)

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error("ACCESS_SECRET and REFRESH_SECRET are required");
}

export const generateAccessToken = (
  id: string,
  email: string,
  role: string
) => {
  const payload = { id, email, role };
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (
  id: string,
  email: string,
  role: string
) => {
  const payload = { id, email, role };
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, ACCESS_SECRET);
  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }
  return decoded as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, REFRESH_SECRET);
  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }
  return decoded as JwtPayload;
};
