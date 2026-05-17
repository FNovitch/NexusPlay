import bcrypt from "bcryptjs";
import { ProductStatus, SellerStatus, UserRole } from "@prisma/client";
import { prisma } from "../src/lib/prisma.js";
import { slugify } from "../src/utils/slugify.js";

const images = [
  "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1493106819501-66d381c466f1?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80"
];

function productImage(url: string, alt: string) {
  return {
    url,
    filename: url.split("/").pop()?.split("?")[0] || "product-image",
    alt
  };
}

async function main() {
  const passwordHash = await bcrypt.hash("Kriar@12345", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@kriar.com" },
    update: {},
    create: { name: "Admin KRIAR", email: "admin@kriar.com", passwordHash, role: UserRole.ADMIN }
  });
  await prisma.admin.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, name: admin.name, permissionLevel: "SUPER_ADMIN" }
  });

  const customerUser = await prisma.user.upsert({
    where: { email: "cliente@kriar.com" },
    update: {},
    create: { name: "Cliente KRIAR", email: "cliente@kriar.com", passwordHash, role: UserRole.CUSTOMER }
  });
  const customer = await prisma.customer.upsert({
    where: { userId: customerUser.id },
    update: {},
    create: {
      userId: customerUser.id,
      name: customerUser.name,
      birthDate: new Date("1990-01-01"),
      cpf: "00000000001",
      phone: "85999999999"
    }
  });
  await prisma.address.upsert({
    where: { id: `seed-customer-address-${customer.id}` },
    update: {},
    create: {
      id: `seed-customer-address-${customer.id}`,
      userId: customerUser.id,
      customerId: customer.id,
      street: "Rua das Criacoes",
      number: "100",
      neighborhood: "Centro",
      city: "Fortaleza",
      state: "CE",
      zipCode: "60000000",
      country: "BR",
      isDefault: true
    }
  });

  const categories = await Promise.all(
    ["Ceramica", "Joias autorais", "Decoracao", "Papelaria", "Textil"].map((name) =>
      prisma.category.upsert({
        where: { slug: slugify(name) },
        update: {},
        create: {
          name,
          slug: slugify(name),
          description: `Produtos de ${name.toLowerCase()} feitos por criadores independentes.`
        }
      })
    )
  );

  const sellerUser = await prisma.user.upsert({
    where: { email: "atelie@kriar.com" },
    update: {},
    create: { name: "Lia Carvalho", email: "atelie@kriar.com", passwordHash, role: UserRole.ARTISAN }
  });

  const seller = await prisma.seller.upsert({
    where: { userId: sellerUser.id },
    update: {},
    create: {
      userId: sellerUser.id,
      storeName: "Atelie Raiz Digital",
      slug: "atelie-raiz-digital",
      bio: "Ceramicas autorais com formas organicas e acabamento contemporaneo.",
      story: "Lia transforma barro, memoria afetiva e modelagem digital em pecas pequenas series para casas com alma.",
      avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
      coverUrl: "https://images.unsplash.com/photo-1565193298357-7eec95cb9bd2?auto=format&fit=crop&w=1400&q=80",
      status: SellerStatus.APPROVED,
      rating: 4.9
    }
  });
  await prisma.user.update({ where: { id: sellerUser.id }, data: { storeId: seller.id } });
  const artisan = await prisma.artisan.upsert({
    where: { userId: sellerUser.id },
    update: {},
    create: {
      userId: sellerUser.id,
      name: sellerUser.name,
      cpf: "00000000002",
      phone: "85988888888",
      storeId: seller.id,
      storeName: seller.storeName,
      storeSlug: seller.slug,
      storeDescription: seller.story,
      document: "00000000000200"
    }
  });
  await prisma.address.upsert({
    where: { id: `seed-artisan-address-${artisan.id}` },
    update: {},
    create: {
      id: `seed-artisan-address-${artisan.id}`,
      userId: sellerUser.id,
      artisanId: artisan.id,
      street: "Rua do Atelie",
      number: "42",
      neighborhood: "Aldeota",
      city: "Fortaleza",
      state: "CE",
      zipCode: "60150000",
      country: "BR",
      isDefault: true
    }
  });

  await Promise.all(
    [
      ["Vaso Aurora feito a mao", "Peca unica em ceramica de alta temperatura, com esmalte acetinado e numeracao do atelie.", 189.9, 7, 0],
      ["Colar Horizonte em prata", "Joia autoral com pingente martelado, embalagem presenteavel e ajuste de comprimento.", 149.9, 12, 1],
      ["Kit botanico de parede", "Composicao artesanal para decoracao com fibras naturais, madeira reaproveitada e suporte invisivel.", 229.9, 4, 2],
      ["Caderno Costura Japonesa", "Papel especial, capa artesanal e opcao de gravacao do nome na primeira pagina.", 79.9, 18, 3]
    ].map(([name, description, price, stock, index]) => {
      const category = categories[Number(index) % categories.length];
      const image = productImage(images[Number(index)], String(name));

      return prisma.product.upsert({
        where: { sellerId_slug: { sellerId: seller.id, slug: slugify(String(name)) } },
        update: {},
        create: {
          sellerId: seller.id,
          categoryId: category.id,
          name: String(name),
          slug: slugify(String(name)),
          description: String(description),
          price: Number(price),
          stock: Number(stock),
          categoryName: category.name,
          images: [image],
          mainImage: image,
          artisanId: seller.id,
          artisanName: seller.storeName,
          artisanSlug: seller.slug,
          dimensions: { width: 10, height: 10, length: 10 },
          weight: 0.3,
          shippingAvailable: true,
          pickupAvailable: false,
          pickupAddress: null,
          customizationAvailable: Number(index) === 3,
          personalizationPrompt: Number(index) === 3 ? "Nome ou frase curta para personalizacao" : null,
          status: ProductStatus.ACTIVE,
          averageRating: 4.8,
          totalReviews: 0,
          rating: 4.8,
          salesCount: 20 - Number(index) * 3
        }
      });
    })
  );

  console.log(`Seed concluido. Admin: ${admin.email} / senha: Kriar@12345`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
