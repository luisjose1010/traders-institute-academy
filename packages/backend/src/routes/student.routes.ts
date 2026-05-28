import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireStudent } from "../middlewares/role.middleware";
import * as studentController from "../controllers/student.controller";

const router = Router();

router.use(authMiddleware, requireStudent);

router.get("/my-courses", studentController.getMyCourses);
router.get("/course/:id/lessons", studentController.getCourseLessons);

export default router;
