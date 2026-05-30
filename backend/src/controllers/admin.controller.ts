import type { Request, Response } from "express";
import { createUserSchema, createCourseSchema, grantAccessSchema, updateCourseSchema, updateUserSchema, courseIdParamsSchema, userIdParamsSchema, createLessonSchema, updateLessonSchema, lessonIdParamsSchema } from "../schemas/admin.schema";
import * as adminService from "../services/admin.service";

export async function createUser(req: Request, res: Response) {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const user = await adminService.createUser(parsed.data);
  res.status(201).json(user);
}

export async function createCourse(req: Request, res: Response) {
  const parsed = createCourseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const course = await adminService.createCourse(parsed.data);
  res.status(201).json(course);
}

export async function grantAccess(req: Request, res: Response) {
  const parsed = grantAccessSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const result = await adminService.grantAccess(parsed.data);
  res.status(201).json(result);
}

export async function getAllCourses(req: Request, res: Response) {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
  const search = (req.query.search as string) || "";
  const status = req.query.status as "active" | "archived" | undefined;

  const result = await adminService.getAllCourses(page, limit, search, status);
  res.json(result);
}

export async function getAllUsers(req: Request, res: Response) {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
  const search = (req.query.search as string) || "";
  const role = req.query.role as "admin" | "student" | undefined;

  const result = await adminService.getAllUsers(page, limit, search, role);
  res.json(result);
}

export async function updateCourse(req: Request, res: Response) {
  const params = courseIdParamsSchema.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid course ID" });
    return;
  }

  const parsed = updateCourseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const course = await adminService.updateCourse(params.data.id, parsed.data);
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  res.json(course);
}

export async function updateUser(req: Request, res: Response) {
  const params = userIdParamsSchema.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const user = await adminService.updateUser(params.data.id, parsed.data);
  if (!user) {
    res.status(404).json({ error: "User not found or no fields to update" });
    return;
  }

  res.json(user);
}

export async function deleteCourse(req: Request, res: Response) {
  const params = courseIdParamsSchema.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid course ID" });
    return;
  }

  const course = await adminService.deleteCourse(params.data.id);
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  res.json(course);
}

export async function getLessonsByCourse(req: Request, res: Response) {
  const params = courseIdParamsSchema.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid course ID" });
    return;
  }

  const result = await adminService.getLessonsByCourse(params.data.id);
  res.json(result);
}

export async function createLesson(req: Request, res: Response) {
  const params = courseIdParamsSchema.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid course ID" });
    return;
  }

  const parsed = createLessonSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const lesson = await adminService.createLesson(params.data.id, parsed.data);
  res.status(201).json(lesson);
}

export async function updateLesson(req: Request, res: Response) {
  const params = lessonIdParamsSchema.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid lesson ID" });
    return;
  }

  const parsed = updateLessonSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const lesson = await adminService.updateLesson(params.data.id, parsed.data);
  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }

  res.json(lesson);
}

export async function deleteLesson(req: Request, res: Response) {
  const params = lessonIdParamsSchema.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid lesson ID" });
    return;
  }

  const lesson = await adminService.deleteLesson(params.data.id);
  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }

  res.json(lesson);
}

export async function revokeAccess(req: Request, res: Response) {
  const parsed = grantAccessSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const result = await adminService.revokeAccess(parsed.data.userId, parsed.data.courseId);
  res.json(result);
}

export async function getStudentAccess(req: Request, res: Response) {
  const userId = String(req.params.userId || "");
  if (!userId) {
    res.status(400).json({ error: "User ID required" });
    return;
  }

  const access = await adminService.getStudentAccess(userId);
  res.json(access);
}
