import type { NextFunction, Request, Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "./error.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        sellerId?: string;
      };
    }
  }
}

type JwtPayload = {
  sub: string;
  role: UserRole;
};

export function signToken(payload: JwtPayload) {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return next(new AppError("Autenticacao obrigatoria", 401));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      include: { seller: { select: { id: true } }, artisan: { select: { storeId: true } } }
    });

    if (!user || user.isDeleted) {
      return next(new AppError("Usuario nao encontrado", 401));
    }

    req.user = {
      id: user.id,
      role: user.role,
      sellerId: user.storeId ?? user.artisan?.storeId ?? user.seller?.id ?? undefined
    };
    next();
  } catch {
    next(new AppError("Token invalido ou expirado", 401));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("Permissao insuficiente", 403));
    }

    next();
  };
}

export async function requireArtisan(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new AppError("Autenticacao obrigatoria", 401));
  }

  if (req.user.role !== UserRole.ARTISAN || !req.user.sellerId) {
    return next(new AppError("Acesso exclusivo para artesoes", 403));
  }

  const artisan = await prisma.artisan.findUnique({ where: { userId: req.user.id }, include: { store: true } });
  if (!artisan || artisan.isDeleted || !artisan.active || artisan.blocked || artisan.status !== "APPROVED" || artisan.store?.status !== "APPROVED") {
    return next(new AppError("Artesao sem permissao para esta acao", 403));
  }

  next();
}

export async function requireCustomer(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new AppError("Autenticacao obrigatoria", 401));
  }

  if (req.user.role !== UserRole.CUSTOMER) {
    return next(new AppError("Acesso exclusivo para clientes", 403));
  }

  const customer = await prisma.customer.findUnique({ where: { userId: req.user.id } });
  if (!customer || customer.isDeleted || !customer.active || customer.blocked) {
    return next(new AppError("Cliente sem permissao para esta acao", 403));
  }

  next();
}

export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(new AppError("Autenticacao obrigatoria", 401));
  if (req.user.role !== UserRole.ADMIN) return next(new AppError("Acesso exclusivo para administradores", 403));
  const admin = await prisma.admin.findUnique({ where: { userId: req.user.id } });
  if (!admin || admin.isDeleted || !admin.active) return next(new AppError("Administrador inativo", 403));
  next();
}
