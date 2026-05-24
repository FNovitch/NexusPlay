import type { Request, Response } from "express";
import { ArtisanSubscriptionStatus, PaymentHistoryType, SubscriptionPlanType } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middlewares/error.js";
import { consultarPagamento, criarPreferenciaAssinatura, getMercadoPagoInitPoint, getMercadoPagoWebhookPaymentId, getMercadoPagoWebhookTopic, validarAssinaturaMercadoPago } from "../services/mercado-pago.service.js";

const planSeeds = [
  { name: "Plano mensal", description: "Venda no Kriar por 30 dias.", price: 9.9, durationDays: 30, type: SubscriptionPlanType.MONTHLY },
  { name: "Plano anual", description: "Venda no Kriar por 365 dias com desconto.", price: 99, durationDays: 365, type: SubscriptionPlanType.YEARLY }
];

async function ensurePlans() {
  await Promise.all(planSeeds.map((plan) => prisma.subscriptionPlan.upsert({
    where: { type: plan.type },
    update: { name: plan.name, description: plan.description, price: plan.price, durationDays: plan.durationDays, active: true },
    create: plan
  })));
}

function mapSubscriptionStatus(artisan: {
  subscriptionActive: boolean;
  trialStart: Date | null;
  trialEnd: Date | null;
  subscriptionExpiresAt: Date | null;
  subscriptions?: Array<{ status: ArtisanSubscriptionStatus; expirationDate: Date | null; plan?: { name: string; type: SubscriptionPlanType } | null }>;
}) {
  const now = new Date();
  const trialActive = Boolean(artisan.trialEnd && artisan.trialEnd >= now);
  const activeSubscription = artisan.subscriptions?.find((subscription) => subscription.status === ArtisanSubscriptionStatus.ACTIVE && subscription.expirationDate && subscription.expirationDate >= now);
  const subscriptionActive = Boolean((artisan.subscriptionActive && artisan.subscriptionExpiresAt && artisan.subscriptionExpiresAt >= now) || activeSubscription);
  const trialDaysRemaining = artisan.trialEnd ? Math.max(0, Math.ceil((artisan.trialEnd.getTime() - now.getTime()) / 86400000)) : 0;

  return {
    status: subscriptionActive ? "ATIVA" : trialActive ? "TRIAL_ATIVO" : "VENCIDA",
    canSell: subscriptionActive || trialActive,
    trialInicio: artisan.trialStart,
    trialFim: artisan.trialEnd,
    diasRestantesTrial: trialDaysRemaining,
    assinaturaAtiva: subscriptionActive,
    assinaturaExpiraEm: artisan.subscriptionExpiresAt ?? activeSubscription?.expirationDate ?? null,
    planoAtual: activeSubscription?.plan ?? null
  };
}

export async function listSubscriptionPlans(_req: Request, res: Response) {
  await ensurePlans();
  const plans = await prisma.subscriptionPlan.findMany({ where: { active: true }, orderBy: { price: "asc" } });
  res.json({ success: true, data: { plans } });
}

export async function getArtisanSubscriptionStatus(req: Request, res: Response) {
  const artisan = await prisma.artisan.findUnique({
    where: { userId: req.user!.id },
    include: { subscriptions: { include: { plan: true }, orderBy: { createdAt: "desc" }, take: 5 } }
  });
  if (!artisan) throw new AppError("Perfil de artesao nao encontrado", 404);
  res.json({ success: true, data: mapSubscriptionStatus(artisan) });
}

export async function createSubscriptionCheckout(req: Request, res: Response) {
  await ensurePlans();
  const planId = String(req.body.planId ?? "");
  const [artisan, plan] = await Promise.all([
    prisma.artisan.findUnique({ where: { userId: req.user!.id }, include: { user: true } }),
    prisma.subscriptionPlan.findUnique({ where: { id: planId } })
  ]);
  if (!artisan) throw new AppError("Perfil de artesao nao encontrado", 404);
  if (!plan || !plan.active) throw new AppError("Plano nao encontrado", 404, { planId: "Escolha um plano valido." });

  const subscription = await prisma.artisanSubscription.create({
    data: {
      artisanId: artisan.id,
      planId: plan.id,
      status: ArtisanSubscriptionStatus.PENDING
    }
  });

  const preference = await criarPreferenciaAssinatura({
    subscriptionId: subscription.id,
    plano: { nome: plan.name, valor: Number(plan.price) },
    artesao: { nome: artisan.name, email: artisan.user.email }
  });
  const paymentLink = getMercadoPagoInitPoint(preference);
  if (!paymentLink) throw new AppError("Nao foi possivel criar checkout da assinatura.", 500, { payment: "Mercado Pago nao retornou init_point." });

  const updated = await prisma.artisanSubscription.update({
    where: { id: subscription.id },
    data: { mpPreferenceId: preference.id }
  });

  res.status(201).json({
    success: true,
    message: "Checkout de assinatura criado com sucesso.",
    data: { subscriptionId: updated.id, initPoint: paymentLink, preferenceId: preference.id }
  });
}

