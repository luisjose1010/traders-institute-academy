import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/index";
import { notifications } from "../db/schema";

export async function createNotification(userId: string, title: string, message: string) {
  const [notif] = await db
    .insert(notifications)
    .values({ userId, title, message, createdAt: new Date() })
    .returning();

  return notif;
}

export async function getNotifications(userId: string) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function getUnreadCount(userId: string) {
  const result = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));

  return result.length;
}

export async function markAsRead(notificationId: number, userId: string) {
  const [notif] = await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
    .returning();

  return notif ?? null;
}

export async function markAllAsRead(userId: string) {
  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));

  return { marked: true };
}
