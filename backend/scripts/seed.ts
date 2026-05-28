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

  const passwordHash = await bcrypt.hash("Admin1234", 10);
  const id = uuid();

  await client.execute({
    sql: `INSERT OR IGNORE INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
    args: [id, "Admin", "admin@mail.com", passwordHash, "admin"],
  });

  console.log(`Admin user created: admin@mail.com / Admin1234`);
  console.log(`ID: ${id}`);
  console.log("Done.");
}

seed().catch(console.error);
