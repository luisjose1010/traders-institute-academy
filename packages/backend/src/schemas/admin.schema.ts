import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "student"]).default("student"),
});

export const createCourseSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const grantAccessSchema = z.object({
  userId: z.string().uuid(),
  courseId: z.number().int().positive(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type GrantAccessInput = z.infer<typeof grantAccessSchema>;
