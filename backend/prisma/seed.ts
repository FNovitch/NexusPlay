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

async function main() {
  const passwordHash = await bcrypt.hash("Kriar@12345", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@kriar.com" },
    update: {},
    create: { name: "Admin KRIAR", email: "admin@kriar.com", passwordHash, role: UserRole.ADMIN }
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
    create: { name: "Lia Carvalho", email: "atelie@kriar.com", passwordHash, role: UserRole.SELLER }
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

  await Promise.all(
    [
      ["Vaso Aurora feito a mao", "Peca unica em ceramica de alta temperatura, com esmalte acetinado e numeracao do atelie.", 189.9, 7, 0],
      ["Colar Horizonte em prata", "Joia autoral com pingente martelado, embalagem presenteavel e ajuste de comprimento.", 149.9, 12, 1],
      ["Kit botanico de parede", "Composicao artesanal para decoracao com fibras naturais, madeira reaproveitada e suporte invisivel.", 229.9, 4, 2],
      ["Caderno Costura Japonesa", "Papel especial, capa artesanal e opcao de gravacao do nome na primeira pagina.", 79.9, 18, 3]
    ].map(([name, description, price, stock, index]) =>
      prisma.product.upsert({
        where: { sellerId_slug: { sellerId: seller.id, slug: slugify(String(name)) } },
        update: {},
        create: {
          sellerId: seller.id,
          categoryId: categories[Number(index) % categories.length].id,
          name: String(name),
          slug: slugify(String(name)),
          description: String(description),
          price: Number(price),
          stock: Number(stock),
          images: [images[Number(index)]],
          customizationAvailable: Number(index) === 3,
          personalizationPrompt: Number(index) === 3 ? "Nome ou frase curta para personalizacao" : null,
          status: ProductStatus.ACTIVE,
          rating: 4.8,
          salesCount: 20 - Number(index) * 3
        }
      })
    )
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
