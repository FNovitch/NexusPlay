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

  if (!user) return <Navigate to="/vendedor/login" replace />;
  if (user.role !== "ARTISAN") return <Navigate to="/vendedor/login" replace />;

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
      <p className="eyebrow mb-2">Assinatura da loja</p>
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-nexus-contrast">Continue publicando na NexusPlay</h1>
          <p className="mt-2 max-w-2xl text-nexus-muted">A loja demonstrativa usa assinatura fictícia, sem comissão sobre pedidos simulados.</p>
        </div>
        <Link to="/vendedor/assinatura" className="btn-secondary">Ver status</Link>
      </div>
      {status && (
        <div className="panel mb-6 p-5">
          <strong className="text-nexus-contrast">Status: {status.status}</strong>
          <p className="mt-1 text-sm text-nexus-muted">
            {status.canSell ? "Sua loja está liberada para publicar produtos." : "Seu período grátis terminou. Escolha um plano para continuar publicando."}
          </p>
          {status.status === "TRIAL_ATIVO" && <p className="mt-1 text-sm font-bold text-nexus-primary">Restam {status.diasRestantesTrial} dias de teste grátis.</p>}
        </div>
      )}
      {message && <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{message}</div>}
      <div className="grid gap-5 md:grid-cols-2">
        {plans.map((plan) => (
          <section key={plan.id} className="panel p-6">
            <ShieldCheck className="mb-4 h-6 w-6 text-nexus-primary" />
            <h2 className="text-2xl font-semibold text-nexus-contrast">{plan.name}</h2>
            <p className="mt-2 text-nexus-muted">{plan.description}</p>
            <div className="mt-6 text-4xl font-semibold text-nexus-contrast">{currency.format(Number(plan.price))}</div>
            <p className="mt-1 text-sm font-bold text-nexus-muted">{plan.durationDays} dias</p>
            <button className="btn-primary mt-6 w-full" disabled={loadingPlanId === plan.id} onClick={() => subscribe(plan.id)}>
              <CreditCard className="h-5 w-5" /> {loadingPlanId === plan.id ? "Criando checkout..." : "Assinar com Mercado Pago"}
            </button>
          </section>
        ))}
      </div>
    </main>
  );
}
