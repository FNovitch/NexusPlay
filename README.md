# NexusPlay

Marketplace SaaS fullstack demonstrativo para produtos gamer, com catálogo, páginas de loja, carrinho, checkout simulado, pedidos e painel de vendedor.

O projeto preserva a base React/Vite no frontend e Express/Prisma no backend, mas reposiciona a experiência para uma plataforma moderna de periféricos, acessórios RGB, colecionáveis e itens para setup.

## Stack

- Frontend: React, TypeScript, Vite, TailwindCSS, Zustand, React Router
- Backend: Node.js, Express, Prisma, PostgreSQL, JWT, bcrypt, Helmet, rate limiting
- Pagamentos: Mercado Pago Checkout Pro + webhooks
- Frete: Melhor Envio
- Imagens: Cloudinary
- Demo: dados fictícios de lojas, produtos gamer, pedidos e métricas no frontend

## Fluxo de Portfólio

1. Acesse a home e veja o posicionamento da NexusPlay.
2. Explore marcas, categorias e produtos gamer.
3. Entre com a conta demo de vendedor em `/vendedor/login`.
4. Acesse o painel, cadastre ou edite produtos.
5. Entre como cliente demo em `/login`, adicione produtos ao carrinho e simule um pedido.
6. Veja pedidos e métricas no painel da loja.

## Rodando Localmente

```bash
npm install
npm run db:generate
npm run db:migrate
npm run seed
```

Rode backend e frontend:

```bash
npm run dev --workspace backend
npm run dev --workspace frontend
```

Frontend: `http://127.0.0.1:5173`
Backend: `http://localhost:4000/health`

## Contas Demo

Na tela de login, use o botão `Usar conta demo`.

- Vendedor: abre o painel com produtos, pedidos e métricas fictícias.
- Cliente: permite adicionar itens ao carrinho e criar um pedido simulado localmente.

## Administrador

Admins não são criados por seed e não existem credenciais públicas no repositório.

Crie o primeiro administrador manualmente:

```bash
npm run create:admin
```

O comando solicita nome, email e senha forte, salva apenas o hash bcrypt e não imprime a senha.

## Seed

O seed cria apenas dados não sensíveis, como categorias gamer e planos. Em `NODE_ENV=production`, o seed é ignorado.

## Segurança

- `.env` e `.env.*` ficam fora do Git.
- Senhas são salvas com bcrypt.
- JWT usa `JWT_SECRET` vindo do ambiente.
- Admin usa login separado e rotas protegidas por role `ADMIN`.
- Webhook Mercado Pago valida `x-signature` e `x-request-id`.
- Tokens Mercado Pago, Cloudinary, SMTP e Melhor Envio nunca devem ser expostos no frontend.
