import { AdminPermissionLevel, ArtisanSubscriptionStatus, ProductStatus, SellerStatus, SubscriptionPlanType, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";
import { slugify } from "../src/utils/slugify.js";

const categories = [
  { name: "Hardware e periféricos", description: "Teclados, mouses e acessórios de alta precisão para PC gamer." },
  { name: "Áudio e streaming", description: "Headsets, microfones e equipamentos para partidas, lives e calls." },
  { name: "Consoles e controles", description: "Controles, docks, carregadores e acessórios multiplataforma." },
  { name: "Setup e ergonomia", description: "Iluminação, suportes e organização para uma mesa confortável." },
  { name: "Colecionáveis e decoração", description: "Peças de coleção, displays e objetos para personalizar o espaço gamer." }
];
const legacyCategorySlugs = ["perifericos", "audio-gamer", "setup-rgb", "colecionaveis", "vestuario-gamer"];
const plans = [
  { name: "Plano mensal", description: "Publique produtos gamer na NexusPlay por 30 dias.", price: 9.9, durationDays: 30, type: SubscriptionPlanType.MONTHLY },
  { name: "Plano anual", description: "Publique produtos gamer na NexusPlay por 365 dias com desconto.", price: 99, durationDays: 365, type: SubscriptionPlanType.YEARLY }
];

const showcaseProducts = [
  {
    name: "Teclado Hall Effect NovaStrike 75",
    category: "Hardware e periféricos",
    description: "Teclado compacto com switches magnéticos, iluminação por tecla e construção sólida para setups competitivos.",
    price: 589.9,
    stock: 18,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
    weight: 0.92,
    dimensions: { width: 33, height: 4, length: 14 },
    variations: [{ name: "Layout", options: ["ANSI", "ABNT2"] }]
  },
  {
    name: "Headset ArenaCast USB-C",
    category: "Áudio e streaming",
    description: "Headset gamer com microfone destacável, almofadas respiráveis e conexão USB-C para partidas, lives e reuniões.",
    price: 369.9,
    stock: 24,
    image: "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=900&q=80",
    weight: 0.45,
    dimensions: { width: 19, height: 21, length: 9 },
    variations: [{ name: "Cor", options: ["Preto", "Branco"] }]
  },
  {
    name: "Controle ProPad X Wireless",
    category: "Consoles e controles",
    description: "Controle sem fio com gatilhos responsivos, bateria de longa duração e pegada confortável para consoles e PC.",
    price: 289.9,
    stock: 30,
    image: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=900&q=80",
    weight: 0.38,
    dimensions: { width: 16, height: 7, length: 12 },
    variations: [{ name: "Cor", options: ["Carbon", "Neon"] }]
  },
  {
    name: "Display Cartridge Frame",
    category: "Colecionáveis e decoração",
    description: "Moldura decorativa para cartuchos e cards, ideal para dar personalidade ao espaço gamer sem perder organização.",
    price: 129.9,
    stock: 15,
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80",
    weight: 0.7,
    dimensions: { width: 30, height: 4, length: 24 },
    variations: [{ name: "Acabamento", options: ["Preto fosco", "Madeira escura"] }]
  }
];

async function seedCoreData() {
  await Promise.all(categories.map((category) =>
    prisma.category.upsert({
      where: { slug: slugify(category.name) },
      update: { name: category.name, description: category.description, active: true },
      create: {
        name: category.name,
        slug: slugify(category.name),
        description: category.description,
        active: true
      }
    })
  ));

  await prisma.category.updateMany({
    where: { slug: { in: legacyCategorySlugs } },
    data: { active: false }
  });

  await Promise.all(plans.map((plan) =>
    prisma.subscriptionPlan.upsert({
      where: { type: plan.type },
      update: { name: plan.name, description: plan.description, price: plan.price, durationDays: plan.durationDays, active: true },
      create: plan
    })
  ));
}

async function seedShowcaseCatalog() {
  const passwordHash = await bcrypt.hash(process.env.SEED_DEMO_SELLER_PASSWORD ?? `seed-${process.env.JWT_SECRET ?? "nexusplay"}`, 12);
  const user = await prisma.user.upsert({
    where: { email: "vitrine@nexusplay.demo" },
    update: { name: "Nexus Gear", passwordHash, role: UserRole.ARTISAN, isDeleted: false },
    create: {
      name: "Nexus Gear",
      email: "vitrine@nexusplay.demo",
      passwordHash,
      role: UserRole.ARTISAN
    }
  });

  const seller = await prisma.seller.upsert({
    where: { slug: "nexus-gear" },
    update: {
      storeName: "Nexus Gear",
      bio: "Loja demo de periféricos, áudio e acessórios gamer para a vitrine NexusPlay.",
      story: "A Nexus Gear existe como loja demonstrativa para apresentar catálogo, carrinho, frete e checkout em um ambiente de portfólio.",
      avatarUrl: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=400&q=80",
      coverUrl: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=1400&q=80",
      status: SellerStatus.APPROVED,
      rating: 4.9,
      salesCount: 516
    },
    create: {
      userId: user.id,
      storeName: "Nexus Gear",
      slug: "nexus-gear",
      bio: "Loja demo de periféricos, áudio e acessórios gamer para a vitrine NexusPlay.",
      story: "A Nexus Gear existe como loja demonstrativa para apresentar catálogo, carrinho, frete e checkout em um ambiente de portfólio.",
      avatarUrl: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=400&q=80",
      coverUrl: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=1400&q=80",
      status: SellerStatus.APPROVED,
      rating: 4.9,
      salesCount: 516
    }
  });

  await prisma.user.update({ where: { id: user.id }, data: { storeId: seller.id } });

  const trialStart = new Date();
  const trialEnd = new Date(trialStart);
  trialEnd.setFullYear(trialEnd.getFullYear() + 1);
  const artisan = await prisma.artisan.upsert({
    where: { userId: user.id },
    update: {
      storeId: seller.id,
      storeName: seller.storeName,
      storeSlug: seller.slug,
      status: SellerStatus.APPROVED,
      active: true,
      blocked: false,
      subscriptionActive: true,
      subscriptionExpiresAt: trialEnd
    },
    create: {
      userId: user.id,
      name: "Nexus Gear",
      phone: "11999990000",
      storeId: seller.id,
      storeName: seller.storeName,
      storeSlug: seller.slug,
      storeDescription: "Loja demo de produtos gamer criada para popular a vitrine publica do NexusPlay.",
      craftCategories: ["Perifericos", "Audio", "Setup"],
      document: "00000000000191",
      acceptsLocalPickup: true,
      pickupInstructions: "Retirada demo mediante confirmacao do pedido.",
      trialStart,
      trialEnd,
      subscriptionActive: true,
      subscriptionExpiresAt: trialEnd,
      status: SellerStatus.APPROVED
    }
  });

  const currentAddress = await prisma.address.findFirst({ where: { userId: user.id, artisanId: artisan.id } });
  const addressData = {
    street: "Avenida Paulista",
    number: "1000",
    complement: "Demo",
    neighborhood: "Bela Vista",
    city: "Sao Paulo",
    state: "SP",
    zipCode: "01310100",
    country: "BR",
    userId: user.id,
    artisanId: artisan.id,
    isDefault: true
  };
  if (currentAddress) {
    await prisma.address.update({ where: { id: currentAddress.id }, data: addressData });
  } else {
    await prisma.address.create({ data: addressData });
  }

  const monthlyPlan = await prisma.subscriptionPlan.findUnique({ where: { type: SubscriptionPlanType.MONTHLY } });
  const currentSubscription = await prisma.artisanSubscription.findFirst({ where: { artisanId: artisan.id } });
  const subscriptionData = {
    artisanId: artisan.id,
    planId: monthlyPlan?.id,
    status: ArtisanSubscriptionStatus.ACTIVE,
    trialStart,
    trialEnd,
    startDate: trialStart,
    expirationDate: trialEnd
  };
  if (currentSubscription) {
    await prisma.artisanSubscription.update({ where: { id: currentSubscription.id }, data: subscriptionData });
  } else {
    await prisma.artisanSubscription.create({ data: subscriptionData });
  }

  const categoryRecords = await prisma.category.findMany();
  const categoryByName = new Map(categoryRecords.map((category) => [category.name, category]));

  for (const item of showcaseProducts) {
    const category = categoryByName.get(item.category);
    if (!category) continue;
    const slug = slugify(item.name);
    const image = {
      url: item.image,
      publicId: `seed/${slug}`,
      filename: `${slug}.jpg`,
      alt: item.name
    };
    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        sellerId: seller.id,
        categoryId: category.id,
        description: item.description,
        price: item.price,
        stock: item.stock,
        categoryName: category.name,
        images: [image],
        mainImage: image,
        artisanId: artisan.id,
        artisanName: artisan.name,
        artisanSlug: seller.slug,
        dimensions: item.dimensions,
        variations: item.variations,
        weight: item.weight,
        shippingAvailable: true,
        pickupAvailable: true,
        pickupAddress: `${addressData.street}, ${addressData.number}, ${addressData.city} - ${addressData.state}`,
        status: ProductStatus.ACTIVE,
        averageRating: 4.8,
        totalReviews: 0,
        rating: 4.8,
        salesCount: 32
      },
      create: {
        sellerId: seller.id,
        categoryId: category.id,
        name: item.name,
        slug,
        description: item.description,
        price: item.price,
        stock: item.stock,
        categoryName: category.name,
        images: [image],
        mainImage: image,
        artisanId: artisan.id,
        artisanName: artisan.name,
        artisanSlug: seller.slug,
        dimensions: item.dimensions,
        variations: item.variations,
        weight: item.weight,
        shippingAvailable: true,
        pickupAvailable: true,
        pickupAddress: `${addressData.street}, ${addressData.number}, ${addressData.city} - ${addressData.state}`,
        status: ProductStatus.ACTIVE,
        averageRating: 4.8,
        totalReviews: 0,
        rating: 4.8,
        salesCount: 32
      }
    });

    await prisma.productImage.upsert({
      where: { publicId: image.publicId },
      update: { productId: product.id, url: image.url, fileName: image.filename },
      create: { productId: product.id, url: image.url, publicId: image.publicId, fileName: image.filename }
    });
  }
}

