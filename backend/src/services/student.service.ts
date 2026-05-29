import { and, eq } from "drizzle-orm";
import { db } from "../db/index";
import { courses, lessons, courseAccess, lessonProgress } from "../db/schema";

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

export async function getCourse(userId: string, courseId: number) {
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

  const [course] = await db
    .select({
      id: courses.id,
      name: courses.name,
      description: courses.description,
      status: courses.status,
    })
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);

  return course ?? null;
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

export async function markLessonComplete(userId: string, lessonId: number) {
  const [lesson] = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, lessonId))
    .limit(1);

  if (!lesson) return null;

  const [access] = await db
    .select()
    .from(courseAccess)
    .where(
      and(
        eq(courseAccess.userId, userId),
        eq(courseAccess.courseId, lesson.courseId)
      )
    )
    .limit(1);

  if (!access) return null;

  await db.insert(lessonProgress).values({
    userId,
    lessonId,
    completedAt: new Date(),
  }).onConflictDoNothing();

  return { lessonId, completed: true };
}

export async function getCourseProgress(userId: string, courseId: number) {
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

  const courseLessons = await db
    .select({ id: lessons.id })
    .from(lessons)
    .where(eq(lessons.courseId, courseId));

  const completed = await db
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId));

  const completedIds = new Set(completed.map(c => c.lessonId));
  const total = courseLessons.length;
  const done = courseLessons.filter(l => completedIds.has(l.id)).length;

  return { courseId, total, completed: done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
}

export async function getMyProgress(userId: string) {
  return db
    .select({
      lessonId: lessonProgress.lessonId,
      completedAt: lessonProgress.completedAt,
    })
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId));
}
