import type { Request, Response } from "express";
import * as notificationService from "../services/notification.service";

export async function getNotifications(req: Request, res: Response) {
  const userId = req.userId!;
  const notifs = await notificationService.getNotifications(userId);
  res.json(notifs);
}

export async function getUnreadCount(req: Request, res: Response) {
  const userId = req.userId!;
  const count = await notificationService.getUnreadCount(userId);
  res.json({ count });
}

export async function markAsRead(req: Request, res: Response) {
  const userId = req.userId!;
  const id = parseInt(String(req.params.id || ""));
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid notification ID" });
    return;
  }

  const notif = await notificationService.markAsRead(id, userId);
  if (!notif) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  res.json(notif);
}

export async function markAllAsRead(req: Request, res: Response) {
  const userId = req.userId!;
  const result = await notificationService.markAllAsRead(userId);
  res.json(result);
}
