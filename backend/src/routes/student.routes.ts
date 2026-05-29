import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireStudent } from "../middlewares/role.middleware";
import * as studentController from "../controllers/student.controller";

const router = Router();

router.use(authMiddleware, requireStudent);

router.get("/my-courses", studentController.getMyCourses);
router.get("/courses/:id", studentController.getCourse);
router.get("/course/:id/lessons", studentController.getCourseLessons);
router.get("/course/:id/progress", studentController.getCourseProgress);
router.post("/course/:id/complete-lesson", studentController.markLessonComplete);
router.get("/progress", studentController.getMyProgress);

export default router;
