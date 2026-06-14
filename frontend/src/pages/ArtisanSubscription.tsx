import { Clock, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { getSubscriptionStatus, type SubscriptionStatus } from "../services/subscriptions";
import { useAuth } from "../store/auth";

export function ArtisanSubscription() {
  const user = useAuth((state) => state.user);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    if (user?.role === "ARTISAN") getSubscriptionStatus().then(setStatus).catch(() => undefined);
  }, [user?.role]);

  if (!user || user.role !== "ARTISAN") return <Navigate to="/vendedor/login" replace />;

  return (
    <main className="app-shell section-y">
      <p className="eyebrow mb-2">Minha assinatura</p>
      <h1 className="text-3xl font-semibold text-nexus-contrast">Status da loja</h1>
      <section className="panel mt-6 p-6">
        <Clock className="mb-4 h-6 w-6 text-nexus-primary" />
        <strong className="text-2xl text-nexus-contrast">{status?.status ?? "Carregando..."}</strong>
        <p className="mt-2 text-nexus-muted">
          {status?.canSell ? "Você pode publicar produtos normalmente." : "Seu período grátis terminou. Escolha um plano para continuar publicando."}
        </p>
        {status?.status === "TRIAL_ATIVO" && <p className="mt-2 font-bold text-nexus-primary">Dias restantes do teste grátis: {status.diasRestantesTrial}</p>}
        {status?.assinaturaExpiraEm && <p className="mt-2 text-sm text-nexus-muted">Expira em {new Date(status.assinaturaExpiraEm).toLocaleDateString("pt-BR")}</p>}
        <Link to="/vendedor/planos" className="btn-primary mt-6 w-max"><CreditCard className="h-5 w-5" /> Assinar ou renovar</Link>
      </section>
    </main>
  );
}
