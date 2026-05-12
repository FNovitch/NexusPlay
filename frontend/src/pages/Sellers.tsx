import { useEffect, useState } from "react";
import { SellerCard } from "../components/SellerCard";
import { getSellers } from "../lib/api";
import type { Seller } from "../types";

export function Sellers() {
  const [sellers, setSellers] = useState<Seller[]>([]);

  useEffect(() => {
    getSellers().then(setSellers);
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-kriar-contrast">Artesaos em alta</h1>
        <p className="mt-2 text-kriar-contrast/70">Criadores aprovados, avaliados e prontos para receber pedidos personalizados.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {sellers.map((seller) => (
          <SellerCard key={seller.id} seller={seller} />
        ))}
      </div>
    </main>
  );
}
