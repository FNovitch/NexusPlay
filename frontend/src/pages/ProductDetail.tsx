import { Heart, PackageCheck, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { Stars } from "../components/Stars";
import { getProduct } from "../lib/api";
import { useCart } from "../store/cart";
import { useWishlist } from "../store/wishlist";
import type { Product } from "../types";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function ProductDetail() {
  const { slug = "" } = useParams();
  const [product, setProduct] = useState<Product>();
  const [related, setRelated] = useState<Product[]>([]);
  const [notes, setNotes] = useState("");
  const addItem = useCart((state) => state.addItem);
  const toggle = useWishlist((state) => state.toggle);

  useEffect(() => {
    getProduct(slug).then((data) => {
      setProduct(data.product);
      setRelated(data.related);
    });
  }, [slug]);

  if (!product) {
    return <main className="mx-auto max-w-7xl px-4 py-16">Carregando produto...</main>;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="overflow-hidden rounded-lg bg-kriar-support/20">
          <img src={product.images[0]} alt={product.name} className="aspect-[4/3] w-full object-cover" />
        </div>
        <section>
          <Link to={`/loja/${product.seller.slug}`} className="text-sm font-bold text-kriar-secondary">
            {product.seller.storeName}
          </Link>
          <h1 className="mt-2 text-3xl font-black text-kriar-contrast md:text-5xl">{product.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Stars value={product.rating} />
            <span className="rounded-md bg-kriar-support/20 px-2 py-1 text-sm font-bold text-kriar-primary">{product.salesCount} vendas</span>
            <span className="rounded-md bg-white px-2 py-1 text-sm font-bold text-kriar-secondary">Feito a mao</span>
          </div>
          <p className="mt-5 text-lg leading-8 text-kriar-contrast/75">{product.description}</p>
          <div className="mt-6 text-4xl font-black text-kriar-primary">{currency.format(product.price)}</div>
          {product.stock <= 4 && <p className="mt-2 font-bold text-kriar-secondary">Estoque baixo: restam {product.stock} unidades</p>}

          {product.customizationAvailable && (
            <label className="mt-6 block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-kriar-contrast">
                <Sparkles className="h-4 w-4 text-kriar-secondary" /> Personalizacao
              </span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="min-h-24 w-full rounded-lg border border-kriar-support/50 bg-white p-3"
                placeholder={product.personalizationPrompt}
              />
            </label>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => addItem(product, 1, notes)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-kriar-primary px-5 py-3 font-bold text-white transition hover:bg-kriar-secondary"
            >
              <ShoppingBag className="h-5 w-5" /> Adicionar ao carrinho
            </button>
            <button
              onClick={() => toggle(product.id)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-kriar-primary px-5 py-3 font-bold text-kriar-primary hover:bg-kriar-support/20"
            >
              <Heart className="h-5 w-5" /> Favoritar
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-kriar-support/30 bg-white p-4">
              <ShieldCheck className="mb-2 h-5 w-5 text-kriar-primary" />
              <strong>Pagamento Mercado Pago</strong>
              <p className="text-sm text-kriar-contrast/70">Preferencia gerada pela API e confirmacao via webhook.</p>
            </div>
            <div className="rounded-lg border border-kriar-support/30 bg-white p-4">
              <PackageCheck className="mb-2 h-5 w-5 text-kriar-primary" />
              <strong>Pedido por vendedor</strong>
              <p className="text-sm text-kriar-contrast/70">O carrinho separa itens por loja para producao e entrega.</p>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-black text-kriar-contrast">Mais do mesmo artesao</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
