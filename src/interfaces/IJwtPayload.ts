import { JwtPayload as DefaultJwtPayload } from "jsonwebtoken";

export interface JwtPayload extends DefaultJwtPayload {
  id: string;
  role?: string;
  iat?: number;
  exp?: number;
}
