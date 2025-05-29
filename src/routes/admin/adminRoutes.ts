import { Router } from "express";
import { container } from "tsyringe";
import { AdminController } from "../../controllers/adminController";
import { requireAuth, requireRole } from "../../middlewares/authMiddleware";
import express from "express";

const adminController = container.resolve(AdminController);
const router = Router();

const wrap = (fn: Function) => (req: express.Request, res: express.Response) =>
  fn(req, res);
router.post("/login", wrap(adminController.login));
router.get("/refresh", wrap(adminController.refresh));
router.get(
  "/getApprovals",
  requireAuth,
  requireRole("admin"),
  wrap(adminController.getApprovals)
);
router.put(
  "/approve/:approvalId",
  requireAuth,
  requireRole("admin"),
  wrap(adminController.approve)
);
router.put(
  "/reject/:approvalId",
  requireAuth,
  requireRole("admin"),
  wrap(adminController.reject)
);

export default router;
