"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type TeacherUser = {
  role: "teacher";
  id: string;
  name: string;
  classCode: string;
  avatarUrl?: string;
};

export type StudentUser = {
  role: "student";
  id: string;
  nickname: string;
  classCode: string;
  grade: number;
  coins: number;
  level: number;
  currentOperation: string;
  avatarOutfit: Record<string, string>;
  avatarUrl?: string;
};

export type AppUser = TeacherUser | StudentUser;

type AuthContextType = {
  user: AppUser | null;
  ready: boolean;
  setUser: (u: AppUser | null) => void;
  updateStudent: (patch: Partial<StudentUser>) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "rr_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setUserState(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  function setUser(u: AppUser | null) {
    setUserState(u);
    try {
      if (u) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  function updateStudent(patch: Partial<StudentUser>) {
    setUserState((prev) => {
      if (!prev || prev.role !== "student") return prev;
      const next = { ...prev, ...patch } as StudentUser;
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, ready, setUser, updateStudent, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
