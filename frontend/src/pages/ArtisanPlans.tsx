import { CreditCard, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { createSubscriptionCheckout, getSubscriptionPlans, getSubscriptionStatus, type SubscriptionPlan, type SubscriptionStatus } from "../services/subscriptions";
import { useAuth } from "../store/auth";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function ArtisanPlans() {
  const user = useAuth((state) => state.user);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loadingPlanId, setLoadingPlanId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    getSubscriptionPlans().then(setPlans).catch(() => setMessage("Não foi possível carregar os planos."));
    if (user?.role === "ARTISAN") getSubscriptionStatus().then(setStatus).catch(() => undefined);
  }, [user?.role]);

  if (!user) return <Navigate to="/artesao/login" replace />;
  if (user.role !== "ARTISAN") return <Navigate to="/artesao/login" replace />;

  async function subscribe(planId: string) {
    setLoadingPlanId(planId);
    setMessage("");
    try {
      const checkout = await createSubscriptionCheckout(planId);
      if (!checkout.initPoint) throw new Error("Link de pagamento não retornado.");
      window.location.href = checkout.initPoint;
    } catch {
      setMessage("Não foi possível iniciar o pagamento da assinatura.");
    } finally {
      setLoadingPlanId("");
    }
  }

  return (
    <main className="app-shell section-y">
      <p className="eyebrow mb-2">Assinatura do vendedor</p>
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-kriar-contrast">Continue vendendo no Kriar</h1>
          <p className="mt-2 max-w-2xl text-kriar-muted">A KRIAR não cobra comissão sobre vendas. O valor da venda pertence ao vendedor; a plataforma monetiza pela assinatura.</p>
        </div>
        <Link to="/artesao/assinatura" className="btn-secondary">Ver status</Link>
      </div>
      {status && (
        <div className="panel mb-6 p-5">
          <strong className="text-kriar-contrast">Status: {status.status}</strong>
          <p className="mt-1 text-sm text-kriar-muted">
            {status.canSell ? "Sua loja está liberada para vender." : "Seu período grátis terminou. Escolha um plano para continuar vendendo na KRIAR."}
          </p>
          {status.status === "TRIAL_ATIVO" && <p className="mt-1 text-sm font-bold text-kriar-primary">Restam {status.diasRestantesTrial} dias de teste grátis.</p>}
        </div>
      )}
      {message && <div className="mb-5 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{message}</div>}
      <div className="grid gap-5 md:grid-cols-2">
        {plans.map((plan) => (
          <section key={plan.id} className="panel p-6">
            <ShieldCheck className="mb-4 h-6 w-6 text-kriar-primary" />
            <h2 className="text-2xl font-black text-kriar-contrast">{plan.name}</h2>
            <p className="mt-2 text-kriar-muted">{plan.description}</p>
            <div className="mt-6 text-4xl font-black text-kriar-primary">{currency.format(Number(plan.price))}</div>
            <p className="mt-1 text-sm font-bold text-kriar-muted">{plan.durationDays} dias</p>
            <button className="btn-primary mt-6 w-full" disabled={loadingPlanId === plan.id} onClick={() => subscribe(plan.id)}>
              <CreditCard className="h-5 w-5" /> {loadingPlanId === plan.id ? "Criando checkout..." : "Assinar com Mercado Pago"}
            </button>
          </section>
        ))}
      </div>
    </main>
  );
}
