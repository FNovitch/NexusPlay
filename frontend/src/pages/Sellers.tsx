import { useEffect, useState } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { SellerCard } from "../components/SellerCard";
import { getSellers } from "../lib/api";
import type { Seller } from "../types";

export function Sellers() {
  const [sellers, setSellers] = useState<Seller[]>([]);

  useEffect(() => {
    getSellers().then(setSellers);
  }, []);

  return (
    <main className="app-shell section-y">
      <SectionHeader
        eyebrow="Criadores"
        title="Artesãos em alta"
        description="Criadores aprovados, avaliados e prontos para receber pedidos personalizados."
      />
      <div className="grid gap-5 md:grid-cols-3">
        {sellers.map((seller) => (
          <SellerCard key={seller.id} seller={seller} />
        ))}
      </div>
    </main>
  );
}
