import { normalizeProduct } from "../api/products";
import type { Category, Product, Seller } from "../types";

export const categories: Category[] = [
  {
    id: "cat-1",
    name: "Hardware e periféricos",
    slug: "hardware-perifericos",
    description: "Teclados, mouses e acessórios de alta precisão para PC gamer."
  },
  {
    id: "cat-2",
    name: "Áudio e streaming",
    slug: "audio-streaming",
    description: "Headsets, microfones e equipamentos para partidas, lives e calls."
  },
  {
    id: "cat-3",
    name: "Consoles e controles",
    slug: "consoles-controles",
    description: "Controles, docks, carregadores e acessórios multiplataforma."
  },
  {
    id: "cat-4",
    name: "Setup e ergonomia",
    slug: "setup-ergonomia",
    description: "Iluminação, suportes e organização para uma mesa confortável."
  },
  {
    id: "cat-5",
    name: "Colecionáveis e decoração",
    slug: "colecionaveis-decoracao",
    description: "Peças de coleção, displays e objetos para personalizar o espaço gamer."
  }
];

export const sellers: Seller[] = [
  {
    id: "seller-1",
    storeName: "Nexus Gear",
    slug: "nexus-gear",
    bio: "Hardware gamer selecionado para quem busca precisão, baixa latência e acabamento premium.",
    story:
      "A Nexus Gear foca em periféricos e equipamentos de performance para PC gamers, streamers e criadores que precisam de resposta rápida sem abrir mão de um setup limpo.",
    avatarUrl: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=1400&q=80",
    rating: 4.9,
    salesCount: 516,
    status: "APPROVED"
  },
  {
    id: "seller-2",
    storeName: "Pixel Relic",
    slug: "pixel-relic",
    bio: "Colecionáveis, displays e decoração para transformar mesa, estante e sala gamer.",
    story:
      "A Pixel Relic cria uma curadoria de peças visuais inspiradas por jogos, ficção científica e cultura arcade, com foco em acabamento e presença de coleção.",
    avatarUrl: "https://images.unsplash.com/photo-1608889476518-738c9b1dcb40?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1608889476518-738c9b1dcb40?auto=format&fit=crop&w=1400&q=80",
    rating: 4.85,
    salesCount: 388,
    status: "APPROVED"
  },
  {
    id: "seller-3",
    storeName: "Arcade Vault",
    slug: "arcade-vault",
    bio: "Acessórios para consoles, iluminação e ergonomia para sessões longas de gameplay.",
    story:
      "A Arcade Vault reúne controles, bases, suportes e itens de conforto para jogadores que alternam entre PC, console e mobile sem bagunçar a estação.",
    avatarUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1400&q=80",
    rating: 4.92,
    salesCount: 642,
    status: "APPROVED"
  }
];

