import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { ArtisanSubscriptionStatus, SellerStatus, UserRole } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../middlewares/auth.js";
import { AppError } from "../middlewares/error.js";
import { mapArtisanToResponse } from "../modules/users/user.mapper.js";
import type { CreateArtisanDTO, UpdateArtisanDTO } from "../modules/users/user.types.js";
import { slugify } from "../utils/slugify.js";

async function uniqueStoreSlug(baseName: string, tx: Prisma.TransactionClient = prisma) {
  const baseSlug = slugify(baseName);
  let candidate = baseSlug;
  let suffix = 2;

  while (await tx.seller.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function mapStatus(status: SellerStatus) {
  return status === SellerStatus.APPROVED ? "aprovado" : status === SellerStatus.REJECTED ? "recusado" : "pendente";
}

function publicArtisanSummary(artisan: { id: string; name: string; user: { email: string }; status: SellerStatus }) {
  return {
    id: artisan.id,
    nome: artisan.name,
    email: artisan.user.email,
    status: mapStatus(artisan.status)
  };
}

export async function registerArtisan(req: Request, res: Response) {
  const body = req.body as CreateArtisanDTO;

  const [emailOwner, documentOwner, cpfOwner, phoneOwner] = await Promise.all([
    prisma.user.findUnique({ where: { email: body.email }, select: { id: true } }),
    prisma.artisan.findUnique({ where: { document: body.document }, select: { id: true } }),
    body.cpf ? prisma.artisan.findFirst({ where: { cpf: body.cpf }, select: { id: true } }) : null,
    prisma.artisan.findFirst({ where: { phone: body.phone }, select: { id: true } })
  ]);

  if (emailOwner) {
    throw new AppError("E-mail ja cadastrado", 409, { email: "Este e-mail ja esta cadastrado." });
  }

  if (documentOwner || cpfOwner) {
    throw new AppError("CPF ou CNPJ ja cadastrado", 409, { document: "Este CPF ou CNPJ ja esta cadastrado." });
  }

  if (phoneOwner) {
    throw new AppError("Telefone ja cadastrado", 409, { phone: "Este telefone ja esta cadastrado." });
  }

  const passwordHash = await bcrypt.hash(body.password, 12);
  const artisan = await prisma.$transaction(async (tx) => {
    const trialStart = new Date();
    const trialEnd = new Date(trialStart);
    trialEnd.setDate(trialEnd.getDate() + 7);
    const storeSlug = await uniqueStoreSlug(body.storeSlug ?? body.storeName, tx);
    const user = await tx.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash,
        role: UserRole.ARTISAN
      }
    });

    const seller = await tx.seller.create({
      data: {
        userId: user.id,
        storeName: body.storeName,
        slug: storeSlug,
        bio: body.storeDescription.slice(0, 240),
        story: body.storeDescription,
        status: SellerStatus.PENDING
      }
    });

    const artisanProfile = await tx.artisan.create({
      data: {
        userId: user.id,
        name: body.name,
        cpf: body.document.length === 11 ? body.document : body.cpf ?? null,
        phone: body.phone,
        storeId: seller.id,
        storeName: body.storeName,
        storeSlug,
        storeDescription: body.storeDescription,
        craftCategories: body.craftCategories,
        document: body.document,
        acceptsLocalPickup: body.acceptsLocalPickup ?? false,
        pickupInstructions: body.pickupInstructions ?? null,
        trialStart,
        trialEnd,
        status: SellerStatus.PENDING
      }
    });

    await tx.artisanSubscription.create({
      data: {
        artisanId: artisanProfile.id,
        status: ArtisanSubscriptionStatus.TRIAL_ACTIVE,
        trialStart,
        trialEnd
      }
    });

    await tx.user.update({ where: { id: user.id }, data: { storeId: seller.id } });
    await tx.address.create({
      data: {
        ...body.address,
        userId: user.id,
        artisanId: artisanProfile.id,
        isDefault: true
      }
    });

    return tx.artisan.findUniqueOrThrow({
      where: { id: artisanProfile.id },
      include: { user: true, addresses: true }
    });
  });

  res.status(201).json({
    success: true,
    message: "Cadastro de artesao realizado com sucesso. Aguarde aprovacao.",
    data: publicArtisanSummary(artisan),
    artisan: mapArtisanToResponse(artisan)
  });
}