async function seedDemoCustomer() {
  const passwordHash = await bcrypt.hash(process.env.SEED_DEMO_CUSTOMER_PASSWORD ?? `customer-${process.env.JWT_SECRET ?? "nexusplay"}`, 12);
  const user = await prisma.user.upsert({
    where: { email: process.env.SEED_DEMO_CUSTOMER_EMAIL ?? "cliente@nexusplay.demo" },
    update: {
      name: "Cliente Demo",
      passwordHash,
      role: UserRole.CUSTOMER,
      isDeleted: false
    },
    create: {
      name: "Cliente Demo",
      email: process.env.SEED_DEMO_CUSTOMER_EMAIL ?? "cliente@nexusplay.demo",
      passwordHash,
      role: UserRole.CUSTOMER
    }
  });

  const customer = await prisma.customer.upsert({
    where: { userId: user.id },
    update: {
      name: "Cliente Demo",
      phone: "11988887777",
      active: true,
      blocked: false,
      isDeleted: false
    },
    create: {
      userId: user.id,
      name: "Cliente Demo",
      birthDate: new Date("1998-01-15T00:00:00.000Z"),
      cpf: "00000000191",
      phone: "11988887777",
      active: true
    }
  });

  const currentAddress = await prisma.address.findFirst({ where: { userId: user.id, customerId: customer.id } });
  const addressData = {
    street: "Rua Demo",
    number: "42",
    complement: "Apto 10",
    neighborhood: "Centro",
    city: "Sao Paulo",
    state: "SP",
    zipCode: "01001000",
    country: "BR",
    userId: user.id,
    customerId: customer.id,
    isDefault: true
  };
  if (currentAddress) {
    await prisma.address.update({ where: { id: currentAddress.id }, data: addressData });
  } else {
    await prisma.address.create({ data: addressData });
  }
}

async function seedOptionalDemoAdmin() {
  const email = process.env.SEED_DEMO_ADMIN_EMAIL;
  const password = process.env.SEED_DEMO_ADMIN_PASSWORD;
  if (!email || !password) return;

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Admin Demo",
      passwordHash,
      role: UserRole.ADMIN,
      isDeleted: false
    },
    create: {
      name: "Admin Demo",
      email,
      passwordHash,
      role: UserRole.ADMIN
    }
  });

  await prisma.admin.upsert({
    where: { userId: user.id },
    update: {
      name: "Admin Demo",
      permissionLevel: AdminPermissionLevel.SUPER_ADMIN,
      active: true,
      isDeleted: false
    },
    create: {
      userId: user.id,
      name: "Admin Demo",
      permissionLevel: AdminPermissionLevel.SUPER_ADMIN,
      active: true
    }
  });
}

async function main() {
  await seedCoreData();
  await seedShowcaseCatalog();
  await seedDemoCustomer();
  await seedOptionalDemoAdmin();

  console.log("Seed seguro concluido: categorias, planos, catalogo e contas demo atualizados. Admin demo so e criado com variaveis SEED_DEMO_ADMIN_*.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Erro ao executar seed.");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
