import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../middlewares/auth.js";
import { AppError } from "../middlewares/error.js";
import { mapUserToResponse } from "../modules/users/user.mapper.js";
import { slugify } from "../utils/slugify.js";

export async function register(req: Request, res: Response) {
  const { name, email, password, role = UserRole.CUSTOMER, seller, artisan, customer, admin } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    throw new AppError("E-mail ja cadastrado", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const normalizedRole = role === UserRole.ARTISAN ? UserRole.ARTISAN : role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.CUSTOMER;
  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: normalizedRole
      }
    });

    if (normalizedRole === UserRole.ARTISAN) {
      const artisanData = artisan ?? {
        storeName: seller.storeName,
        storeDescription: seller.story ?? seller.bio,
        document: "00000000000",
        phone: "0000000000",
        address: {
          street: "Endereco pendente",
          number: "0",
          neighborhood: "Pendente",
          city: "Pendente",
          state: "CE",
          zipCode: "00000000",
          country: "BR",
          isDefault: true
        }
      };
      const storeSlug = artisanData.storeSlug ? slugify(artisanData.storeSlug) : slugify(artisanData.storeName);
      const store = await tx.seller.create({
        data: {
          userId: createdUser.id,
          storeName: artisanData.storeName,
          slug: storeSlug,
          bio: seller?.bio ?? artisanData.storeDescription.slice(0, 240),
          story: seller?.story ?? artisanData.storeDescription,
          avatarUrl: seller?.avatarUrl,
          coverUrl: seller?.coverUrl
        }
      });
      const artisanProfile = await tx.artisan.create({
        data: {
          userId: createdUser.id,
          name,
          cpf: artisanData.cpf ?? null,
          phone: artisanData.phone,
          storeId: store.id,
          storeName: artisanData.storeName,
          storeSlug,
          storeDescription: artisanData.storeDescription,
          document: artisanData.document
        }
      });
      await tx.address.create({
        data: {
          ...artisanData.address,
          userId: createdUser.id,
          artisanId: artisanProfile.id,
          isDefault: artisanData.address.isDefault ?? true
        }
      });
      return tx.user.update({ where: { id: createdUser.id }, data: { storeId: store.id }, include: { seller: true, artisan: true } });
    }

    if (normalizedRole === UserRole.ADMIN) {
      await tx.admin.create({
        data: {
          userId: createdUser.id,
          name,
          permissionLevel: admin.permissionLevel
        }
      });
      return tx.user.findUniqueOrThrow({ where: { id: createdUser.id }, include: { adminProfile: true } });
    }

    if (customer) {
      const customerProfile = await tx.customer.create({
        data: {
          userId: createdUser.id,
          name,
          birthDate: new Date(customer.birthDate),
          cpf: customer.cpf,
          phone: customer.phone
        }
      });
      await tx.address.create({
        data: {
          ...customer.address,
          userId: createdUser.id,
          customerId: customerProfile.id,
          isDefault: customer.address.isDefault ?? true
        }
      });
    }

    return tx.user.findUniqueOrThrow({ where: { id: createdUser.id }, include: { customer: true } });
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

  if (!user || user.isDeleted || !(await bcrypt.compare(password, user.passwordHash))) {
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

  if (!user || user.isDeleted) {
    throw new AppError("Usuario nao encontrado", 404);
  }

  res.json({ user: sanitizeUser(user) });
}

function sanitizeUser(user: Record<string, unknown>) {
  return mapUserToResponse(user as Parameters<typeof mapUserToResponse>[0]);
}
