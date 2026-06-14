import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import type { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../middlewares/auth.js";
import { AppError } from "../middlewares/error.js";
import { mapCustomerToResponse } from "../modules/users/user.mapper.js";
import { sendPasswordResetEmail } from "../services/email.service.js";
import type { CreateCustomerDTO } from "../modules/users/user.types.js";

const passwordResetMessage = "Se o email existir, enviaremos instrucoes de recuperacao.";

function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function registerCustomer(req: Request, res: Response) {
  const body = req.body as CreateCustomerDTO;
  const [emailOwner, cpfOwner] = await Promise.all([
    prisma.user.findUnique({ where: { email: body.email }, select: { id: true } }),
    prisma.customer.findUnique({ where: { cpf: body.cpf }, select: { id: true } })
  ]);

  if (emailOwner) throw new AppError("E-mail já cadastrado", 409, { email: "Este e-mail já está cadastrado." });
  if (cpfOwner) throw new AppError("CPF já cadastrado", 409, { cpf: "Este CPF já está cadastrado." });

  const passwordHash = await bcrypt.hash(body.password, 12);
  const customer = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name: body.name, email: body.email, passwordHash, role: UserRole.CUSTOMER }
    });
    const profile = await tx.customer.create({
      data: {
        userId: user.id,
        name: body.name,
        birthDate: new Date(body.birthDate),
        cpf: body.cpf,
        phone: body.phone
      }
    });
    await tx.address.create({
      data: { ...body.address, userId: user.id, customerId: profile.id, isDefault: true }
    });
    return tx.customer.findUniqueOrThrow({ where: { id: profile.id }, include: { user: true, addresses: true } });
  });

  res.status(201).json({
    success: true,
    message: "Cadastro de cliente realizado com sucesso.",
    data: mapCustomerToResponse(customer)
  });
}

export async function loginCustomer(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email }, include: { customer: true } });
  if (
    !user ||
    user.role !== UserRole.CUSTOMER ||
    user.isDeleted ||
    !user.customer ||
    user.customer.isDeleted ||
    !user.customer.active ||
    user.customer.blocked ||
    !(await bcrypt.compare(password, user.passwordHash))
  ) {
    throw new AppError("E-mail ou senha inválidos.", 401);
  }
  const token = signToken({ sub: user.id, role: user.role });
  res.json({
    success: true,
    message: "Login realizado com sucesso.",
    data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
}

export async function forgotCustomerPassword(req: Request, res: Response) {
  const { email } = req.body as { email: string };
  const user = await prisma.user.findUnique({ where: { email }, include: { customer: true } });

  if (user?.role === UserRole.CUSTOMER && user.customer && !user.isDeleted && !user.customer.isDeleted) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordToken = hashResetToken(rawToken);
    const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken, resetPasswordExpires }
    });

    const resetUrl = `${env.FRONTEND_URL.replace(/\/$/, "")}/resetar-senha?token=${rawToken}`;
    try {
      await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });
    } catch (error) {
      if (env.NODE_ENV !== "production") {
        console.error("[customer:forgot-password]", error);
      }
    }
  }

  res.json({ success: true, message: passwordResetMessage });
}

export async function resetCustomerPassword(req: Request, res: Response) {
  const { token, password } = req.body as { token: string; password: string };
  const resetPasswordToken = hashResetToken(token);
  const user = await prisma.user.findFirst({
    where: {
      role: UserRole.CUSTOMER,
      isDeleted: false,
      resetPasswordToken,
      resetPasswordExpires: { gt: new Date() }
    },
    include: { customer: true }
  });

  if (!user || !user.customer || user.customer.isDeleted || !user.customer.active || user.customer.blocked) {
    throw new AppError("Token inválido ou expirado.", 400, { token: "Solicite uma nova recuperacao de senha." });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null
    }
  });

  res.json({ success: true, message: "Senha redefinida com sucesso." });
}

export async function getCustomerProfile(req: Request, res: Response) {
  const customer = await prisma.customer.findUnique({
    where: { userId: req.user!.id },
    include: { user: true, addresses: true }
  });
  if (!customer || customer.isDeleted) throw new AppError("Perfil de cliente não encontrado", 404);
  res.json({ success: true, data: mapCustomerToResponse(customer) });
}

export async function updateCustomerProfile(req: Request, res: Response) {
  const body = req.body as Partial<CreateCustomerDTO>;
  const current = await prisma.customer.findUnique({ where: { userId: req.user!.id }, include: { addresses: true } });
  if (!current || current.isDeleted) throw new AppError("Perfil de cliente não encontrado", 404);

  if (body.cpf && body.cpf !== current.cpf) {
    const owner = await prisma.customer.findUnique({ where: { cpf: body.cpf }, select: { id: true } });
    if (owner) throw new AppError("CPF já cadastrado", 409, { cpf: "Este CPF já está cadastrado." });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.customer.update({
      where: { id: current.id },
      data: {
        name: body.name,
        cpf: body.cpf,
        phone: body.phone,
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined
      }
    });
    if (body.name) await tx.user.update({ where: { id: current.userId }, data: { name: body.name } });
    if (body.address) {
      const address = current.addresses.find((item) => item.isDefault) ?? current.addresses[0];
      if (address) await tx.address.update({ where: { id: address.id }, data: body.address });
    }
    return tx.customer.findUniqueOrThrow({ where: { id: current.id }, include: { user: true, addresses: true } });
  });

  res.json({ success: true, message: "Perfil atualizado com sucesso.", data: mapCustomerToResponse(updated) });
}
