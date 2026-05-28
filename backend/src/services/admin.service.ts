import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { db } from "../db/index";
import { users, courses, courseAccess } from "../db/schema";
import type { CreateUserInput, CreateCourseInput, GrantAccessInput } from "../schemas/admin.schema";

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
  });

  return { granted: true };
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
