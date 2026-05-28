import type { Request, Response } from "express";
import { createUserSchema, createCourseSchema, grantAccessSchema } from "../schemas/admin.schema";
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
