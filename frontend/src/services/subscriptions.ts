import { api } from "../lib/api";

export type SubscriptionPlan = {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  durationDays: number;
  type: "MONTHLY" | "YEARLY";
};

export type SubscriptionStatus = {
  status: "TRIAL_ATIVO" | "ATIVA" | "VENCIDA" | "CANCELADA" | "PENDENTE" | "RECUSADA";
  canSell: boolean;
  trialInicio?: string | null;
  trialFim?: string | null;
  diasRestantesTrial: number;
  assinaturaAtiva: boolean;
  assinaturaExpiraEm?: string | null;
  planoAtual?: { name: string; type: string } | null;
};

export async function getSubscriptionPlans() {
  const { data } = await api.get<{ data: { plans: SubscriptionPlan[] } }>("/subscriptions/plans");
  return data.data.plans;
}

export async function getSubscriptionStatus() {
  const { data } = await api.get<{ data: SubscriptionStatus }>("/artesao/subscription/status");
  return data.data;
}

export async function createSubscriptionCheckout(planId: string) {
  const { data } = await api.post<{ data: { initPoint: string; subscriptionId: string } }>("/artesao/subscription/checkout", { planId });
  return data.data;
}

export async function cancelSubscription() {
  const { data } = await api.post("/artesao/subscription/cancel");
  return data;
}
