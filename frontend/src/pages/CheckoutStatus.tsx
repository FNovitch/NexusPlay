import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { useCart } from "../store/cart";
import { useEffect } from "react";

const copy = {
  sucesso: ["Pedido recebido", "O Mercado Pago confirmou ou esta processando seu retorno. Acompanhe em Meus pedidos.", CheckCircle2],
  falha: ["Pagamento nao concluido", "Nao foi possivel concluir o pagamento. Voce pode tentar novamente.", AlertCircle],
  pendente: ["Pagamento pendente", "Assim que o Mercado Pago confirmar, atualizaremos seu pedido.", Clock]
} as const;

export function CheckoutStatus() {
  const { status = "sucesso" } = useParams();
  const clear = useCart((state) => state.clear);
  const [title, description, Icon] = copy[status as keyof typeof copy] ?? copy.sucesso;

  useEffect(() => {
    if (status === "sucesso") clear();
  }, [status, clear]);

  return (
    <main className="app-shell grid min-h-[70vh] place-items-center py-16">
      <EmptyState icon={<Icon className="h-6 w-6" />} title={title} description={description} action={<Link to="/meus-pedidos" className="btn-primary">Ver meus pedidos</Link>} />
    </main>
  );
}
