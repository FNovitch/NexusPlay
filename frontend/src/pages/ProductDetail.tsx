import { Heart, PackageCheck, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { SectionHeader } from "../components/SectionHeader";
import { Stars } from "../components/Stars";
import { getProduct } from "../lib/api";
import { useCart } from "../store/cart";
import { useToast } from "../store/toast";
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
  const isFavorite = useWishlist((state) => (product ? state.has(product.id) : false));
  const showToast = useToast((state) => state.show);

  useEffect(() => {
    getProduct(slug).then((data) => {
      setProduct(data.product);
      setRelated(data.related);
    });
  }, [slug]);

  if (!product) {
    return <main className="app-shell py-16 text-kriar-muted">Carregando produto...</main>;
  }

  const currentProduct = product;

  function handleAdd() {
    addItem(currentProduct, 1, notes);
    showToast({ title: "Produto adicionado", description: currentProduct.name, variant: "success" });
  }

  function handleFavorite() {
    toggle(currentProduct.id);
    showToast({ title: isFavorite ? "Removido dos favoritos" : "Salvo nos favoritos", description: currentProduct.name, variant: "info" });
  }

  return (
    <main className="app-shell py-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="overflow-hidden rounded-[28px] bg-kriar-background shadow-card">
          <img src={product.images[0]} alt={product.name} className="aspect-[4/3] w-full object-cover" />
        </div>
        <section className="panel p-5 sm:p-7">
          <Link to={`/loja/${product.seller.slug}`} className="text-sm font-black text-kriar-secondary transition hover:text-kriar-primary">
            {product.seller.storeName}
          </Link>
          <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-kriar-contrast md:text-5xl">{product.name}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Stars value={product.rating} />
            <span className="badge-soft">{product.salesCount} vendas</span>
            <span className="badge-warm">Feito à mão</span>
          </div>
          <p className="mt-6 text-base leading-8 text-kriar-muted sm:text-lg">{product.description}</p>
          <div className="mt-7 text-4xl font-black tracking-tight text-kriar-primary">{currency.format(product.price)}</div>
          {product.stock <= 4 && <p className="mt-2 font-bold text-kriar-secondary">Estoque baixo: restam {product.stock} unidades</p>}

          {product.customizationAvailable && (
            <label className="mt-7 block">
              <span className="mb-2 flex items-center gap-2 text-sm font-black text-kriar-contrast">
                <Sparkles className="h-4 w-4 text-kriar-secondary" /> Personalização
              </span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="text-field min-h-28 w-full"
                placeholder={product.personalizationPrompt}
              />
            </label>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button onClick={handleAdd} className="btn-primary flex-1">
              <ShoppingBag className="h-5 w-5" /> Adicionar ao carrinho
            </button>
            <button onClick={handleFavorite} className="btn-secondary">
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-kriar-secondary text-kriar-secondary" : ""}`} /> Favoritar
            </button>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[20px] border border-kriar-line bg-kriar-background/70 p-4">
              <ShieldCheck className="mb-2 h-5 w-5 text-kriar-primary" />
              <strong className="text-kriar-contrast">Pagamento Mercado Pago</strong>
              <p className="mt-1 text-sm leading-6 text-kriar-muted">Preferência gerada pela API e confirmação via webhook.</p>
            </div>
            <div className="rounded-[20px] border border-kriar-line bg-kriar-background/70 p-4">
              <PackageCheck className="mb-2 h-5 w-5 text-kriar-primary" />
              <strong className="text-kriar-contrast">Pedido por vendedor</strong>
              <p className="mt-1 text-sm leading-6 text-kriar-muted">O carrinho separa itens por loja para produção e entrega.</p>
            </div>
          </div>
        </section>
      </div>

      <section className="section-y">
        <SectionHeader title="Mais do mesmo artesão" description="Continue explorando peças da mesma loja." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
