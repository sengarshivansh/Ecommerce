import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as authApi from "@/api/auth";
import { clearToken, getToken, setToken } from "@/api/client";
import type { User } from "@/types";

// ---------------------------------------------------------------------------
// AuthContext makes the current user available to every component without
// passing props down manually ("prop drilling"). Any component can call
// `useAuth()` to read the user or trigger login/logout.
// ---------------------------------------------------------------------------

interface AuthState {
  user: User | null;
  loading: boolean; // true while we check an existing token on first load
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: authApi.RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On startup: if a token is already stored, fetch the user it belongs to.
  useEffect(() => {
    async function bootstrap() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        setUser(await authApi.getMe());
      } catch {
        clearToken(); // token expired or invalid
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  async function login(username: string, password: string) {
    const { access_token } = await authApi.login(username, password);
    setToken(access_token);
    setUser(await authApi.getMe());
  }

  async function register(payload: authApi.RegisterPayload) {
    await authApi.register(payload);
    // The backend doesn't auto-login on register, so we log in right after.
    await login(payload.username, payload.password);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  const value: AuthState = {
    user,
    loading,
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
