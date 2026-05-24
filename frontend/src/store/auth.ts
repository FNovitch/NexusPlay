import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../lib/api";
import { loginCustomer } from "../services/customers";

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
  setSession: (token: string, user: User) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      login: async (email, password) => {
        const data = await loginCustomer(email, password);
        localStorage.setItem("kriar-token", data.token);
        set({ token: data.token, user: data.user });
      },
      setSession: (token, user) => {
        localStorage.setItem("kriar-token", token);
        set({ token, user });
      },
      logout: () => {
        localStorage.removeItem("kriar-token");
        set({ token: undefined, user: undefined });
      }
    }),
    { name: "kriar-auth" }
  )
);
