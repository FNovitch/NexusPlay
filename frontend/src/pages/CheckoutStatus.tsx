import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export function CheckoutStatus() {
  return (
    <main className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-4 py-16 text-center">
      <div>
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-kriar-primary" />
        <h1 className="text-3xl font-black text-kriar-contrast">Pedido recebido</h1>
        <p className="mt-3 text-kriar-contrast/70">Assim que o Mercado Pago confirmar o pagamento, o vendedor recebe o pedido para producao.</p>
        <Link to="/" className="mt-6 inline-block rounded-lg bg-kriar-primary px-5 py-3 font-bold text-white">
          Voltar para a vitrine
        </Link>
      </div>
    </main>
  );
}
