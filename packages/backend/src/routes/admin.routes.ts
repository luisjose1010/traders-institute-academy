import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import * as adminController from "../controllers/admin.controller";

const router = Router();

router.use(authMiddleware, requireAdmin);

router.post("/users", adminController.createUser);
router.post("/courses", adminController.createCourse);
router.post("/grant-access", adminController.grantAccess);

export default router;
