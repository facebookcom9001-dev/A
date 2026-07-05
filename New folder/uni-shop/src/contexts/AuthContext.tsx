import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

export interface AuthUser {
  id: number;
  name: string;
  university: string;
  bio: string | null;
  avatarUrl: string | null;
  email: string;
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  sendOtp: (email: string) => Promise<{ devCode?: string; emailSent?: boolean }>;
  verifyOtp: (email: string, code: string) => Promise<{ isNewUser: boolean }>;
  setupProfile: (data: { name: string; university: string; avatarUrl?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "uni_shop_token";

async function apiFetch<T>(path: string, options?: RequestInit, token?: string | null): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "خطأ غير متوقع" }));
    throw new Error(err.error || "خطأ في الاتصال");
  }
  return res.json();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async (t: string | null) => {
    if (!t) { setUser(null); setIsLoading(false); return; }
    try {
      const data = await apiFetch<AuthUser>("/auth/me", undefined, t);
      setUser(data);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe(token);
  }, []);

  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);

  const refetchUser = useCallback(async () => {
    await fetchMe(token);
  }, [token, fetchMe]);

  const sendOtp = async (email: string) => {
    return apiFetch<{ devCode?: string; emailSent?: boolean }>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  };

  const verifyOtp = async (email: string, code: string) => {
    const data = await apiFetch<{ token: string; isNewUser: boolean }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    if (!data.isNewUser) {
      await fetchMe(data.token);
    }
    return { isNewUser: data.isNewUser };
  };

  const setupProfile = async (profileData: { name: string; university: string; avatarUrl?: string }) => {
    const t = localStorage.getItem(TOKEN_KEY);
    const data = await apiFetch<AuthUser>("/auth/setup-profile", {
      method: "POST",
      body: JSON.stringify(profileData),
    }, t);
    setUser(data);
  };

  const logout = async () => {
    const t = localStorage.getItem(TOKEN_KEY);
    await apiFetch("/auth/logout", { method: "POST" }, t).catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, sendOtp, verifyOtp, setupProfile, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
