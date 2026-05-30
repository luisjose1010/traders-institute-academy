import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { eq, and, like, desc, sql } from "drizzle-orm";
import { db } from "../db/index";
import { users, courses, courseAccess, lessons } from "../db/schema";
import { createNotification } from "./notification.service";
import { sendWelcomeEmail, sendAccessGrantedEmail } from "./email.service";
import type { CreateUserInput, CreateCourseInput, GrantAccessInput, UpdateCourseInput, CreateLessonInput, UpdateLessonInput, UpdateUserInput } from "../schemas/admin.schema";

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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

  try {
    await createNotification(id, "Welcome!", `Welcome to Traders Institute Academy, ${input.name}!`);
    if (input.role === "student") await sendWelcomeEmail(input.email, input.name);
  } catch {}

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

  try {
    const [student] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
    const [course] = await db.select().from(courses).where(eq(courses.id, input.courseId)).limit(1);
    if (student && course) {
      await createNotification(student.id, "Course Access Granted", `You now have access to "${course.name}". Start learning!`);
      await sendAccessGrantedEmail(student.email, student.name, course.name);
    }
  } catch {}

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

export async function getAllCourses(page = 1, limit = 10, search = "", status?: "active" | "archived"): Promise<PaginatedResult<typeof courses.$inferSelect>> {
  const offset = (page - 1) * limit;
  const searchPattern = search ? `%${search}%` : undefined;
  const dbStatus = status === "archived" ? "inactive" : status;

  const whereClause = searchPattern
    ? and(dbStatus ? eq(courses.status, dbStatus) : undefined, like(courses.name, searchPattern))
    : dbStatus ? eq(courses.status, dbStatus) : undefined;

  const items = await db
    .select()
    .from(courses)
    .where(whereClause)
    .orderBy(desc(courses.id))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(courses)
    .where(whereClause);

  return {
    items,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
}

export async function getAllUsers(page = 1, limit = 10, search = "", role?: "admin" | "student"): Promise<PaginatedResult<{ id: string; name: string; email: string; role: string }>> {
  const offset = (page - 1) * limit;
  const searchPattern = search ? `%${search}%` : undefined;

  const whereClause = searchPattern
    ? and(
        role ? eq(users.role, role) : undefined,
        like(users.name, searchPattern)
      )
    : role ? eq(users.role, role) : undefined;

  const items = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(whereClause)
    .orderBy(desc(users.id))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(whereClause);

  return {
    items,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
}

export async function updateUser(userId: string, input: UpdateUserInput) {
  const updateData: Record<string, unknown> = {};
  if (input.name) updateData.name = input.name;
  if (input.email) updateData.email = input.email;
  if (input.password) {
    updateData.passwordHash = await bcrypt.hash(input.password, 10);
  }
  if (Object.keys(updateData).length === 0) return null;

  const [user] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId))
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

  return user ?? null;
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
