import type { Category, Product, Seller } from "../types";
<<<<<<< HEAD
import { normalizeProduct } from "../api/products";
=======
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7

export const categories: Category[] = [
  { id: "cat-1", name: "Cerâmica", slug: "ceramica", description: "Peças modeladas e queimadas em pequenos lotes." },
  { id: "cat-2", name: "Joias autorais", slug: "joias-autorais", description: "Acessórios com assinatura de quem cria." },
  { id: "cat-3", name: "Decoração", slug: "decoracao", description: "Objetos para casas com história." },
  { id: "cat-4", name: "Papelaria", slug: "papelaria", description: "Cadernos, convites e impressos especiais." },
  { id: "cat-5", name: "Têxtil", slug: "textil", description: "Bordado, fibras, crochê e peças afetivas." }
];

export const sellers: Seller[] = [
  {
    id: "seller-1",
    storeName: "Ateliê Raiz Digital",
    slug: "atelie-raiz-digital",
    bio: "Cerâmicas orgânicas com acabamento contemporâneo.",
    story:
      "Lia Carvalho aprendeu a trabalhar com barro com a avó e hoje combina modelagem manual, pigmentos naturais e prototipagem 3D para criar peças numeradas.",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1400&q=80",
    rating: 4.9,
    salesCount: 482
  },
  {
    id: "seller-2",
    storeName: "Casa Linha Viva",
    slug: "casa-linha-viva",
    bio: "Bordados, mantas e objetos têxteis para rituais cotidianos.",
    story:
      "Um coletivo de artesãs do interior que transforma fibras brasileiras em peças feitas sob encomenda, com rastreio de processo e acabamento premium.",
    avatarUrl: "https://images.unsplash.com/photo-1544717305-996b815c338c?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1400&q=80",
    rating: 4.8,
    salesCount: 359
  },
  {
    id: "seller-3",
    storeName: "Oficina Cobre Azul",
    slug: "oficina-cobre-azul",
    bio: "Joias de prata, cobre e pedras naturais em séries curtas.",
    story:
      "A oficina cria joias com inspiração botânica, usando metais reaproveitados, lapidação local e embalagem presenteável sem plástico.",
    avatarUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1400&q=80",
    rating: 4.95,
    salesCount: 618
  }
];

export const products: Product[] = [
  {
    id: "prod-1",
    sellerId: sellers[0].id,
    categoryId: categories[0].id,
    name: "Vaso Aurora feito à mão",
    slug: "vaso-aurora-feito-a-mao",
    description: "Peça única em cerâmica de alta temperatura, com esmalte acetinado e numeração do ateliê.",
    price: 189.9,
    stock: 7,
    images: ["https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=900&q=80"],
    customizationAvailable: false,
    rating: 4.9,
    salesCount: 89,
    seller: sellers[0],
    category: categories[0]
  },
  {
    id: "prod-2",
    sellerId: sellers[2].id,
    categoryId: categories[1].id,
    name: "Colar Horizonte em prata",
    slug: "colar-horizonte-em-prata",
    description: "Joia autoral com pingente martelado, embalagem presenteável e ajuste de comprimento.",
    price: 149.9,
    stock: 12,
    images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80"],
    customizationAvailable: true,
    personalizationPrompt: "Escolha o tamanho da corrente",
    rating: 5,
    salesCount: 126,
    seller: sellers[2],
    category: categories[1]
  },
  {
    id: "prod-3",
    sellerId: sellers[1].id,
    categoryId: categories[2].id,
    name: "Kit botânico de parede",
    slug: "kit-botanico-de-parede",
    description: "Composição artesanal com fibras naturais, madeira reaproveitada e suporte invisível.",
    price: 229.9,
    stock: 4,
    images: ["https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80"],
    customizationAvailable: true,
    personalizationPrompt: "Paleta preferida do ambiente",
    rating: 4.8,
    salesCount: 54,
    seller: sellers[1],
    category: categories[2]
  },
  {
    id: "prod-4",
    sellerId: sellers[0].id,
    categoryId: categories[3].id,
    name: "Caderno Costura Japonesa",
    slug: "caderno-costura-japonesa",
    description: "Papel especial, capa artesanal e opção de gravação do nome na primeira página.",
    price: 79.9,
    stock: 18,
    images: ["https://images.unsplash.com/photo-1493106819501-66d381c466f1?auto=format&fit=crop&w=900&q=80"],
    customizationAvailable: true,
    personalizationPrompt: "Nome ou frase curta para gravação",
    rating: 4.7,
    salesCount: 143,
    seller: sellers[0],
    category: categories[3]
  },
  {
    id: "prod-5",
    sellerId: sellers[1].id,
    categoryId: categories[4].id,
    name: "Manta Ninho em algodão",
    slug: "manta-ninho-em-algodao",
    description: "Manta tecida em tear manual, toque macio e acabamento em franjas.",
    price: 269.9,
    stock: 3,
    images: ["https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80"],
    customizationAvailable: false,
    rating: 4.9,
    salesCount: 71,
    seller: sellers[1],
    category: categories[4]
  },
  {
    id: "prod-6",
    sellerId: sellers[2].id,
    categoryId: categories[1].id,
    name: "Brincos Folha Cobre",
    slug: "brincos-folha-cobre",
    description: "Brincos leves em cobre reaproveitado com banho protetor e desenho botânico.",
    price: 119.9,
    stock: 9,
    images: ["https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80"],
    customizationAvailable: false,
    rating: 4.85,
    salesCount: 98,
    seller: sellers[2],
    category: categories[1]
  }
<<<<<<< HEAD
].map(normalizeProduct);
=======
];
>>>>>>> ca0442ba7cb1df9480aa5e3fd5047c7dc246e2c7
