import "dotenv/config";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function seed() {
  console.log("Seeding database...");

  // Admin user
  const adminPasswordHash = await bcrypt.hash("Admin1234", 10);
  const existingAdmin = await client.execute({
    sql: `SELECT id FROM users WHERE email = ?`,
    args: ["admin@mail.com"],
  });
  let adminId: string;
  if (existingAdmin.rows.length > 0) {
    adminId = existingAdmin.rows[0].id as string;
    console.log(`Admin already exists: admin@mail.com (id: ${adminId})`);
  } else {
    adminId = uuid();
    await client.execute({
      sql: `INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
      args: [adminId, "Admin", "admin@mail.com", adminPasswordHash, "admin"],
    });
    console.log(`Admin created: admin@mail.com / Admin1234 (id: ${adminId})`);
  }

  // Test student
  const studentPasswordHash = await bcrypt.hash("Student1234", 10);
  const existingStudent = await client.execute({
    sql: `SELECT id FROM users WHERE email = ?`,
    args: ["student@mail.com"],
  });
  let studentId: string;
  if (existingStudent.rows.length > 0) {
    studentId = existingStudent.rows[0].id as string;
    console.log(`Student already exists: student@mail.com (id: ${studentId})`);
  } else {
    studentId = uuid();
    await client.execute({
      sql: `INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
      args: [studentId, "Luis Medina", "student@mail.com", studentPasswordHash, "student"],
    });
    console.log(`Student created: student@mail.com / Student1234 (id: ${studentId})`);
  }

  // Courses
  const coursesData = [
    { name: "Foundations", description: "Build the foundational knowledge required to operate in the markets. Covers core concepts, platform usage, and essential terminology." },
    { name: "Technical Analysis", description: "Learn to read charts, identify patterns, and apply technical indicators to find high-probability trade setups." },
    { name: "Risk Management", description: "Master position sizing, risk-reward ratios, and capital preservation strategies. The foundation of consistent profitability." },
    { name: "Advanced Strategies", description: "Explore institutional-grade strategies, multi-timeframe analysis, and systematic approaches to market execution." },
  ];

  for (const course of coursesData) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO courses (name, description, status) VALUES (?, ?, ?)`,
      args: [course.name, course.description, "active"],
    });
  }
  console.log(`Created ${coursesData.length} courses`);

  // Lessons for course 1 (Foundations)
  const lessons = [
    { courseId: 1, title: "What is Forex?", videoUrl: "https://example.com/lesson-1", orderIndex: 1 },
    { courseId: 1, title: "How the Market Works", videoUrl: "https://example.com/lesson-2", orderIndex: 2 },
    { courseId: 1, title: "Currency Pairs Explained", videoUrl: "https://example.com/lesson-3", orderIndex: 3 },
    { courseId: 1, title: "Setting Up Your Trading Platform", videoUrl: "https://example.com/lesson-4", orderIndex: 4 },
    { courseId: 1, title: "Reading Candlestick Charts", videoUrl: "https://example.com/lesson-5", orderIndex: 5 },
    { courseId: 2, title: "Support and Resistance", videoUrl: "https://example.com/lesson-6", orderIndex: 1 },
    { courseId: 2, title: "Trend Lines and Channels", videoUrl: "https://example.com/lesson-7", orderIndex: 2 },
    { courseId: 2, title: "Moving Averages", videoUrl: "https://example.com/lesson-8", orderIndex: 3 },
    { courseId: 2, title: "RSI and MACD Indicators", videoUrl: "https://example.com/lesson-9", orderIndex: 4 },
    { courseId: 3, title: "Position Sizing", videoUrl: "https://example.com/lesson-10", orderIndex: 1 },
    { courseId: 3, title: "Risk-Reward Ratios", videoUrl: "https://example.com/lesson-11", orderIndex: 2 },
    { courseId: 3, title: "Stop Loss Strategies", videoUrl: "https://example.com/lesson-12", orderIndex: 3 },
    { courseId: 4, title: "Multi-Timeframe Analysis", videoUrl: "https://example.com/lesson-13", orderIndex: 1 },
    { courseId: 4, title: "Institutional Order Flow", videoUrl: "https://example.com/lesson-14", orderIndex: 2 },
    { courseId: 4, title: "Building a Trading Plan", videoUrl: "https://example.com/lesson-15", orderIndex: 3 },
  ];

  for (const lesson of lessons) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO lessons (course_id, title, video_url, order_index) VALUES (?, ?, ?, ?)`,
      args: [lesson.courseId, lesson.title, lesson.videoUrl, lesson.orderIndex],
    });
  }
  console.log(`Created ${lessons.length} lessons`);

  // Grant student access to courses 1 and 2
  await client.execute({
    sql: `INSERT OR IGNORE INTO course_access (user_id, course_id) VALUES (?, ?)`,
    args: [studentId, 1],
  });
  await client.execute({
    sql: `INSERT OR IGNORE INTO course_access (user_id, course_id) VALUES (?, ?)`,
    args: [studentId, 2],
  });
  console.log(`Granted student access to courses 1 and 2`);

  console.log("\nSeeding complete!");
  console.log("================================");
  console.log("Admin:   admin@mail.com / Admin1234");
  console.log("Student: student@mail.com / Student1234");
  console.log("================================");
}

seed().catch(console.error);
