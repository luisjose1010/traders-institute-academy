import type { Request, Response } from "express";
import { courseIdParamsSchema, lessonIdBodySchema } from "../schemas/student.schema";
import * as studentService from "../services/student.service";

export async function getMyCourses(req: Request, res: Response) {
  const userId = req.userId!;
  const courses = await studentService.getMyCourses(userId);
  res.json(courses);
}

export async function getCourseLessons(req: Request, res: Response) {
  const userId = req.userId!;
  const parsed = courseIdParamsSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid course ID" });
    return;
  }

  const result = await studentService.getCourseLessons(userId, parsed.data.id);
  if (!result) {
    res.status(403).json({ error: "You do not have access to this course" });
    return;
  }

  res.json(result);
}

export async function getCourse(req: Request, res: Response) {
  const userId = req.userId!;
  const parsed = courseIdParamsSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid course ID" });
    return;
  }

  const course = await studentService.getCourse(userId, parsed.data.id);
  if (!course) {
    res.status(403).json({ error: "You do not have access to this course" });
    return;
  }

  res.json(course);
}

export async function markLessonComplete(req: Request, res: Response) {
  const userId = req.userId!;
  const parsed = lessonIdBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid lesson ID" });
    return;
  }

  const result = await studentService.markLessonComplete(userId, parsed.data.lessonId);
  if (!result) {
    res.status(403).json({ error: "Lesson not found or no access" });
    return;
  }

  res.json(result);
}

export async function getCourseProgress(req: Request, res: Response) {
  const userId = req.userId!;
  const parsed = courseIdParamsSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid course ID" });
    return;
  }

  const progress = await studentService.getCourseProgress(userId, parsed.data.id);
  if (!progress) {
    res.status(403).json({ error: "You do not have access to this course" });
    return;
  }

  res.json(progress);
}

export async function getMyProgress(req: Request, res: Response) {
  const userId = req.userId!;
  const progress = await studentService.getMyProgress(userId);
  res.json(progress);
}
