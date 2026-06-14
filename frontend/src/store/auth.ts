import { create } from "zustand";
import { persist } from "zustand/middleware";
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
  login: (email: string, password: string) => Promise<User>;
  setSession: (token: string, user: User) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      login: async (email, password) => {
        const { data } = await api.post<{ data?: { token: string; user: User }; token?: string; user?: User }>("/login", { email, password });
        const session = data.data ?? { token: data.token!, user: data.user! };
        localStorage.setItem("nexus-token", session.token);
        set({ token: session.token, user: session.user });
        return session.user;
      },
      setSession: (token, user) => {
        localStorage.setItem("nexus-token", token);
        set({ token, user });
      },
      logout: () => {
        localStorage.removeItem("nexus-token");
        set({ token: undefined, user: undefined });
      }
    }),
    { name: "nexus-auth" }
  )
);
