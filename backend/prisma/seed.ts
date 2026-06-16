import { AdminPermissionLevel, ArtisanSubscriptionStatus, ProductStatus, SellerStatus, SubscriptionPlanType, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

const demoCategories = [
  { name: "Hardware e periféricos", slug: "hardware-perifericos", description: "Teclados, mouses, mousepads e upgrades de precisão para PC gamer." },
  { name: "Áudio e streaming", slug: "audio-streaming", description: "Headsets, microfones, iluminação e acessórios para partidas, lives e calls." },
  { name: "Consoles e controles", slug: "consoles-controles", description: "Controles, docks, carregadores e acessórios multiplataforma." },
  { name: "Setup e ergonomia", slug: "setup-ergonomia", description: "Suportes, cadeiras, organização e iluminação para mesas confortáveis." },
  { name: "Colecionáveis e decoração", slug: "colecionaveis-decoracao", description: "Displays, estátuas, quadros e peças para personalizar o espaço gamer." },
  { name: "Moda e lifestyle geek", slug: "moda-lifestyle-geek", description: "Camisetas, pins, mochilas e itens de uso diário com identidade geek." }
];

const demoSellers = [
  {
    name: "Nexus Gear",
    slug: "nexus-gear",
    email: "nexus@nexusplay.demo",
    document: "00000000000191",
    phone: "11999990001",
    bio: "Hardware gamer selecionado para quem busca precisão, baixa latência e acabamento premium.",
    story: "A Nexus Gear foca em periféricos e equipamentos de performance para PC gamers, streamers e criadores que precisam de resposta rápida sem abrir mão de um setup limpo.",
    avatarUrl: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=1400&q=80",
    rating: 4.9,
    salesCount: 516,
    categories: ["Perifericos", "Audio", "Setup"]
  },
  {
    name: "Pixel Relic",
    slug: "pixel-relic",
    email: "pixel@nexusplay.demo",
    document: "00000000000272",
    phone: "11999990002",
    bio: "Colecionáveis, displays e decoração para transformar mesa, estante e sala gamer.",
    story: "A Pixel Relic cria uma curadoria de peças visuais inspiradas por jogos, ficção científica e cultura arcade, com foco em acabamento e presença de coleção.",
    avatarUrl: "https://images.unsplash.com/photo-1608889476518-738c9b1dcb40?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1608889476518-738c9b1dcb40?auto=format&fit=crop&w=1400&q=80",
    rating: 4.85,
    salesCount: 388,
    categories: ["Colecionaveis", "Decoracao", "Lifestyle"]
  },
  {
    name: "Arcade Vault",
    slug: "arcade-vault",
    email: "arcade@nexusplay.demo",
    document: "00000000000353",
    phone: "11999990003",
    bio: "Acessórios para consoles, iluminação e ergonomia para sessões longas de gameplay.",
    story: "A Arcade Vault reúne controles, bases, suportes e itens de conforto para jogadores que alternam entre PC, console e mobile sem bagunçar a estação.",
    avatarUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1400&q=80",
    rating: 4.92,
    salesCount: 642,
    categories: ["Consoles", "Ergonomia", "Acessorios"]
  },
  {
    name: "ByteForge Mods",
    slug: "byteforge-mods",
    email: "byteforge@nexusplay.demo",
    document: "00000000000434",
    phone: "11999990004",
    bio: "Upgrades, refrigeração e peças de modding para PCs com visual limpo e desempenho estável.",
    story: "A ByteForge Mods nasceu para aproximar customização de PC, airflow e estética premium de quem monta setups autorais para jogar, estudar e criar.",
    avatarUrl: "https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?auto=format&fit=crop&w=1400&q=80",
    rating: 4.87,
    salesCount: 274,
    categories: ["Hardware", "Modding", "Setup"]
  },
  {
    name: "Critical Loot",
    slug: "critical-loot",
    email: "loot@nexusplay.demo",
    document: "00000000000515",
    phone: "11999990005",
    bio: "Presentes geek, RPG, card games e colecionáveis para mesas com personalidade.",
    story: "A Critical Loot combina curadoria de RPG, board games, cards e peças decorativas para quem gosta de transformar fandom em objeto de coleção.",
    avatarUrl: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1400&q=80",
    rating: 4.8,
    salesCount: 331,
    categories: ["RPG", "Cards", "Presentes"]
  },
  {
    name: "StreamLab Station",
    slug: "streamlab-station",
    email: "streamlab@nexusplay.demo",
    document: "00000000000604",
    phone: "11999990006",
    bio: "Equipamentos de streaming, áudio, luz e organização para criadores de conteúdo.",
    story: "A StreamLab Station seleciona acessórios para transformar uma mesa comum em uma estação de gravação confiável, bonita e prática.",
    avatarUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1400&q=80",
    rating: 4.89,
    salesCount: 429,
    categories: ["Streaming", "Audio", "Iluminacao"]
  }
];

const demoProducts = [
  ["nexus-gear", "hardware-perifericos", "Teclado Hall Effect NovaStrike 75", "teclado-hall-effect-novastrike-75", 589.9, 14, 4.95, 152, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80"],
  ["nexus-gear", "hardware-perifericos", "Mouse Helios Pro Wireless 8K", "mouse-helios-pro-wireless-8k", 429.9, 18, 4.88, 117, "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80"],
  ["nexus-gear", "audio-streaming", "Headset ArenaCast USB-C", "headset-arenacast-usb-c", 369.9, 10, 4.9, 103, "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=900&q=80"],
  ["nexus-gear", "audio-streaming", "Microfone WaveForge RGB", "microfone-waveforge-rgb", 299.9, 11, 4.82, 86, "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=900&q=80"],
  ["nexus-gear", "setup-ergonomia", "Deskmat SpeedGrid XXL", "deskmat-speedgrid-xxl", 149.9, 21, 4.77, 94, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80"],
  ["nexus-gear", "hardware-perifericos", "Kit Keycaps Prism PBT", "kit-keycaps-prism-pbt", 219.9, 12, 4.83, 68, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80"],
  ["pixel-relic", "colecionaveis-decoracao", "Estátua Boss Arena Dragão Neon", "estatua-boss-arena-dragao-neon", 279.9, 6, 4.94, 71, "https://images.unsplash.com/photo-1608889476518-738c9b1dcb40?auto=format&fit=crop&w=900&q=80"],
  ["pixel-relic", "colecionaveis-decoracao", "Display Cartridge Frame", "display-cartridge-frame", 129.9, 20, 4.81, 92, "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80"],
  ["pixel-relic", "colecionaveis-decoracao", "Quadro Pixel Quest Metal", "quadro-pixel-quest-metal", 159.9, 17, 4.76, 63, "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80"],
  ["pixel-relic", "moda-lifestyle-geek", "Camiseta Save Point Oversized", "camiseta-save-point-oversized", 119.9, 28, 4.74, 105, "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80"],
  ["pixel-relic", "moda-lifestyle-geek", "Pin Set Guild Icons", "pin-set-guild-icons", 69.9, 35, 4.72, 88, "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"],
  ["pixel-relic", "colecionaveis-decoracao", "Luminária Portal Core", "luminaria-portal-core", 199.9, 9, 4.84, 59, "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=900&q=80"],
  ["arcade-vault", "consoles-controles", "Controle FluxPad Pro Multiplataforma", "controle-fluxpad-pro-multiplataforma", 399.9, 16, 4.86, 132, "https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=900&q=80"],
  ["arcade-vault", "consoles-controles", "Base DualCharge Station", "base-dualcharge-station", 189.9, 22, 4.73, 79, "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=900&q=80"],
  ["arcade-vault", "setup-ergonomia", "Braço Titan Arm para monitor", "braco-titan-arm-monitor", 259.9, 9, 4.79, 64, "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?auto=format&fit=crop&w=900&q=80"],
  ["arcade-vault", "setup-ergonomia", "Painel PixelWall Mini RGB", "painel-pixelwall-mini-rgb", 329.9, 7, 4.91, 98, "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80"],
  ["arcade-vault", "consoles-controles", "Grip Mobile RaidClip", "grip-mobile-raidclip", 139.9, 26, 4.69, 73, "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80"],
  ["arcade-vault", "setup-ergonomia", "Suporte Headset DockTower", "suporte-headset-docktower", 229.9, 13, 4.75, 58, "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=900&q=80"],
  ["byteforge-mods", "hardware-perifericos", "Kit Fans FrostByte ARGB 120", "kit-fans-frostbyte-argb-120", 249.9, 19, 4.8, 84, "https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?auto=format&fit=crop&w=900&q=80"],
  ["byteforge-mods", "hardware-perifericos", "Sleeve Cable Set Aurora", "sleeve-cable-set-aurora", 189.9, 24, 4.71, 57, "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80"],
  ["byteforge-mods", "hardware-perifericos", "Suporte GPU Atlas Brace", "suporte-gpu-atlas-brace", 119.9, 31, 4.66, 49, "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80"],
  ["byteforge-mods", "setup-ergonomia", "Organizador CableRun Pro", "organizador-cablerun-pro", 89.9, 40, 4.64, 116, "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80"],
  ["byteforge-mods", "hardware-perifericos", "Pasta Térmica CryoForge X", "pasta-termica-cryoforge-x", 59.9, 52, 4.7, 143, "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80"],
  ["byteforge-mods", "setup-ergonomia", "Riser Stand AirFlow", "riser-stand-airflow", 169.9, 15, 4.68, 51, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80"],
  ["critical-loot", "colecionaveis-decoracao", "Dados RPG Arcane Dice Set", "dados-rpg-arcane-dice-set", 99.9, 33, 4.87, 124, "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=900&q=80"],
  ["critical-loot", "colecionaveis-decoracao", "Deck Box ManaVault", "deck-box-manavault", 139.9, 27, 4.78, 76, "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=900&q=80"],
  ["critical-loot", "colecionaveis-decoracao", "Miniatura Mech Sentinel", "miniatura-mech-sentinel", 179.9, 11, 4.82, 44, "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=80"],
  ["critical-loot", "moda-lifestyle-geek", "Mochila LootPack Compact", "mochila-lootpack-compact", 249.9, 18, 4.73, 67, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80"],
  ["critical-loot", "moda-lifestyle-geek", "Caneca Critical Hit 500ml", "caneca-critical-hit-500ml", 79.9, 42, 4.67, 138, "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80"],
  ["critical-loot", "colecionaveis-decoracao", "Playmat Dungeon Grid", "playmat-dungeon-grid", 159.9, 14, 4.79, 62, "https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&w=900&q=80"],
  ["streamlab-station", "audio-streaming", "Ring Light HaloCast 12", "ring-light-halocast-12", 219.9, 23, 4.81, 111, "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=900&q=80"],
  ["streamlab-station", "audio-streaming", "Interface Audio MiniMix USB", "interface-audio-minimix-usb", 449.9, 8, 4.86, 52, "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=900&q=80"],
  ["streamlab-station", "audio-streaming", "Braço BoomCast Pro", "braco-boomcast-pro", 199.9, 16, 4.77, 74, "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=900&q=80"],
  ["streamlab-station", "audio-streaming", "Stream Deck MacroPad 15", "stream-deck-macropad-15", 389.9, 12, 4.83, 69, "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80"],
  ["streamlab-station", "setup-ergonomia", "Acoustic Foam Starter Kit", "acoustic-foam-starter-kit", 179.9, 20, 4.65, 46, "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=900&q=80"],
  ["streamlab-station", "audio-streaming", "Webcam FocusCam 2K", "webcam-focuscam-2k", 329.9, 19, 4.74, 83, "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?auto=format&fit=crop&w=900&q=80"]
] as const;

const legacyCategorySlugs = ["perifericos", "audio-gamer", "setup-rgb", "colecionaveis", "vestuario-gamer"];
const legacyProductSlugs = [
  "teclado-mecanico-nebula-tkl",
  "headset-pulse-71-rgb",
  "mouse-gamer-vector-8k",
  "deskmat-cybergrid-xl",
  "luminaria-rgb-hexapack",
  "controle-propad-x",
  "controle-propad-x-wireless",
  "action-figure-cacadora-estelar",
  "camiseta-arcade-mode"
];
const legacySellerSlugs = ["kriar", "kriar-market", "kriar-artesanato", "kriar-store", "atelier-kriar", "atelie-kriar"];
const plans = [
  { name: "Plano mensal", description: "Publique produtos gamer na NexusPlay por 30 dias.", price: 9.9, durationDays: 30, type: SubscriptionPlanType.MONTHLY },
  { name: "Plano anual", description: "Publique produtos gamer na NexusPlay por 365 dias com desconto.", price: 99, durationDays: 365, type: SubscriptionPlanType.YEARLY }
];

function productDescription(name: string, categoryName: string) {
  return `${name} selecionado para a vitrine NexusPlay, com acabamento de qualidade e proposta clara para quem monta setups gamer, geek ou de criação de conteúdo. Categoria: ${categoryName}.`;
}

function productDimensions(index: number) {
  return {
    width: 10 + (index % 7) * 4,
    height: 4 + (index % 5) * 3,
    length: 12 + (index % 6) * 5
  };
}

async function seedCoreData() {
  await Promise.all(demoCategories.map((category) =>
    prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description, active: true },
      create: { ...category, active: true }
    })
  ));

  await Promise.all(plans.map((plan) =>
    prisma.subscriptionPlan.upsert({
      where: { type: plan.type },
      update: { name: plan.name, description: plan.description, price: plan.price, durationDays: plan.durationDays, active: true },
      create: plan
    })
  ));
}

async function cleanupLegacyKriarData() {
  const legacyProducts = await prisma.product.findMany({
    where: {
      OR: [
        { slug: { in: legacyProductSlugs } },
        { category: { slug: { in: legacyCategorySlugs } } },
        { seller: { slug: { in: legacySellerSlugs } } }
      ]
    },
    include: { orderItems: { select: { id: true } } }
  });

  for (const product of legacyProducts) {
    if (product.orderItems.length > 0) {
      await prisma.product.update({
        where: { id: product.id },
        data: { status: ProductStatus.INACTIVE, stock: 0 }
      });
    } else {
      await prisma.product.delete({ where: { id: product.id } });
    }
  }

  const legacySellers = await prisma.seller.findMany({
    where: { slug: { in: legacySellerSlugs } },
    include: { orderItems: { select: { id: true } }, products: { include: { orderItems: { select: { id: true } } } } }
  });

  for (const seller of legacySellers) {
    const hasHistory = seller.orderItems.length > 0 || seller.products.some((product) => product.orderItems.length > 0);
    if (hasHistory) {
      await prisma.seller.update({ where: { id: seller.id }, data: { status: SellerStatus.REJECTED } });
      await prisma.product.updateMany({ where: { sellerId: seller.id }, data: { status: ProductStatus.INACTIVE, stock: 0 } });
    } else {
      const userId = seller.userId;
      await prisma.seller.delete({ where: { id: seller.id } });
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
  }

  for (const slug of legacyCategorySlugs) {
    const category = await prisma.category.findUnique({ where: { slug }, include: { _count: { select: { products: true } } } });
    if (!category) continue;
    if (category._count.products === 0) {
      await prisma.category.delete({ where: { id: category.id } });
    } else {
      await prisma.category.update({ where: { id: category.id }, data: { active: false } });
    }
  }
}

async function upsertSellerProfile(sellerData: (typeof demoSellers)[number], passwordHash: string, monthlyPlanId?: string) {
  const user = await prisma.user.upsert({
    where: { email: sellerData.email },
    update: { name: sellerData.name, passwordHash, role: UserRole.ARTISAN, isDeleted: false },
    create: { name: sellerData.name, email: sellerData.email, passwordHash, role: UserRole.ARTISAN }
  });

  const seller = await prisma.seller.upsert({
    where: { slug: sellerData.slug },
    update: {
      userId: user.id,
      storeName: sellerData.name,
      bio: sellerData.bio,
      story: sellerData.story,
      avatarUrl: sellerData.avatarUrl,
      coverUrl: sellerData.coverUrl,
      status: SellerStatus.APPROVED,
      rating: sellerData.rating,
      salesCount: sellerData.salesCount
    },
    create: {
      userId: user.id,
      storeName: sellerData.name,
      slug: sellerData.slug,
      bio: sellerData.bio,
      story: sellerData.story,
      avatarUrl: sellerData.avatarUrl,
      coverUrl: sellerData.coverUrl,
      status: SellerStatus.APPROVED,
      rating: sellerData.rating,
      salesCount: sellerData.salesCount
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
      storeDescription: seller.bio,
      craftCategories: sellerData.categories,
      status: SellerStatus.APPROVED,
      active: true,
      blocked: false,
      subscriptionActive: true,
      subscriptionExpiresAt: trialEnd
    },
    create: {
      userId: user.id,
      name: sellerData.name,
      cpf: null,
      phone: sellerData.phone,
      storeId: seller.id,
      storeName: seller.storeName,
      storeSlug: seller.slug,
      storeDescription: seller.bio,
      craftCategories: sellerData.categories,
      document: sellerData.document,
      acceptsLocalPickup: true,
      pickupInstructions: "Retirada demo mediante confirmacao do pedido.",
      trialStart,
      trialEnd,
      subscriptionActive: true,
      subscriptionExpiresAt: trialEnd,
      status: SellerStatus.APPROVED
    }
  });

  const addressData = {
    street: "Avenida Paulista",
    number: String(1000 + demoSellers.findIndex((item) => item.slug === seller.slug)),
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
  const currentAddress = await prisma.address.findFirst({ where: { userId: user.id, artisanId: artisan.id } });
  if (currentAddress) {
    await prisma.address.update({ where: { id: currentAddress.id }, data: addressData });
  } else {
    await prisma.address.create({ data: addressData });
  }

  const currentSubscription = await prisma.artisanSubscription.findFirst({ where: { artisanId: artisan.id } });
  const subscriptionData = {
    artisanId: artisan.id,
    planId: monthlyPlanId,
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

  return { seller, artisan, pickupAddress: `${addressData.street}, ${addressData.number}, ${addressData.city} - ${addressData.state}` };
}

async function seedShowcaseCatalog() {
  const passwordHash = await bcrypt.hash(process.env.SEED_DEMO_SELLER_PASSWORD ?? `seed-${process.env.JWT_SECRET ?? "nexusplay"}`, 12);
  const monthlyPlan = await prisma.subscriptionPlan.findUnique({ where: { type: SubscriptionPlanType.MONTHLY } });
  const categoryRecords = await prisma.category.findMany({ where: { slug: { in: demoCategories.map((category) => category.slug) } } });
  const categoryBySlug = new Map(categoryRecords.map((category) => [category.slug, category]));
  const sellerProfiles = new Map<string, Awaited<ReturnType<typeof upsertSellerProfile>>>();

  for (const sellerData of demoSellers) {
    sellerProfiles.set(sellerData.slug, await upsertSellerProfile(sellerData, passwordHash, monthlyPlan?.id));
  }

  for (const [index, item] of demoProducts.entries()) {
    const [sellerSlug, categorySlug, name, slug, price, stock, rating, salesCount, imageUrl] = item;
    const profile = sellerProfiles.get(sellerSlug);
    const category = categoryBySlug.get(categorySlug);
    if (!profile || !category) continue;

    const image = {
      url: imageUrl,
      publicId: `seed/${slug}`,
      filename: `${slug}.jpg`,
      alt: name
    };
    const productData = {
      sellerId: profile.seller.id,
      categoryId: category.id,
      name,
      slug,
      description: productDescription(name, category.name),
      price,
      stock,
      categoryName: category.name,
      images: [image],
      mainImage: image,
      artisanId: profile.artisan.id,
      artisanName: profile.artisan.name,
      artisanSlug: profile.seller.slug,
      dimensions: productDimensions(index),
      variations: [],
      weight: Number((0.25 + (index % 9) * 0.21).toFixed(2)),
      shippingAvailable: true,
      pickupAvailable: true,
      pickupAddress: profile.pickupAddress,
      status: ProductStatus.ACTIVE,
      averageRating: rating,
      totalReviews: 0,
      rating,
      salesCount
    };

    const product = await prisma.product.upsert({
      where: { slug },
      update: productData,
      create: productData
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
    update: { name: "Cliente Demo", passwordHash, role: UserRole.CUSTOMER, isDeleted: false },
    create: { name: "Cliente Demo", email: process.env.SEED_DEMO_CUSTOMER_EMAIL ?? "cliente@nexusplay.demo", passwordHash, role: UserRole.CUSTOMER }
  });

  const customer = await prisma.customer.upsert({
    where: { userId: user.id },
    update: { name: "Cliente Demo", phone: "11988887777", active: true, blocked: false, isDeleted: false },
    create: { userId: user.id, name: "Cliente Demo", birthDate: new Date("1998-01-15T00:00:00.000Z"), cpf: "00000000191", phone: "11988887777", active: true }
  });

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
  const currentAddress = await prisma.address.findFirst({ where: { userId: user.id, customerId: customer.id } });
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
    update: { name: "Admin Demo", passwordHash, role: UserRole.ADMIN, isDeleted: false },
    create: { name: "Admin Demo", email, passwordHash, role: UserRole.ADMIN }
  });

  await prisma.admin.upsert({
    where: { userId: user.id },
    update: { name: "Admin Demo", permissionLevel: AdminPermissionLevel.SUPER_ADMIN, active: true, isDeleted: false },
    create: { userId: user.id, name: "Admin Demo", permissionLevel: AdminPermissionLevel.SUPER_ADMIN, active: true }
  });
}

async function main() {
  await seedCoreData();
  await cleanupLegacyKriarData();
  await seedShowcaseCatalog();
  await seedDemoCustomer();
  await seedOptionalDemoAdmin();

  console.log("Seed concluido: catalogo gamer/geek expandido, lojas demo e limpeza controlada do Kriar aplicados.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Erro ao executar seed.");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
