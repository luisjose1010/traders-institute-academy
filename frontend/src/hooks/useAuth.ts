import { useState, useCallback } from "react";
import { api } from "@/lib/api";

const TOKEN_KEY = "tia_token";
const USER_KEY = "tia_user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "student";
  initials: string;
}

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function makeInitials(name: string): string {
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);

  const login = useCallback(async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await api.auth.login(email, password);
      const authUser: AuthUser = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role as "admin" | "student",
        initials: makeInitials(res.user.name),
      };
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
      setUser(authUser);
      return { ok: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      return { ok: false, error: message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return { user, login, logout, isAuthenticated: user !== null, isAdmin: user?.role === "admin" };
}
