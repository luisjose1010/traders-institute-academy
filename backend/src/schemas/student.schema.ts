import { z } from "zod";

export const courseIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CourseIdParams = z.infer<typeof courseIdParamsSchema>;
