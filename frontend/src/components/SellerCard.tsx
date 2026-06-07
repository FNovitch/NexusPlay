import { Store } from "lucide-react";
import { Link } from "react-router-dom";
import type { Seller } from "../types";
import { handleImageError, resolveImageUrl } from "../utils/media";
import { Stars } from "./Stars";

export function SellerCard({ seller }: { seller: Seller }) {
  return (
    <Link to={`/loja/${seller.slug}`} className="group panel block overflow-hidden card-hover">
      <div className="relative h-40 overflow-hidden bg-kriar-paper">
        <img
          src={resolveImageUrl(seller.coverUrl)}
          alt=""
          loading="lazy"
          decoding="async"
          onError={handleImageError}
          className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.035]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-kriar-contrast/30 to-transparent" />
      </div>
      <div className="p-4">
        <div className="-mt-12 mb-4 flex items-end justify-between gap-3">
          <img
            src={resolveImageUrl(seller.avatarUrl)}
            alt={seller.storeName}
            loading="lazy"
            decoding="async"
            onError={handleImageError}
            className="relative h-16 w-16 rounded-2xl border-4 border-white object-cover shadow-soft"
          />
          <span className="inline-flex items-center gap-1 rounded-full bg-kriar-primary/10 px-2.5 py-1 text-xs font-bold text-kriar-primary">
            <Store className="h-3 w-3" />
            Feito à mão
          </span>
        </div>
        <h3 className="text-lg font-black tracking-tight text-kriar-contrast">{seller.storeName}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-kriar-muted">{seller.bio}</p>
        <div className="mt-4 flex items-center justify-between border-t border-kriar-line/70 pt-3">
          <Stars value={seller.rating} compact />
          <span className="text-xs font-black text-kriar-muted">{seller.salesCount} vendas</span>
        </div>
      </div>
    </Link>
  );
}
