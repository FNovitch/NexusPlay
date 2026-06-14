import { SubscriptionPlanType } from "@prisma/client";
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

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.log("Seed ignorado em produção.");
    return;
  }

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

  console.log("Seed seguro concluído: categorias e planos atualizados. Nenhum usuário ou admin foi criado.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Erro ao executar seed.");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
