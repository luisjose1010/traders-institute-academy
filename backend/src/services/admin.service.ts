import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index";
import { users, courses, courseAccess, lessons } from "../db/schema";
import type { CreateUserInput, CreateCourseInput, GrantAccessInput, UpdateCourseInput, CreateLessonInput, UpdateLessonInput } from "../schemas/admin.schema";

export async function createUser(input: CreateUserInput) {
  const passwordHash = await bcrypt.hash(input.password, 10);
  const id = uuid();

  await db.insert(users).values({
    id,
    name: input.name,
    email: input.email,
    passwordHash,
    role: input.role,
  });

  return { id, name: input.name, email: input.email, role: input.role };
}

export async function createCourse(input: CreateCourseInput) {
  const [course] = await db
    .insert(courses)
    .values(input)
    .returning();

  return course;
}

export async function grantAccess(input: GrantAccessInput) {
  await db.insert(courseAccess).values({
    userId: input.userId,
    courseId: input.courseId,
  }).onConflictDoNothing();

  return { granted: true };
}

export async function revokeAccess(userId: string, courseId: number) {
  await db.delete(courseAccess).where(
    and(eq(courseAccess.userId, userId), eq(courseAccess.courseId, courseId))
  );

  return { revoked: true };
}

export async function getStudentAccess(userId: string) {
  return db
    .select({
      courseId: courseAccess.courseId,
      courseName: courses.name,
    })
    .from(courseAccess)
    .innerJoin(courses, eq(courseAccess.courseId, courses.id))
    .where(eq(courseAccess.userId, userId));
}

export async function getAllCourses() {
  return db.select().from(courses);
}

export async function getAllUsers() {
  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
  }).from(users);
}

export async function updateCourse(courseId: number, input: UpdateCourseInput) {
  const [course] = await db
    .update(courses)
    .set(input)
    .where(eq(courses.id, courseId))
    .returning();

  return course ?? null;
}

export async function deleteCourse(courseId: number) {
  const [course] = await db
    .update(courses)
    .set({ status: "inactive" })
    .where(eq(courses.id, courseId))
    .returning();

  return course ?? null;
}

export async function getLessonsByCourse(courseId: number) {
  return db
    .select()
    .from(lessons)
    .where(eq(lessons.courseId, courseId))
    .orderBy(lessons.orderIndex);
}

export async function createLesson(courseId: number, input: CreateLessonInput) {
  const [lesson] = await db
    .insert(lessons)
    .values({ ...input, courseId })
    .returning();

  return lesson;
}

export async function updateLesson(lessonId: number, input: UpdateLessonInput) {
  const [lesson] = await db
    .update(lessons)
    .set(input)
    .where(eq(lessons.id, lessonId))
    .returning();

  return lesson ?? null;
}

export async function deleteLesson(lessonId: number) {
  const [lesson] = await db
    .delete(lessons)
    .where(eq(lessons.id, lessonId))
    .returning();

  return lesson ?? null;
}
