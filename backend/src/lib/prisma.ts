<<<<<<< HEAD
import "../config/env.js";
=======
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
});
