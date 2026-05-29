import type { Request, Response } from "express";
import { createUserSchema, createCourseSchema, grantAccessSchema, updateCourseSchema, courseIdParamsSchema } from "../schemas/admin.schema";
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

export async function getAllCourses(_req: Request, res: Response) {
  const allCourses = await adminService.getAllCourses();
  res.json(allCourses);
}

export async function getAllUsers(_req: Request, res: Response) {
  const allUsers = await adminService.getAllUsers();
  res.json(allUsers);
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
