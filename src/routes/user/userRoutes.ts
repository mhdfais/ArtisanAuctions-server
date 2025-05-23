import { Router } from "express";
import { container } from "tsyringe";
import { UserController } from "../../controllers/userController";
import { requireAuth, requireRole } from "../../middlewares/authMiddleware";

const userController = container.resolve(UserController);

const router = Router();

router.get(
  "/getUserDetails",
  requireAuth,
  requireRole("user"),
  userController.getUserDetails
);

export default router;
