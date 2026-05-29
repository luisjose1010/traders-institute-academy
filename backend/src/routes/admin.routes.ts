import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import * as adminController from "../controllers/admin.controller";

const router = Router();

router.use(authMiddleware, requireAdmin);

router.get("/courses", adminController.getAllCourses);
router.get("/users", adminController.getAllUsers);
router.post("/users", adminController.createUser);
router.post("/courses", adminController.createCourse);
router.put("/courses/:id", adminController.updateCourse);
router.delete("/courses/:id", adminController.deleteCourse);
router.post("/grant-access", adminController.grantAccess);

export default router;