export async function cancelSubscription(req: Request, res: Response) {
  const artisan = await prisma.artisan.findUnique({ where: { userId: req.user!.id } });
  if (!artisan) throw new AppError("Perfil de artesao nao encontrado", 404);
  await prisma.$transaction([
    prisma.artisanSubscription.updateMany({ where: { artisanId: artisan.id, status: ArtisanSubscriptionStatus.ACTIVE }, data: { status: ArtisanSubscriptionStatus.CANCELED } }),
    prisma.artisan.update({ where: { id: artisan.id }, data: { subscriptionActive: false, subscriptionExpiresAt: null } })
  ]);
  res.json({ success: true, message: "Assinatura cancelada." });
}

export async function subscriptionWebhook(req: Request, res: Response) {
  try {
    const topic = getMercadoPagoWebhookTopic(req.body, req.query);
    const paymentId = getMercadoPagoWebhookPaymentId({ query: req.query, body: req.body });
    if (!paymentId) return res.status(200).json({ success: true, message: "Evento ignorado." });
    if (topic && (topic.includes("subscription_preapproval") || topic.includes("preapproval") || topic.includes("plan"))) {
      console.info("[mercado-pago:subscription-webhook:subscription-event:ignored]", { topic, paymentId });
      return res.status(200).json({ success: true, message: "Evento ignorado." });
    }
    if (topic && !topic.includes("payment")) {
      console.info("[mercado-pago:subscription-webhook:ignored]", { topic, paymentId });
      return res.status(200).json({ success: true, message: "Evento ignorado." });
    }
    if (!validarAssinaturaMercadoPago(req.headers, paymentId)) {
      return res.status(401).json({ success: false, message: "Assinatura do webhook invalida." });
    }
    const payment = await consultarPagamento(paymentId) as {
      id?: string | number;
      status?: string;
      status_detail?: string;
      external_reference?: string;
      transaction_amount?: number;
      preference_id?: string;
    };
    const externalReference = "external_reference" in payment ? String(payment.external_reference) : "";
    const subscriptionId = externalReference.startsWith("subscription:") ? externalReference.replace("subscription:", "") : externalReference;
    const mpStatus = "status" in payment ? String(payment.status) : "pending";
    console.info("[mercado-pago:subscription-webhook:payment]", { topic, paymentId, externalReference, status: mpStatus, statusDetail: payment.status_detail });
    if (!subscriptionId) return res.status(200).json({ success: true, message: "Evento ignorado." });
    const subscription = await prisma.artisanSubscription.findUnique({ where: { id: subscriptionId }, include: { plan: true, artisan: true } });
    if (!subscription || !subscription.plan) {
      console.info("[mercado-pago:subscription-webhook:not-found]", { paymentId, externalReference });
      return res.status(200).json({ success: true, message: "Evento ignorado." });
    }

    const sameStatusAlreadyProcessed = subscription.mpPaymentId === String(payment.id) && subscription.mpStatus === mpStatus;
    if (sameStatusAlreadyProcessed) {
      return res.status(200).json({ success: true, message: "Webhook processado com sucesso." });
    }

    if (mpStatus === "approved") {
      const startDate = new Date();
      const expirationDate = new Date(startDate);
      expirationDate.setDate(expirationDate.getDate() + subscription.plan.durationDays);
      const existingHistory = await prisma.paymentHistory.findFirst({
        where: { type: PaymentHistoryType.ARTISAN_SUBSCRIPTION, mpPaymentId: String(payment.id), status: "APPROVED" }
      });
      await prisma.$transaction([
        prisma.artisanSubscription.update({
          where: { id: subscription.id },
          data: { status: ArtisanSubscriptionStatus.ACTIVE, startDate, expirationDate, mpPaymentId: String(payment.id), mpStatus, mpPreferenceId: payment.preference_id ?? subscription.mpPreferenceId }
        }),
        prisma.artisan.update({
          where: { id: subscription.artisanId },
          data: { subscriptionActive: true, subscriptionExpiresAt: expirationDate }
        }),
        ...(existingHistory ? [] : [prisma.paymentHistory.create({
          data: {
            artisanId: subscription.artisanId,
            subscriptionId: subscription.id,
            type: PaymentHistoryType.ARTISAN_SUBSCRIPTION,
            amount: payment.transaction_amount ?? subscription.plan.price,
            status: "APPROVED",
            mpPaymentId: String(payment.id),
            mpPreferenceId: payment.preference_id ?? subscription.mpPreferenceId,
            description: `Assinatura ${subscription.plan.name}`
          }
        })])
      ]);
    } else if (["rejected", "cancelled", "canceled"].includes(mpStatus)) {
      await prisma.artisanSubscription.update({
        where: { id: subscription.id },
        data: {
          status: mpStatus === "rejected" ? ArtisanSubscriptionStatus.REJECTED : ArtisanSubscriptionStatus.CANCELED,
          mpPaymentId: String(payment.id),
          mpStatus,
          mpPreferenceId: payment.preference_id ?? subscription.mpPreferenceId
        }
      });
    } else {
      await prisma.artisanSubscription.update({
        where: { id: subscription.id },
        data: { status: ArtisanSubscriptionStatus.PENDING, mpPaymentId: String(payment.id), mpStatus, mpPreferenceId: payment.preference_id ?? subscription.mpPreferenceId }
      });
    }
  } catch (error) {
    console.error("[mercado-pago:subscription-webhook:error]", error instanceof Error ? { message: error.message, name: error.name } : { message: "unknown" });
  }
  res.status(200).json({ success: true, message: "Webhook processado com sucesso." });
}
