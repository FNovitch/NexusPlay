import { create } from "zustand";
import { persist } from "zustand/middleware";
import { demoMode } from "../config/env";
import { api } from "../lib/api";

type User = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ARTISAN" | "ADMIN";
  storeId?: string | null;
  isDeleted?: boolean;
  status?: string;
};

type AuthState = {
  token?: string;
  user?: User;
  sessionChecked: boolean;
  login: (email: string, password: string) => Promise<User>;
  refreshSession: () => Promise<void>;
  setSession: (token: string, user: User) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      sessionChecked: false,
      login: async (email, password) => {
        const { data } = await api.post<{ data?: { token: string; user: User }; token?: string; user?: User }>("/login", { email, password });
        const session = data.data ?? { token: data.token!, user: data.user! };
        localStorage.setItem("nexus-token", session.token);
        set({ token: session.token, user: session.user, sessionChecked: true });
        return session.user;
      },
      refreshSession: async () => {
        const token = localStorage.getItem("nexus-token");
        if (!token) {
          set({ sessionChecked: true });
          return;
        }
        if (token.startsWith("demo-")) {
          if (!demoMode) {
            localStorage.removeItem("nexus-token");
            set({ token: undefined, user: undefined, sessionChecked: true });
          } else {
            set({ sessionChecked: true });
          }
          return;
        }

        try {
          const { data } = await api.get<{ user?: User; data?: { user: User } }>("/me");
          const user = data.data?.user ?? data.user;
          if (user) {
            set({ token, user, sessionChecked: true });
            return;
          }
          localStorage.removeItem("nexus-token");
          set({ token: undefined, user: undefined, sessionChecked: true });
        } catch {
          localStorage.removeItem("nexus-token");
          set({ token: undefined, user: undefined, sessionChecked: true });
        }
      },
      setSession: (token, user) => {
        localStorage.setItem("nexus-token", token);
        set({ token, user, sessionChecked: true });
      },
      logout: () => {
        localStorage.removeItem("nexus-token");
        set({ token: undefined, user: undefined, sessionChecked: true });
      }
    }),
    { name: "nexus-auth" }
  )
);
