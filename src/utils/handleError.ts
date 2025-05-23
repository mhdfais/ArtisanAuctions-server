import { CustomError } from './../errors/customError';
import { Response } from "express";

export const errorHandler = (
  err: any,
  res: Response,
) => {
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }
  console.error("unhandled error", err);
  res.status(500).json({
    success: false,
    message: "internal server error, please try again",
  });
};
