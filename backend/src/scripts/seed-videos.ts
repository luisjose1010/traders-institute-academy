import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("TURSO_DATABASE_URL is required");
    process.exit(1);
  }

  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  console.log("Connected to DB. Seeding valid video URLs for testing...");

  // Select random active youtube videos to use as seed data
  const sampleVideos = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Rickroll
    "https://www.youtube.com/watch?v=jNQXAC9IVRw", // Me at the zoo
    "https://www.youtube.com/watch?v=tgbNymZ7vqY", // Muppets
    "https://www.youtube.com/watch?v=L_jWHffIx5E"  // Smash Mouth
  ];

  try {
    const allLessons = await db.query.lessons.findMany();
    
    if (allLessons.length === 0) {
      console.log("No lessons found. Creating some dummy lessons for the first course...");
      const course = await db.query.courses.findFirst();
      if (course) {
        await db.insert(schema.lessons).values([
          { courseId: course.id, title: "Market Structure", videoUrl: sampleVideos[0], orderIndex: 1 },
          { courseId: course.id, title: "Liquidity Concepts", videoUrl: sampleVideos[1], orderIndex: 2 },
          { courseId: course.id, title: "Order Blocks", videoUrl: sampleVideos[2], orderIndex: 3 }
        ]);
        console.log("Created 3 dummy lessons.");
      }
    } else {
      console.log(`Found ${allLessons.length} lessons. Updating URLs...`);
      for (let i = 0; i < allLessons.length; i++) {
        const lesson = allLessons[i];
        const newUrl = sampleVideos[i % sampleVideos.length];
        
        await db.update(schema.lessons)
          .set({ videoUrl: newUrl })
          .where(eq(schema.lessons.id, lesson.id));
      }
      console.log("Updated all lessons with valid video URLs.");
    }
  } catch (error) {
    console.error("Error seeding:", error);
  } finally {
    process.exit(0);
  }
}

main();
