import { SubscriptionPlanType } from "@prisma/client";
import { prisma } from "../src/lib/prisma.js";
import { slugify } from "../src/utils/slugify.js";

const categories = ["Ceramica", "Joias autorais", "Decoracao", "Papelaria", "Textil"];
const plans = [
  { name: "Plano mensal", description: "Venda no Kriar por 30 dias.", price: 9.9, durationDays: 30, type: SubscriptionPlanType.MONTHLY },
  { name: "Plano anual", description: "Venda no Kriar por 365 dias com desconto.", price: 99, durationDays: 365, type: SubscriptionPlanType.YEARLY }
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.log("Seed ignorado em producao.");
    return;
  }

  await Promise.all(categories.map((name) =>
    prisma.category.upsert({
      where: { slug: slugify(name) },
      update: { name, description: `Produtos de ${name.toLowerCase()} feitos por criadores independentes.`, active: true },
      create: {
        name,
        slug: slugify(name),
        description: `Produtos de ${name.toLowerCase()} feitos por criadores independentes.`,
        active: true
      }
    })
  ));

  await Promise.all(plans.map((plan) =>
    prisma.subscriptionPlan.upsert({
      where: { type: plan.type },
      update: { name: plan.name, description: plan.description, price: plan.price, durationDays: plan.durationDays, active: true },
      create: plan
    })
  ));

  console.log("Seed seguro concluido: categorias e planos atualizados. Nenhum usuario ou admin foi criado.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Erro ao executar seed.");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
