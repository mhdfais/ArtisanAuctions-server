import "reflect-metadata";
import express from 'express'
import { container } from "tsyringe";
import { AuthController } from "../../controllers/authController";

const router=express.Router()
// console.log('resolving')
const authController = container.resolve(AuthController);
// console.log('resolved')
const wrap = (fn: Function) => (req: express.Request, res: express.Response) => fn(req, res);
router.post("/sentOtp", wrap(authController.requestOtp));
router.post("/verifyOtp", wrap(authController.verifyOtp));
router.post("/registerUser", wrap(authController.registerUser));
router.post("/findByEmailAndSentOtp", wrap(authController.findByEmailAndSentOtp));
router.post("/resetPassword", wrap(authController.resetPassword));
router.post("/login", wrap(authController.login));
router.get("/refresh", wrap(authController.refresh));
router.post("/logout", wrap(authController.logout));

export default router;
