import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../middlewares/auth.js";
import { AppError } from "../middlewares/error.js";
import { slugify } from "../utils/slugify.js";

export async function register(req: Request, res: Response) {
  const { name, email, password, role, seller } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    throw new AppError("E-mail ja cadastrado", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role === UserRole.SELLER ? UserRole.SELLER : UserRole.CUSTOMER,
      seller:
        role === UserRole.SELLER && seller
          ? {
              create: {
                storeName: seller.storeName,
                slug: slugify(seller.storeName),
                bio: seller.bio,
                story: seller.story,
                avatarUrl: seller.avatarUrl,
                coverUrl: seller.coverUrl
              }
            }
          : undefined
    },
    include: { seller: true }
  });

  const token = signToken({ sub: user.id, role: user.role });
  res.status(201).json({ token, user: sanitizeUser(user) });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
    include: { seller: true }
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError("Credenciais invalidas", 401);
  }

  const token = signToken({ sub: user.id, role: user.role });
  res.json({ token, user: sanitizeUser(user) });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { seller: true }
  });

  if (!user) {
    throw new AppError("Usuario nao encontrado", 404);
  }

  res.json({ user: sanitizeUser(user) });
}

function sanitizeUser(user: Record<string, unknown>) {
  const { passwordHash, ...safe } = user;
  return safe;
}
