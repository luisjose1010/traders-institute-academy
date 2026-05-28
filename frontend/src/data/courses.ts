/**
 * COURSES DATA — Edit this file to manage all courses across the site.
 *
 * This array is the single source of truth for:
 *   - The "Curriculum" section on the landing page
 *   - The student dashboard course cards
 *   - The admin panel course list
 *
 * To add a course: push a new object following the Course interface.
 * To remove: delete or comment out the entry.
 * To reorder: change the `order` field.
 */

import { BookOpen, LineChart, Shield, TrendingUp, BarChart2, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type CourseLevel = "Beginner" | "Intermediate" | "Advanced" | "Essential";

export interface Course {
  id: string;
  order: number;
  title: string;
  description: string;
  duration: string;       // e.g. "4 Weeks"
  level: CourseLevel;
  lessonsCount: number;   // approximate lesson count shown to students
  icon: LucideIcon;
  // Gradient used as fallback when no thumbnail is available
  gradient: string;
}

export const COURSES: Course[] = [
  {
    id: "course-foundations",
    order: 1,
    title: "Foundations",
    description:
      "Build the foundational knowledge required to operate in the markets. Covers core concepts, platform usage, and essential terminology.",
    duration: "2 Weeks",
    level: "Beginner",
    lessonsCount: 10,
    icon: BookOpen,
    gradient: "linear-gradient(135deg, #1a1a0a 0%, #2a2200 50%, #1a1a00 100%)",
  },
  {
    id: "course-technical-analysis",
    order: 2,
    title: "Technical Analysis",
    description:
      "Learn to read charts, identify patterns, and apply technical indicators to find high-probability trade setups.",
    duration: "4 Weeks",
    level: "Intermediate",
    lessonsCount: 18,
    icon: LineChart,
    gradient: "linear-gradient(135deg, #0a1a0a 0%, #00220a 50%, #001a10 100%)",
  },
  {
    id: "course-risk-management",
    order: 3,
    title: "Risk Management",
    description:
      "Master position sizing, risk-reward ratios, and capital preservation strategies. The foundation of consistent profitability.",
    duration: "2 Weeks",
    level: "Essential",
    lessonsCount: 8,
    icon: Shield,
    gradient: "linear-gradient(135deg, #1a0a0a 0%, #220000 50%, #1a0a00 100%)",
  },
  {
    id: "course-advanced-strategies",
    order: 4,
    title: "Advanced Strategies",
    description:
      "Explore institutional-grade strategies, multi-timeframe analysis, and systematic approaches to market execution.",
    duration: "4 Weeks",
    level: "Advanced",
    lessonsCount: 20,
    icon: TrendingUp,
    gradient: "linear-gradient(135deg, #0a0a1a 0%, #00002a 50%, #0a001a 100%)",
  },
];

export const LEVEL_COLORS: Record<CourseLevel, { bg: string; text: string; border: string }> = {
  Beginner:     { bg: "rgba(39,174,96,0.12)",  text: "#27ae60", border: "rgba(39,174,96,0.25)"  },
  Intermediate: { bg: "rgba(201,168,76,0.12)", text: "#C9A84C", border: "rgba(201,168,76,0.25)" },
  Essential:    { bg: "rgba(231,76,60,0.12)",  text: "#e74c3c", border: "rgba(231,76,60,0.25)"  },
  Advanced:     { bg: "rgba(155,89,182,0.12)", text: "#9b59b6", border: "rgba(155,89,182,0.25)" },
};
