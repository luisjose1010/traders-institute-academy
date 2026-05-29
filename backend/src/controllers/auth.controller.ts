import type { Request, Response } from "express";
import { loginSchema, updateProfileSchema, forgotPasswordSchema, resetPasswordSchema } from "../schemas/auth.schema";
import * as authService from "../services/auth.service";

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const result = await authService.login(parsed.data);
  if (!result) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  res.json(result);
}

export async function updateProfile(req: Request, res: Response) {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const userId = req.userId!;
  const result = await authService.updateProfile(userId, parsed.data);
  if (!result) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(result);
}

export async function forgotPassword(req: Request, res: Response) {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const result = await authService.forgotPassword(parsed.data.email);
  res.json(result);
}

export async function resetPassword(req: Request, res: Response) {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const result = await authService.resetPassword(parsed.data.token, parsed.data.password);
  if (!result) {
    res.status(400).json({ error: "Invalid or expired reset token" });
    return;
  }

  res.json(result);
}
