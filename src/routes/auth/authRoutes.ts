import "reflect-metadata";
import { Router } from "express";
import { container } from "tsyringe";
import { AuthController } from "../../controllers/authController";

const router = Router();
// console.log('resolving')
const authController = container.resolve(AuthController);
// console.log('resolved')

router.post("/sentOtp", authController.requestOtp);
router.post("/verifyOtp", authController.verifyOtp);
router.post("/registerUser", authController.registerUser);
router.post("/findByEmailAndSentOtp", authController.findByEmailAndSentOtp);
router.post("/resetPassword", authController.resetPassword);
router.post("/login", authController.login);
router.get("/refresh", authController.refresh);



export default router;
