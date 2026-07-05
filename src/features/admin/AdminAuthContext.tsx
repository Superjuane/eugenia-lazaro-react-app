/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

type AdminSession = {
  authenticated: boolean;
  username: string | null;
};

type AdminAuthContextValue = {
  session: AdminSession;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const emptySession: AdminSession = {
  authenticated: false,
  username: null,
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession>(emptySession);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshSession() {
    const response = await fetch("/api/admin/session", { credentials: "include" });
    const nextSession = (await response.json()) as AdminSession;

    setSession(nextSession);
    setIsLoading(false);
  }

  async function login(username: string, password: string) {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      setSession(emptySession);
      return false;
    }

    await refreshSession();
    return true;
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setSession(emptySession);
  }

  useEffect(() => {
    let isCancelled = false;

    fetch("/api/admin/session", { credentials: "include" })
      .then((response) => response.json() as Promise<AdminSession>)
      .then((nextSession) => {
        if (!isCancelled) {
          setSession(nextSession);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setSession(emptySession);
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <AdminAuthContext.Provider value={{ session, isLoading, login, logout, refreshSession }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const value = useContext(AdminAuthContext);

  if (!value) {
    throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  }

  return value;
}
