import type { AdminPermissionLevel } from "./user";

export type AdminResponseDTO = {
  id: string;
  userId: string;
  userType: "ADMIN";
  name: string;
  email: string;
  permissionLevel: AdminPermissionLevel;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateAdminDTO = {
  name: string;
  email: string;
  password: string;
  permissionLevel: AdminPermissionLevel;
};
