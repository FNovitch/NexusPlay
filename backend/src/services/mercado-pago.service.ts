import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { env } from "../config/env.js";

const client = env.MERCADO_PAGO_ACCESS_TOKEN
  ? new MercadoPagoConfig({ accessToken: env.MERCADO_PAGO_ACCESS_TOKEN })
  : null;

export async function createCheckoutPreference(input: {
  orderId: string;
  buyerEmail: string;
  items: Array<{ title: string; quantity: number; unit_price: number }>;
}) {
  if (!client) {
    return {
      id: `mock-${input.orderId}`,
      init_point: `${env.FRONTEND_URL}/checkout/sucesso?mock=true&order=${input.orderId}`,
      sandbox_init_point: `${env.FRONTEND_URL}/checkout/sucesso?mock=true&order=${input.orderId}`
    };
  }

  const preference = new Preference(client);
  return preference.create({
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
    }
  });
}

export async function getPayment(paymentId: string) {
  if (!client) {
    return { id: paymentId, status: "approved", external_reference: paymentId };
  }

  const payment = new Payment(client);
  return payment.get({ id: paymentId });
}
