"use client";

import * as React from "react";
import type { AuthUser, LoginInput, RegisterInput } from "@bluechain/shared";
import { authApi } from "@/lib/api";

const TOKEN_KEY = "bluechain.token";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthState | null>(null);

export function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

function persistToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const stored = readToken();
    if (!stored) {
      setLoading(false);
      return;
    }
    setToken(stored);
    authApi
      .me(stored)
      .then(setUser)
      .catch(() => {
        persistToken(null);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const apply = React.useCallback((result: { token: string; user: AuthUser }) => {
    persistToken(result.token);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const login = React.useCallback(
    async (input: LoginInput) => apply(await authApi.login(input)),
    [apply],
  );

  const register = React.useCallback(
    async (input: RegisterInput) => apply(await authApi.register(input)),
    [apply],
  );

  const logout = React.useCallback(() => {
    persistToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const value = React.useMemo<AuthState>(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
