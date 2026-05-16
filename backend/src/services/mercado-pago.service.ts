import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { env } from "../config/env.js";

const mercadoPagoAccessToken = env.MERCADO_PAGO_ACCESS_TOKEN?.includes("...") ? undefined : env.MERCADO_PAGO_ACCESS_TOKEN;

const client = mercadoPagoAccessToken
  ? new MercadoPagoConfig({ accessToken: mercadoPagoAccessToken })
  : null;

function mockPreference(orderId: string) {
  return {
    id: `mock-${orderId}`,
    init_point: `${env.FRONTEND_URL}/checkout/sucesso?mock=true&order=${orderId}`,
    sandbox_init_point: `${env.FRONTEND_URL}/checkout/sucesso?mock=true&order=${orderId}`
  };
}

export async function createCheckoutPreference(input: {
  orderId: string;
  buyerEmail: string;
  items: Array<{ title: string; quantity: number; unit_price: number }>;
}) {
  if (!client) {
    return mockPreference(input.orderId);
  }

  const preference = new Preference(client);
  try {
    return await preference.create({
      body: {
        external_reference: input.orderId,
        items: input.items.map((item, index) => ({ id: `${input.orderId}-${index}`, ...item })),
        payer: { email: input.buyerEmail },
        back_urls: {
          success: `${env.FRONTEND_URL}/checkout/sucesso`,
          failure: `${env.FRONTEND_URL}/checkout/erro`,
          pending: `${env.FRONTEND_URL}/checkout/pendente`
        },
        notification_url: `${env.BACKEND_URL.replace(/\/$/, "")}/api/v1/payments/webhook`
      },
    });
  } catch (error) {
    if (env.NODE_ENV === "development") {
      console.warn("Mercado Pago indisponivel; usando preferencia mock em desenvolvimento.");
      return mockPreference(input.orderId);
    }

    throw error;
  }
}

export async function getPayment(paymentId: string) {
  if (!client) {
    return { id: paymentId, status: "approved", external_reference: paymentId };
  }

  const payment = new Payment(client);
  return payment.get({ id: paymentId });
}