export async function loginArtisan(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
    include: { artisan: true, seller: true }
  });

  if (!user || user.role !== UserRole.ARTISAN || user.isDeleted || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError("E-mail ou senha invalidos.", 401);
  }

  if (!user.artisan || user.artisan.isDeleted) {
    throw new AppError("Perfil de artesao nao encontrado", 404);
  }

  const token = signToken({ sub: user.id, role: user.role });
  res.status(200).json({
    success: true,
    message: "Login realizado com sucesso.",
    token,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: user.storeId ?? user.artisan.storeId,
        status: mapStatus(user.artisan.status)
      }
    }
  });
}

export async function getMyArtisanProfile(req: Request, res: Response) {
  const artisan = await prisma.artisan.findUnique({
    where: { userId: req.user!.id },
    include: { user: true, addresses: true }
  });

  if (!artisan || artisan.isDeleted) {
    throw new AppError("Perfil de artesao nao encontrado", 404);
  }

  res.json({ success: true, data: { artisan: mapArtisanToResponse(artisan) }, artisan: mapArtisanToResponse(artisan) });
}

export async function updateMyArtisanProfile(req: Request, res: Response) {
  const body = req.body as UpdateArtisanDTO;
  const current = await prisma.artisan.findUnique({
    where: { userId: req.user!.id },
    include: { addresses: true }
  });

  if (!current || current.isDeleted) {
    throw new AppError("Perfil de artesao nao encontrado", 404);
  }

  if (body.document && body.document !== current.document) {
    const owner = await prisma.artisan.findFirst({ where: { document: body.document, id: { not: current.id } }, select: { id: true } });
    if (owner) {
      throw new AppError("CPF ou CNPJ ja cadastrado", 409, { document: "Este CPF ou CNPJ ja esta cadastrado." });
    }
  }

  if (body.phone && body.phone !== current.phone) {
    const owner = await prisma.artisan.findFirst({ where: { phone: body.phone, id: { not: current.id } }, select: { id: true } });
    if (owner) {
      throw new AppError("Telefone ja cadastrado", 409, { phone: "Este telefone ja esta cadastrado." });
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const storeSlug = body.storeName ? await uniqueStoreSlug(body.storeSlug ?? body.storeName, tx) : undefined;
    await tx.artisan.update({
      where: { id: current.id },
      data: {
        name: body.name,
        cpf: body.document?.length === 11 ? body.document : body.cpf,
        phone: body.phone,
        storeName: body.storeName,
        storeSlug,
        storeDescription: body.storeDescription,
        craftCategories: body.craftCategories,
        document: body.document,
        acceptsLocalPickup: body.acceptsLocalPickup,
        pickupInstructions: body.pickupInstructions
      }
    });

    if (body.name) {
      await tx.user.update({ where: { id: current.userId }, data: { name: body.name } });
    }

    if (current.storeId) {
      await tx.seller.update({
        where: { id: current.storeId },
        data: {
          storeName: body.storeName,
          slug: storeSlug,
          bio: body.storeDescription?.slice(0, 240),
          story: body.storeDescription
        }
      });
    }

    if (body.address) {
      const address = current.addresses.find((item) => item.isDefault) ?? current.addresses[0];
      if (address) {
        await tx.address.update({ where: { id: address.id }, data: body.address });
      } else {
        await tx.address.create({
          data: {
            street: body.address.street ?? "",
            number: body.address.number ?? "",
            complement: body.address.complement ?? null,
            neighborhood: body.address.neighborhood ?? "",
            city: body.address.city ?? "",
            state: body.address.state ?? "",
            zipCode: body.address.zipCode ?? "",
            country: body.address.country ?? "BR",
            userId: current.userId,
            artisanId: current.id,
            isDefault: true
          }
        });
      }
    }

    return tx.artisan.findUniqueOrThrow({
      where: { id: current.id },
      include: { user: true, addresses: true }
    });
  });

  res.json({
    success: true,
    message: "Perfil de artesao atualizado com sucesso.",
    data: { artisan: mapArtisanToResponse(updated) },
    artisan: mapArtisanToResponse(updated)
  });
}
