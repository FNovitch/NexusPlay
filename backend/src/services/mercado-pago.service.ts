import crypto from "node:crypto";
import { env } from "../config/env.js";

const token = env.MERCADO_PAGO_ACCESS_TOKEN?.includes("...") ? undefined : env.MERCADO_PAGO_ACCESS_TOKEN;
const checkoutPaymentMethods = {
  installments: 12
};

const mercadoPagoApiBase = "https://api.mercadopago.com";

export function isMercadoPagoSandboxMode() {
  return Boolean(token?.startsWith("TEST-"));
}

export function getMercadoPagoInitPoint(preference: { init_point?: string | null; sandbox_init_point?: string | null }) {
  if (isMercadoPagoSandboxMode()) {
    return preference.sandbox_init_point ?? preference.init_point;
  }

  return preference.init_point ?? preference.sandbox_init_point;
}

function logPreferenceDebug(flow: string, payload: unknown, response?: { id?: string; init_point?: string | null; sandbox_init_point?: string | null }) {
  if (process.env.MERCADO_PAGO_DEBUG !== "true") return;
  console.info("[mercado-pago:preference]", {
    flow,
    payload,
    response: response
      ? {
          id: response.id,
          hasInitPoint: Boolean(response.init_point),
          hasSandboxInitPoint: Boolean(response.sandbox_init_point)
        }
      : undefined
  });
}

function mockPreference(referenceId: string, path = "pedido") {
  const frontendUrl = env.FRONTEND_URL.replace(/\/$/, "");
  const successUrl = path === "pedido"
    ? `${frontendUrl}/pedido/${referenceId}/status?resultado=sucesso&mock=true&ref=${referenceId}`
    : `${frontendUrl}/${path}/sucesso?mock=true&ref=${referenceId}`;

  return {
    id: `mock-${referenceId}`,
    init_point: successUrl,
    sandbox_init_point: successUrl
  };
}

