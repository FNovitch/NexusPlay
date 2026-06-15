# NexusPlay

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-7c3aed?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=111827)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?style=for-the-badge&logo=prisma&logoColor=white)

NexusPlay é um marketplace fullstack demonstrativo para o nicho gamer, com catálogo de produtos, lojas vendedoras, carrinho, checkout, pedidos, painel do vendedor e área administrativa.

O projeto foi desenvolvido como uma aplicação SaaS de portfólio, com frontend em React e backend próprio em Node.js, sem dependência da API de projetos antigos.

## Visão Geral

- Marketplace gamer com produtos, categorias e lojas.
- Fluxo de cliente com cadastro, login, carrinho, frete, checkout e pedidos.
- Fluxo de vendedor com cadastro de loja, assinatura, produtos, métricas e pedidos recebidos.
- Painel administrativo para clientes, vendedores, produtos, pedidos, categorias, avaliações, assinaturas, pagamentos e repasses.
- Modo demo/local para facilitar apresentação sem credenciais reais de serviços externos.

## Tecnologias

### Frontend

- React
- TypeScript
- Vite
- TailwindCSS
- Zustand
- React Router
- Axios
- Lucide React

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt
- Zod
- Helmet
- Rate limiting

### Integrações

- Mercado Pago Checkout Pro
- Melhor Envio
- Cloudinary
- Nodemailer/SMTP

As integrações são opcionais em desenvolvimento. Sem credenciais reais, o projeto mantém fluxos locais/demo sempre que possível.

## Funcionalidades

- Listagem de produtos e categorias.
- Página de detalhes do produto.
- Página pública de lojas.
- Autenticação de cliente, vendedor e administrador.
- Cadastro e edição de perfil de loja.
- Cadastro, edição e remoção de produtos pelo vendedor.
- Upload de imagens de produtos.
- Carrinho agrupado por loja.
- Cálculo de entrega ou retirada.
- Checkout com criação de pedido.
- Histórico e status de pedidos.
- Confirmação de recebimento pelo cliente.
- Avaliações de produto e loja.
- Favoritos.
- Planos e assinatura do vendedor.
- Painel administrativo completo.

## Estrutura

```bash
.
├── backend
│   ├── prisma
│   ├── scripts
│   └── src
├── frontend
│   ├── public
│   └── src
├── package.json
└── README.md
```

## Como Rodar

### Pré-requisitos

- Node.js 20+
- PostgreSQL
- npm

### Instalação

```bash
npm install
```

### Variáveis de ambiente

Use `.env.example` como base para configurar os ambientes localmente.

Valores principais:

```env
PORT=4000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/nexusplay?schema=public"
JWT_SECRET="YOUR_LONG_RANDOM_SECRET_WITH_AT_LEAST_32_CHARACTERS"
FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:4000"
VITE_API_URL="http://localhost:4000/api/v1"
```

Importante: o NexusPlay deve usar banco, URL e secrets próprios. Não reutilize variáveis de ambiente de outro projeto.

### Banco de dados

```bash
npm run db:generate
npm run db:migrate
npm run seed
```

### Ambiente de desenvolvimento

Para iniciar frontend e backend:

```bash
npm run dev
```

Ou separadamente:

```bash
npm run dev --workspace backend
npm run dev --workspace frontend
```

URLs locais:

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://localhost:4000`
- Health check: `http://localhost:4000/health`

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run db:generate
npm run db:migrate
npm run seed
npm run create:admin
```

## Administrador

O projeto não publica credenciais administrativas.

Para criar o primeiro administrador:

```bash
npm run create:admin
```

O comando solicita nome, email e senha, salva apenas o hash com bcrypt e não imprime a senha no terminal.

## Modo Demo

O frontend possui dados e fluxos demonstrativos para facilitar apresentação do projeto.

- Cliente demo: permite navegar, adicionar produtos ao carrinho e simular pedidos.
- Vendedor demo: permite acessar painel, métricas, produtos e pedidos simulados.
- Frete, email, upload e pagamento possuem fallback local/demo quando não há credenciais configuradas em desenvolvimento.

## API

A API principal roda em:

```txt
http://localhost:4000/api/v1
```

Rotas principais:

- `/customers`
- `/sellers`
- `/products`
- `/categories`
- `/orders`
- `/shipping`
- `/subscriptions`
- `/admin`

Algumas rotas antigas permanecem como aliases internos de compatibilidade, mas o frontend do NexusPlay consome os endpoints padronizados do projeto.

## Segurança

- `.env` e `.env.*` não devem ser versionados.
- Senhas são armazenadas com bcrypt.
- JWT usa segredo vindo do ambiente.
- Rotas administrativas exigem role `ADMIN`.
- Webhooks do Mercado Pago validam assinatura quando `MERCADO_PAGO_WEBHOOK_SECRET` está configurado.
- Credenciais de Mercado Pago, Cloudinary, SMTP e Melhor Envio ficam somente no backend.

## Status

Projeto em evolução para portfólio, com foco em demonstrar uma experiência fullstack completa de marketplace SaaS para o segmento gamer.
