import { useState, useEffect } from "react";

const AUTH_KEY = "tia_session";

export interface AuthUser {
  name: string;
  email: string;
  initials: string;
}

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);

  const login = (email: string, _password: string): boolean => {
    if (!email) return false;
    const name = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    const parts = name.trim().split(" ");
    const initials = parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
    const authUser: AuthUser = { name, email, initials };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return true;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  return { user, login, logout, isAuthenticated: user !== null };
}
