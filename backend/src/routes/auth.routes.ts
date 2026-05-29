import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import * as authController from "../controllers/auth.controller";

const router = Router();

router.post("/login", authController.login);
router.put("/profile", authMiddleware, authController.updateProfile);

export default router;
