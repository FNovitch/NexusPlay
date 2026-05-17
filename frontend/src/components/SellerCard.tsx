import { Store } from "lucide-react";
import { Link } from "react-router-dom";
import type { Seller } from "../types";
import { Stars } from "./Stars";

export function SellerCard({ seller }: { seller: Seller }) {
  return (
    <Link to={`/loja/${seller.slug}`} className="group panel block overflow-hidden card-hover">
      <div className="relative h-36 overflow-hidden bg-kriar-paper">
        <img src={seller.coverUrl ?? ""} alt="" className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.035]" />
        <div className="absolute inset-0 bg-gradient-to-t from-kriar-contrast/30 to-transparent" />
      </div>
      <div className="p-4">
        <div className="-mt-12 mb-4 flex items-end justify-between gap-3">
          <img src={seller.avatarUrl ?? ""} alt={seller.storeName} className="relative h-16 w-16 rounded-2xl border-4 border-white object-cover shadow-soft" />
          <span className="badge-primary shadow-sm">
            <Store className="h-3 w-3" />
            Feito à mão
          </span>
        </div>
        <h3 className="font-black tracking-tight text-kriar-contrast">{seller.storeName}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-kriar-muted">{seller.bio}</p>
        <div className="mt-4 flex items-center justify-between border-t border-kriar-line/70 pt-4">
          <Stars value={seller.rating} compact />
          <span className="text-xs font-black text-kriar-secondary">{seller.salesCount} vendas</span>
        </div>
      </div>
    </Link>
  );
}
