import { Router } from "express";
import { container } from "tsyringe";
import { UserController } from "../../controllers/userController";
import { requireAuth, requireRole } from "../../middlewares/authMiddleware";
import upload from "../../utils/multer";

const userController = container.resolve(UserController);

const router = Router();

router.get(
  "/getUserDetails",
  requireAuth,
  requireRole("user"),
  userController.getUserDetails
);

router.put(
  "/updateProfile",
  requireAuth,
  requireRole("user"),
  upload.single("profileImage"),
  userController.updateProfile
);

router.put(
  "/updatePassword",
  requireAuth,
  requireRole("user"),
  userController.updatePassword
);

router.post(
  "/applyForSeller",
  requireAuth,
  requireRole("user"),
  userController.applyForSeller
);

router.get(
  '/getSellerStatus',
  requireAuth,
  requireRole('user'),
  userController.getSellerStatus
)

export default router;
