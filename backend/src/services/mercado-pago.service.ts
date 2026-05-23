import crypto from "node:crypto";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { env } from "../config/env.js";

const token = env.MERCADO_PAGO_ACCESS_TOKEN?.includes("...") ? undefined : env.MERCADO_PAGO_ACCESS_TOKEN;
const client = token ? new MercadoPagoConfig({ accessToken: token }) : null;

function mockPreference(orderId: string) {
  return {
    id: `mock-${orderId}`,
    init_point: `${env.FRONTEND_URL}/pedido/sucesso?mock=true&pedido=${orderId}`,
    sandbox_init_point: `${env.FRONTEND_URL}/pedido/sucesso?mock=true&pedido=${orderId}`
  };
}

export async function criarPreferenciaPagamento(input: {
  pedidoId: string;
  codigoPedido: string;
  comprador: { nome: string; email: string };
  items: Array<{ title: string; quantity: number; unit_price: number }>;
}) {
  if (!client) return mockPreference(input.pedidoId);

  const preference = new Preference(client);
  try {
    return await preference.create({
      body: {
        external_reference: input.pedidoId,
        items: input.items.map((item, index) => ({ id: `${input.codigoPedido}-${index}`, currency_id: "BRL", ...item })),
        payer: { name: input.comprador.nome, email: input.comprador.email },
        back_urls: {
          success: `${env.FRONTEND_URL}/pedido/sucesso`,
          failure: `${env.FRONTEND_URL}/pedido/falha`,
          pending: `${env.FRONTEND_URL}/pedido/pendente`
        },
        auto_return: "approved",
        notification_url: `${env.BACKEND_URL.replace(/\/$/, "")}/api/v1/webhooks/mercado-pago`
      }
    });
  } catch (error) {
    if (env.NODE_ENV === "development") return mockPreference(input.pedidoId);
    throw error;
  }
}

export const createCheckoutPreference = criarPreferenciaPagamento;

export async function consultarPagamento(paymentId: string) {
  if (!client) return { id: paymentId, status: "approved", external_reference: paymentId };
  return new Payment(client).get({ id: paymentId });
}

export const getPayment = consultarPagamento;

export function validarAssinaturaMercadoPago(headers: Record<string, unknown>, rawId?: string) {
  if (!env.MERCADO_PAGO_WEBHOOK_SECRET || env.MERCADO_PAGO_WEBHOOK_SECRET === "opcional") return true;
  const signature = String(headers["x-signature"] ?? "");
  const requestId = String(headers["x-request-id"] ?? "");
  if (!signature || !requestId || !rawId) return false;
  const ts = signature.split(",").find((part) => part.startsWith("ts="))?.replace("ts=", "");
  const v1 = signature.split(",").find((part) => part.startsWith("v1="))?.replace("v1=", "");
  if (!ts || !v1) return false;
  const manifest = `id:${rawId};request-id:${requestId};ts:${ts};`;
  const hash = crypto.createHmac("sha256", env.MERCADO_PAGO_WEBHOOK_SECRET).update(manifest).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(v1));
}
