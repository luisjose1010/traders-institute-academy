import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index";
import { users, passwordResetTokens } from "../db/schema";
import { signToken } from "../lib/jwt";
import { sendPasswordResetEmail } from "./email.service";
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

export async function forgotPassword(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) return { sent: true };

  const token = uuid();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.insert(passwordResetTokens).values({
    id: uuid(),
    userId: user.id,
    token,
    expiresAt,
  });

  await sendPasswordResetEmail(user.email, token);

  return { sent: true };
}

export async function resetPassword(token: string, newPassword: string) {
  const [resetToken] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false)
      )
    )
    .limit(1);

  if (!resetToken) return null;
  if (resetToken.expiresAt < new Date()) return null;

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, resetToken.userId));

  await db
    .update(passwordResetTokens)
    .set({ used: true })
    .where(eq(passwordResetTokens.id, resetToken.id));

  return { reset: true };
}