async function mercadoPagoRequest<T>(path: string, options: RequestInit = {}) {
  if (!token) {
    throw new Error("MERCADO_PAGO_ACCESS_TOKEN não configurado.");
  }

  const response = await fetch(`${mercadoPagoApiBase}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data === "object" && data && "message" in data ? String(data.message) : "Erro Mercado Pago";
    throw new Error(message);
  }
  return data as T;
}

export async function criarPreferenciaPagamento(input: {
  pedidoId: string;
  codigoPedido: string;
  comprador: { nome: string; email: string };
  items: Array<{ title: string; quantity: number; unit_price: number }>;
}) {
  if (!token) {
    if (env.NODE_ENV === "production") {
      throw new Error("MERCADO_PAGO_ACCESS_TOKEN não configurado para produção.");
    }

    return mockPreference(input.pedidoId);
  }

  try {
    const body = {
      external_reference: input.pedidoId,
      items: input.items.map((item, index) => ({ id: `${input.codigoPedido}-${index}`, currency_id: "BRL", ...item })),
      payer: { name: input.comprador.nome, email: input.comprador.email },
      payment_methods: checkoutPaymentMethods,
      back_urls: {
        success: `${env.FRONTEND_URL.replace(/\/$/, "")}/pedido/${input.pedidoId}/status?resultado=sucesso`,
        failure: `${env.FRONTEND_URL.replace(/\/$/, "")}/pedido/${input.pedidoId}/status?resultado=falha`,
        pending: `${env.FRONTEND_URL.replace(/\/$/, "")}/pedido/${input.pedidoId}/status?resultado=pendente`
      },
      auto_return: "approved",
      notification_url: `${env.BACKEND_URL.replace(/\/$/, "")}/api/v1/webhooks/mercado-pago?source_news=webhooks`,
      statement_descriptor: "NEXUSPLAY"
    };
    logPreferenceDebug("customer_purchase", body);
    const response = await mercadoPagoRequest<{ id?: string; init_point?: string | null; sandbox_init_point?: string | null }>("/checkout/preferences", {
      method: "POST",
      body: JSON.stringify(body)
    });
    logPreferenceDebug("customer_purchase", body, response);
    return response;
  } catch (error) {
    if (process.env.MERCADO_PAGO_DEBUG === "true") console.error("[mercado-pago:preference:error]", error);
    if (env.NODE_ENV === "development") return mockPreference(input.pedidoId);
    throw error;
  }
}

export const createCheckoutPreference = criarPreferenciaPagamento;

export async function criarPreferenciaAssinatura(input: {
  subscriptionId: string;
  plano: { nome: string; valor: number };
  artesao: { nome: string; email: string };
}) {
  const externalReference = input.subscriptionId;
  if (!token) {
    if (env.NODE_ENV === "production") {
      throw new Error("MERCADO_PAGO_ACCESS_TOKEN não configurado para produção.");
    }

    return mockPreference(externalReference, "vendedor/assinatura");
  }

  try {
    const body = {
      external_reference: externalReference,
      items: [{
        id: input.subscriptionId,
        title: input.plano.nome,
        quantity: 1,
        unit_price: input.plano.valor,
        currency_id: "BRL"
      }],
      payer: { name: input.artesao.nome, email: input.artesao.email },
      payment_methods: checkoutPaymentMethods,
      back_urls: {
        success: `${env.FRONTEND_URL}/vendedor/assinatura/sucesso`,
        failure: `${env.FRONTEND_URL}/vendedor/assinatura/falha`,
        pending: `${env.FRONTEND_URL}/vendedor/assinatura/pendente`
      },
      auto_return: "approved",
      notification_url: `${env.BACKEND_URL.replace(/\/$/, "")}/api/v1/webhooks/mercado-pago/subscription?source_news=webhooks`,
      statement_descriptor: "NEXUSPLAY"
    };
    logPreferenceDebug("artisan_subscription", body);
    const response = await mercadoPagoRequest<{ id?: string; init_point?: string | null; sandbox_init_point?: string | null }>("/checkout/preferences", {
      method: "POST",
      body: JSON.stringify(body)
    });
    logPreferenceDebug("artisan_subscription", body, response);
    return response;
  } catch (error) {
    if (process.env.MERCADO_PAGO_DEBUG === "true") console.error("[mercado-pago:subscription-preference:error]", error);
    if (env.NODE_ENV === "development") return mockPreference(externalReference, "vendedor/assinatura");
    throw error;
  }
}

export async function consultarPagamento(paymentId: string) {
  if (!token) return { id: paymentId, status: "approved", external_reference: paymentId };
  return mercadoPagoRequest(`/v1/payments/${encodeURIComponent(paymentId)}`);
}

export const getPayment = consultarPagamento;

export function validarAssinaturaMercadoPago(headers: Record<string, unknown>, rawId?: string) {
  if (!env.MERCADO_PAGO_WEBHOOK_SECRET || env.MERCADO_PAGO_WEBHOOK_SECRET === "opcional") {
    return env.NODE_ENV !== "production";
  }
  const signature = String(headers["x-signature"] ?? "");
  const requestId = String(headers["x-request-id"] ?? "");
  if (!signature || !requestId || !rawId) return false;
  const parts = signature.split(",").map((part) => part.trim());
  const ts = parts.find((part) => part.startsWith("ts="))?.replace("ts=", "").trim();
  const v1 = parts.find((part) => part.startsWith("v1="))?.replace("v1=", "").trim();
  if (!ts || !v1) return false;
  const manifest = `id:${rawId};request-id:${requestId};ts:${ts};`;
  const hash = crypto.createHmac("sha256", env.MERCADO_PAGO_WEBHOOK_SECRET).update(manifest).digest("hex");
  const expected = Buffer.from(hash, "hex");
  const received = Buffer.from(v1, "hex");
  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(expected, received);
}

export function getMercadoPagoWebhookPaymentId(input: { query?: Record<string, unknown>; body?: unknown }) {
  const body = input.body as { data?: { id?: unknown }; id?: unknown; resource?: unknown } | undefined;
  return String(
    input.query?.["data.id"] ??
    input.query?.id ??
    body?.data?.id ??
    body?.id ??
    body?.resource ??
    ""
  );
}

export function getMercadoPagoWebhookTopic(body: unknown, query: Record<string, unknown>) {
  const payload = body as { type?: unknown; topic?: unknown; action?: unknown } | undefined;
  return String(query.type ?? query.topic ?? payload?.type ?? payload?.topic ?? payload?.action ?? "");
}
