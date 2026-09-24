import { Router } from "express";
import * as authController from "../controller/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
const router = Router();

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.get("/me", authMiddleware, authController.me);
router.patch("/me", authMiddleware, authController.updateMe);
export default router;
