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
        eyebrow="Lojas"
        title="Marcas gamer em destaque"
        description="Catálogos fictícios com periféricos, colecionáveis, acessórios de setup e identidade própria."
      />
      <div className="grid gap-5 md:grid-cols-3">
        {sellers.map((seller) => (
          <SellerCard key={seller.id} seller={seller} />
        ))}
      </div>
    </main>
  );
}
