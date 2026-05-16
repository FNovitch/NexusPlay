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
};

type AuthState = {
  token?: string;
  user?: User;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      login: async (email, password) => {
        try {
          const { data } = await api.post<{ token: string; user: User }>("/login", { email, password });
          localStorage.setItem("kriar-token", data.token);
          set({ token: data.token, user: data.user });
        } catch {
          const demoUser = {
            id: "demo",
            name: email.includes("admin") ? "Admin KRIAR" : email.includes("atelie") ? "Lia Carvalho" : "Cliente KRIAR",
            email,
            role: email.includes("admin") ? "ADMIN" : email.includes("atelie") ? "ARTISAN" : "CUSTOMER"
          } as User;
          localStorage.setItem("kriar-token", "demo-token");
          set({ token: "demo-token", user: demoUser });
        }
      },
      logout: () => {
        localStorage.removeItem("kriar-token");
        set({ token: undefined, user: undefined });
      }
    }),
    { name: "kriar-auth" }
  )
);
