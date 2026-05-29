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

export const updateCourseSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const courseIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CourseIdParams = z.infer<typeof courseIdParamsSchema>;

export const createLessonSchema = z.object({
  title: z.string().min(1),
  videoUrl: z.string().min(1),
  orderIndex: z.number().int().positive(),
});

export const updateLessonSchema = z.object({
  title: z.string().min(1).optional(),
  videoUrl: z.string().min(1).optional(),
  orderIndex: z.number().int().positive().optional(),
});

export const lessonIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type LessonIdParams = z.infer<typeof lessonIdParamsSchema>;
