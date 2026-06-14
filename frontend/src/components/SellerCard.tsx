import { Store } from "lucide-react";
import { Link } from "react-router-dom";
import type { Seller } from "../types";
import { handleImageError, resolveImageUrl } from "../utils/media";
import { Stars } from "./Stars";

export function SellerCard({ seller }: { seller: Seller }) {
  return (
    <Link to={`/loja/${seller.slug}`} className="group panel block overflow-hidden card-hover">
      <div className="relative h-32 overflow-hidden border-b border-nexus-line bg-nexus-paper">
        <img
          src={resolveImageUrl(seller.coverUrl)}
          alt=""
          loading="lazy"
          decoding="async"
          onError={handleImageError}
          className="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-[1.02]"
        />
      </div>
      <div className="p-4">
        <div className="-mt-10 mb-4 flex items-end justify-between gap-3">
          <img
            src={resolveImageUrl(seller.avatarUrl)}
            alt={seller.storeName}
            loading="lazy"
            decoding="async"
            onError={handleImageError}
            className="relative h-14 w-14 rounded-lg border-4 border-white object-cover shadow-soft"
          />
          <span className="inline-flex items-center gap-1 rounded-md bg-nexus-paper px-2 py-1 text-xs font-semibold text-nexus-secondary">
            <Store className="h-3 w-3" />
            Loja Ativa
          </span>
        </div>
        <h3 className="text-base font-semibold tracking-normal text-nexus-contrast">{seller.storeName}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-nexus-muted">{seller.bio}</p>
        <div className="mt-4 flex items-center justify-between border-t border-nexus-line pt-3">
          <Stars value={seller.rating} compact />
          <span className="text-xs font-semibold text-nexus-muted">{seller.salesCount} Pedidos</span>
        </div>
      </div>
    </Link>
  );
}
