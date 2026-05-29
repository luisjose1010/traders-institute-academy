import { sqliteTable, text, integer, unique } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "student"] }).notNull().default("student"),
});

export const courses = sqliteTable("courses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("active"),
});

export const lessons = sqliteTable("lessons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  videoUrl: text("video_url").notNull(),
  orderIndex: integer("order_index").notNull(),
});

export const courseAccess = sqliteTable(
  "course_access",
  {
    userId: text("user_id").notNull().references(() => users.id),
    courseId: integer("course_id").notNull().references(() => courses.id),
  },
  (table) => ({
    pk: unique().on(table.userId, table.courseId),
  })
);

export const lessonProgress = sqliteTable(
  "lesson_progress",
  {
    userId: text("user_id").notNull().references(() => users.id),
    lessonId: integer("lesson_id").notNull().references(() => lessons.id),
    completedAt: integer("completed_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    pk: unique().on(table.userId, table.lessonId),
  })
);