export const products: Product[] = [
  {
    id: "prod-1",
    sellerId: sellers[0].id,
    categoryId: categories[0].id,
    name: "Teclado Hall Effect NovaStrike 75",
    slug: "teclado-hall-effect-novastrike-75",
    description: "Teclado compacto 75% com switches magnéticos, actuation ajustável, keycaps PBT e perfil pensado para FPS competitivo.",
    price: 589.9,
    stock: 14,
    images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80"],
    customizationAvailable: true,
    personalizationPrompt: "Escolha cor do case, força de atuação e layout ABNT2 ou ANSI",
    variations: [
      { name: "Layout", options: ["ABNT2", "ANSI"] },
      { name: "Cor", options: ["Grafite", "Branco lunar"] }
    ],
    weight: 0.86,
    dimensions: { width: 32, height: 4, length: 14 },
    rating: 4.95,
    salesCount: 152,
    seller: sellers[0],
    category: categories[0]
  },
  {
    id: "prod-2",
    sellerId: sellers[0].id,
    categoryId: categories[0].id,
    name: "Mouse Helios Pro Wireless 8K",
    slug: "mouse-helios-pro-wireless-8k",
    description: "Mouse sem fio ultraleve com polling rate 8K, sensor de alta precisão, skates PTFE e dock de recarga magnético.",
    price: 429.9,
    stock: 18,
    images: ["https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80"],
    customizationAvailable: false,
    variations: [{ name: "Cor", options: ["Preto fosco", "Branco gelo"] }],
    weight: 0.21,
    dimensions: { width: 7, height: 4, length: 12 },
    rating: 4.88,
    salesCount: 117,
    seller: sellers[0],
    category: categories[0]
  },
  {
    id: "prod-3",
    sellerId: sellers[0].id,
    categoryId: categories[1].id,
    name: "Headset ArenaCast USB-C",
    slug: "headset-arenacast-usb-c",
    description: "Headset fechado com áudio espacial, microfone removível, cabo USB-C/P2 e almofadas respiráveis para maratonas online.",
    price: 369.9,
    stock: 10,
    images: ["https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=900&q=80"],
    customizationAvailable: true,
    personalizationPrompt: "Informe a plataforma principal para receber o cabo indicado",
    variations: [{ name: "Plataforma", options: ["PC", "PlayStation", "Xbox", "Switch"] }],
    weight: 0.58,
    dimensions: { width: 20, height: 22, length: 10 },
    rating: 4.9,
    salesCount: 103,
    seller: sellers[0],
    category: categories[1]
  },
  {
    id: "prod-4",
    sellerId: sellers[0].id,
    categoryId: categories[1].id,
    name: "Microfone WaveForge RGB",
    slug: "microfone-waveforge-rgb",
    description: "Microfone condensador USB com padrão cardioide, filtro pop integrado, mute por toque e iluminação discreta para streaming.",
    price: 299.9,
    stock: 11,
    images: ["https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=900&q=80"],
    customizationAvailable: false,
    weight: 0.74,
    dimensions: { width: 12, height: 24, length: 12 },
    rating: 4.82,
    salesCount: 86,
    seller: sellers[0],
    category: categories[1]
  },
  {
    id: "prod-5",
    sellerId: sellers[2].id,
    categoryId: categories[2].id,
    name: "Controle FluxPad Pro Multiplataforma",
    slug: "controle-fluxpad-pro-multiplataforma",
    description: "Controle sem fio com gatilhos hall effect, conexão Bluetooth/2.4 GHz, grip texturizado e perfis para PC, console e mobile.",
    price: 399.9,
    stock: 16,
    images: ["https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=900&q=80"],
    customizationAvailable: false,
    variations: [{ name: "Cor", options: ["Noite", "Cobalto"] }],
    weight: 0.36,
    dimensions: { width: 16, height: 7, length: 11 },
    rating: 4.86,
    salesCount: 132,
    seller: sellers[2],
    category: categories[2]
  },
  {
    id: "prod-6",
    sellerId: sellers[2].id,
    categoryId: categories[2].id,
    name: "Base DualCharge Station",
    slug: "base-dualcharge-station",
    description: "Dock de carregamento para dois controles com indicadores LED, proteção contra sobrecarga e acabamento baixo perfil.",
    price: 189.9,
    stock: 22,
    images: ["https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=900&q=80"],
    customizationAvailable: false,
    weight: 0.44,
    dimensions: { width: 18, height: 7, length: 14 },
    rating: 4.73,
    salesCount: 79,
    seller: sellers[2],
    category: categories[2]
  },
  {
    id: "prod-7",
    sellerId: sellers[2].id,
    categoryId: categories[3].id,
    name: "Braço Titan Arm para monitor",
    slug: "braco-titan-arm-monitor",
    description: "Suporte articulado para monitor de até 32 polegadas, com ajuste de altura, rotação e passagem interna de cabos.",
    price: 259.9,
    stock: 9,
    images: ["https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?auto=format&fit=crop&w=900&q=80"],
    customizationAvailable: false,
    weight: 2.4,
    dimensions: { width: 43, height: 12, length: 18 },
    rating: 4.79,
    salesCount: 64,
    seller: sellers[2],
    category: categories[3]
  },
  {
    id: "prod-8",
    sellerId: sellers[2].id,
    categoryId: categories[3].id,
    name: "Painel PixelWall Mini RGB",
    slug: "painel-pixelwall-mini-rgb",
    description: "Kit modular de painéis luminosos para fundo de live, iluminação ambiente e cenas sincronizadas com o setup.",
    price: 329.9,
    stock: 7,
    images: ["https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80"],
    customizationAvailable: true,
    personalizationPrompt: "Informe o formato de montagem desejado: linha, colmeia ou canto",
    variations: [{ name: "Kit", options: ["6 painéis", "9 painéis"] }],
    weight: 1.2,
    dimensions: { width: 28, height: 8, length: 28 },
    rating: 4.91,
    salesCount: 98,
    seller: sellers[2],
    category: categories[3]
  },
  {
    id: "prod-9",
    sellerId: sellers[1].id,
    categoryId: categories[4].id,
    name: "Estátua Boss Arena Dragão Neon",
    slug: "estatua-boss-arena-dragao-neon",
    description: "Peça decorativa de resina com pintura fosca, detalhes translúcidos e base expositora inspirada em arenas de RPG.",
    price: 279.9,
    stock: 6,
    images: ["https://images.unsplash.com/photo-1608889476518-738c9b1dcb40?auto=format&fit=crop&w=900&q=80"],
    customizationAvailable: false,
    weight: 0.95,
    dimensions: { width: 18, height: 26, length: 18 },
    rating: 4.94,
    salesCount: 71,
    seller: sellers[1],
    category: categories[4]
  },
  {
    id: "prod-10",
    sellerId: sellers[1].id,
    categoryId: categories[4].id,
    name: "Display Cartridge Frame",
    slug: "display-cartridge-frame",
    description: "Display acrílico com base magnética para cartuchos, cards ou miniaturas, ideal para organizar uma coleção retrô.",
    price: 129.9,
    stock: 20,
    images: ["https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80"],
    customizationAvailable: true,
    personalizationPrompt: "Informe se o display será usado para cartucho, card ou miniatura",
    variations: [{ name: "Tamanho", options: ["Individual", "Trio"] }],
    weight: 0.32,
    dimensions: { width: 14, height: 10, length: 8 },
    rating: 4.81,
    salesCount: 92,
    seller: sellers[1],
    category: categories[4]
  }
].map(normalizeProduct);
