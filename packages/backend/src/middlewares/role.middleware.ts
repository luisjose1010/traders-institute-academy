import type { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

export function requireStudent(req: Request, res: Response, next: NextFunction) {
  if (req.role !== "student") {
    res.status(403).json({ error: "Student access required" });
    return;
  }
  next();
}
