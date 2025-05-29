import { Router } from "express";
import { container } from "tsyringe";
import { NotificationController } from "../../controllers/notificationController";
import { requireAuth } from "../../middlewares/authMiddleware";
import express from 'express'

const router = Router();

const notificatioController = container.resolve(NotificationController);

const wrap = (fn: Function) => (req: express.Request, res: express.Response) =>
  fn(req, res);
router.post(
  "/storeFcmToken",
  requireAuth,
  wrap(notificatioController.storeFcmToken)
);

export default router
