import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";

const copy = {
  sucesso: ["Assinatura recebida", "Assim que o Mercado Pago confirmar o pagamento, sua assinatura ficara ativa.", CheckCircle2],
  falha: ["Pagamento nao concluido", "Nao foi possivel concluir a assinatura. Escolha um plano e tente novamente.", AlertCircle],
  pendente: ["Pagamento pendente", "Aguardando confirmacao do Mercado Pago.", Clock]
} as const;

export function ArtisanSubscriptionStatus() {
  const { status = "sucesso" } = useParams();
  const [title, description, Icon] = copy[status as keyof typeof copy] ?? copy.sucesso;
  return (
    <main className="app-shell grid min-h-[70vh] place-items-center py-16">
      <EmptyState icon={<Icon className="h-6 w-6" />} title={title} description={description} action={<Link to="/artesao/assinatura" className="btn-primary">Ver assinatura</Link>} />
    </main>
  );
}
