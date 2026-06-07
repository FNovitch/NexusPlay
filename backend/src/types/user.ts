export type UserRole = "CUSTOMER" | "ARTISAN" | "ADMIN";
export type UserType = "CUSTOMER" | "ARTISAN" | "ADMIN";
export type AdminPermissionLevel = "SUPER_ADMIN" | "MANAGER" | "SUPPORT";

export type UserResponseDTO = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId: string | null;
  status?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserBaseDTO = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};
