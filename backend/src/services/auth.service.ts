import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { users } from "../db/schema";
import { signToken } from "../lib/jwt";
import type { LoginInput, UpdateProfileInput } from "../schemas/auth.schema";

export async function login(input: LoginInput) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (!user) return null;

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) return null;

  const token = signToken({ userId: user.id, role: user.role as "admin" | "student" });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const updates: Partial<{ name: string; passwordHash: string }> = {};
  if (input.name) updates.name = input.name;
  if (input.password) updates.passwordHash = await bcrypt.hash(input.password, 10);

  if (Object.keys(updates).length === 0) return null;

  const [user] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, userId))
    .returning();

  return user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null;
}
