import { Store } from "lucide-react";
import { Link } from "react-router-dom";
import type { Seller } from "../types";
import { Stars } from "./Stars";

export function SellerCard({ seller }: { seller: Seller }) {
  return (
    <Link to={`/loja/${seller.slug}`} className="overflow-hidden rounded-lg border border-kriar-support/30 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <img src={seller.coverUrl} alt="" className="h-28 w-full object-cover" />
      <div className="p-4">
        <div className="-mt-12 mb-3 flex items-end gap-3">
          <img src={seller.avatarUrl} alt={seller.storeName} className="h-16 w-16 rounded-lg border-4 border-white object-cover" />
          <span className="rounded-md bg-kriar-primary px-2 py-1 text-xs font-bold text-white">
            <Store className="mr-1 inline h-3 w-3" />
            Feito a mao
          </span>
        </div>
        <h3 className="font-black text-kriar-contrast">{seller.storeName}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-kriar-contrast/70">{seller.bio}</p>
        <div className="mt-3 flex items-center justify-between">
          <Stars value={seller.rating} compact />
          <span className="text-xs font-bold text-kriar-secondary">{seller.salesCount} vendas</span>
        </div>
      </div>
    </Link>
  );
}
