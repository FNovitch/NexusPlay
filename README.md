# KRIAR

Marketplace fullstack de artesanato com cliente, artesao, administrador, produtos, carrinho, pedidos, Mercado Pago, Melhor Envio e Cloudinary.

## Stack

- Frontend: React, TypeScript, Vite, TailwindCSS, Zustand, React Router
- Backend: Node.js, Express, Prisma, PostgreSQL, JWT, bcrypt, Helmet, rate limiting
- Pagamentos: Mercado Pago Checkout Pro + webhooks
- Frete: Melhor Envio
- Imagens: Cloudinary

## Rodando Localmente

```bash
npm install
```

Copie `.env.example` para `.env` e preencha valores reais apenas no seu ambiente local/produção.

```bash
npm run db:generate
npm run db:migrate
npm run seed
npm run create:admin
```

Rode backend e frontend:

```bash
npm run dev --workspace backend
npm run dev --workspace frontend
```

Frontend: `http://127.0.0.1:5173`
Backend: `http://localhost:4000/health`

## Administrador

Admins nao sao criados por seed e nao existem credenciais publicas no repositorio.

Crie o primeiro administrador manualmente:

```bash
npm run create:admin
```

O comando solicita nome, email e senha forte, salva apenas o hash bcrypt e nao imprime a senha.

## Seed

O seed e seguro para desenvolvimento e cria apenas dados nao sensiveis, como categorias e planos. Em `NODE_ENV=production`, o seed e ignorado.

## Seguranca

- `.env` e `.env.*` ficam fora do Git.
- Senhas sao salvas com bcrypt.
- JWT usa `JWT_SECRET` vindo do ambiente.
- Admin usa login separado e rotas protegidas por role `ADMIN`.
- Webhook Mercado Pago valida `x-signature` e `x-request-id`.
- Tokens Mercado Pago, Cloudinary, SMTP e Melhor Envio nunca devem ser expostos no frontend.
