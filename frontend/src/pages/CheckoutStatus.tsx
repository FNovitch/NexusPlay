import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";

export function CheckoutStatus() {
  return (
    <main className="app-shell grid min-h-[70vh] place-items-center py-16">
      <EmptyState
        icon={<CheckCircle2 className="h-6 w-6" />}
        title="Pedido recebido"
        description="Assim que o Mercado Pago confirmar o pagamento, o vendedor recebe o pedido para produção."
        action={<Link to="/" className="btn-primary">Voltar para a vitrine</Link>}
      />
    </main>
  );
}
