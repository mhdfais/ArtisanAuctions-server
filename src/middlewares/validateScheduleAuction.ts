import { Request, Response, NextFunction } from "express";
import HttpStatusCode from "../enums/httpStatusCodes";
import { CustomError } from "../errors/customError";

export const validateScheduleAuction = (req: Request, res: Response, next: NextFunction) => {
  const { startTime, endTime } = req.body;

  if (!startTime || !endTime) {
    throw new CustomError('Start time and end time are required',HttpStatusCode.BAD_REQUEST)
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new CustomError('Invalid date format',HttpStatusCode.BAD_REQUEST)
  }

  if (start <= now) {
    throw new CustomError('Start time must be in the future',HttpStatusCode.BAD_REQUEST)
  }

  if (end <= start) {
    throw new CustomError('End time must be after start time',HttpStatusCode.BAD_REQUEST)
  }

  const duration = end.getTime() - start.getTime();
  if (duration < 3600000) {               // ------------------ 1 hour in milliseconds
    
    throw new CustomError('Auction duration must be at least one hour',HttpStatusCode.BAD_REQUEST)
  }
// console.log('hi----------------------------------------------------')
  next();
};