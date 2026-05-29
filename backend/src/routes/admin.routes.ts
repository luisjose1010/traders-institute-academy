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

router.get("/courses/:id/lessons", adminController.getLessonsByCourse);
router.post("/courses/:id/lessons", adminController.createLesson);
router.put("/lessons/:id", adminController.updateLesson);
router.delete("/lessons/:id", adminController.deleteLesson);

export default router;
