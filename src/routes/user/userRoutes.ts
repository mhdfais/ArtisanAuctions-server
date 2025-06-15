import { Router } from "express";
import { container } from "tsyringe";
import { UserController } from "../../controllers/userController";
import { requireAuth, requireRole } from "../../middlewares/authMiddleware";
import upload from "../../utils/multer";
import { validateScheduleAuction } from "../../middlewares/validateScheduleAuction";
import express from "express";

const userController = container.resolve(UserController);

const router = Router();

const wrap = (fn: Function) => (req: express.Request, res: express.Response) =>
  fn(req, res);
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
  "/getSellerStatus",
  requireAuth,
  requireRole("user"),
  userController.getSellerStatus
);

router.post(
  "/addArtwork",
  requireAuth,
  requireRole("user"),
  upload.array("images"),
  userController.addArtwork
);

router.get(
  "/getArtworks",
  requireAuth,
  requireRole("user"),
  userController.getArtworks
);

router.post(
  "/schedule/:artworkId",
  requireAuth,
  requireRole("user"),
  validateScheduleAuction,
  wrap(userController.scheduleAuction)
);

router.get(
  "/getAllArtworks",
  requireAuth,
  requireRole("user"),
  wrap(userController.getAllArtworks)
);

router.post(
  "/createPaymentIntent",
  requireAuth,
  requireRole("user"),
  wrap(userController.createPaymentIntent)
);

router.post(
  "/confirmDeposit",
  requireAuth,
  requireRole("user"),
  wrap(userController.confirmDeposit)
);

router.get(
  "/getWallet",
  requireAuth,
  requireRole("user"),
  wrap(userController.getWallet)
);

router.get(
  "/getArtworkById/:artworkId",
  requireAuth,
  requireRole("user"),
  wrap(userController.getArtworkById)
);

router.get(
  "/getArtworkBids/:artworkId",
  requireAuth,
  requireRole("user"),
  wrap(userController.getArtworkBidHistory)
);

router.get(
  "/getBids",
  requireAuth,
  requireRole("user"),
  wrap(userController.getBids)
);

router.get(
  '/getTransactions',
  requireAuth,
  requireRole('user'),
  wrap(userController.getTransactions)
)

export default router;
