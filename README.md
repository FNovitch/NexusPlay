# KRIAR - Onde a Arte encontra o Futuro

Marketplace fullstack de artesanato inspirado no Elo7, com vendedores independentes, lojas proprias, catalogo com filtros, carrinho multi-vendedor, avaliacoes, painel do artesao, admin e checkout Mercado Pago.

## Stack

- Frontend: React, TypeScript, Vite, TailwindCSS, Zustand, React Router
- Backend: Node.js, Express, Prisma, PostgreSQL, JWT, bcrypt, Helmet, rate limiting
- Pagamentos: Mercado Pago Preferences + webhook
- Deploy sugerido: Vercel para `frontend/`, Render/Railway para `backend/`, Supabase/Neon para PostgreSQL

## Estrutura

```txt
frontend/        SPA React com vitrine, loja, carrinho, checkout e dashboards
backend/         API REST Express em estrutura MVC
backend/prisma/  Schema PostgreSQL e seed
```

## Rodando localmente

1. Instale dependencias:

```bash
npm install
```

2. Copie `.env.example` para `.env` e preencha as variaveis.

3. Gere o Prisma Client e rode a migracao:

```bash
npm run db:generate
npm run db:migrate
npm run seed
```

4. Rode backend e frontend em terminais separados:

```bash
npm run dev --workspace backend
npm run dev --workspace frontend
```

Frontend: `http://127.0.0.1:5173`  
Backend: `http://localhost:4000/health`

## Contas demo do seed

- Admin: `admin@kriar.com` / `Kriar@12345`
- Vendedor: `atelie@kriar.com` / `Kriar@12345`

## Principais rotas da API

- `POST /api/v1/register`
- `POST /api/v1/login`
- `GET /api/v1/products`
- `GET /api/v1/products/autocomplete?q=vaso`
- `GET /api/v1/products/:slug`
- `GET /api/v1/sellers/:slug`
- `POST /api/v1/seller/products`
- `POST /api/v1/checkout`
- `POST /api/v1/payments/webhook`
- `POST /api/v1/reviews`
- `GET /api/v1/admin/overview`

## Mercado Pago

Defina `MERCADO_PAGO_ACCESS_TOKEN` no backend. Sem token, a API retorna uma preferencia mock para desenvolvimento. Em producao, configure o webhook publico do backend em `POST /api/v1/payments/webhook`.

## Seguranca

- Senhas com bcrypt
- JWT para autenticacao
- Roles `CUSTOMER`, `SELLER`, `ADMIN`
- Helmet, CORS restrito, rate limiting e HPP
- Validador Zod em entradas
- Prisma ORM para evitar SQL injection por queries parametrizadas
- Sanitizacao basica contra scripts no corpo das requisicoes

## Deploy

### Frontend na Vercel

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Env: `VITE_API_URL=https://sua-api.com/api/v1`

### Backend no Render/Railway

- Root directory: `backend`
- Build command: `npm install && npm run prisma:generate && npm run build`
- Start command: `npm run start`
- Env: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `MERCADO_PAGO_ACCESS_TOKEN`

### Banco no Supabase/Neon

Use a connection string PostgreSQL em `DATABASE_URL` e rode as migracoes do Prisma no ambiente de deploy ou via CI.
