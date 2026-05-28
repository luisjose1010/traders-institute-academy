import { and, eq } from "drizzle-orm";
import { db } from "../db/index";
import { courses, lessons, courseAccess } from "../db/schema";

export async function getMyCourses(userId: string) {
  return db
    .select({
      id: courses.id,
      name: courses.name,
      description: courses.description,
      status: courses.status,
    })
    .from(courses)
    .innerJoin(courseAccess, eq(courses.id, courseAccess.courseId))
    .where(eq(courseAccess.userId, userId));
}

export async function getCourseLessons(userId: string, courseId: number) {
  const [access] = await db
    .select()
    .from(courseAccess)
    .where(
      and(
        eq(courseAccess.userId, userId),
        eq(courseAccess.courseId, courseId)
      )
    )
    .limit(1);

  if (!access) return null;

  return db
    .select()
    .from(lessons)
    .where(eq(lessons.courseId, courseId))
    .orderBy(lessons.orderIndex);
}
