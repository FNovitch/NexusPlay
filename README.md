# NexusPlay

Marketplace full stack para portfólio, construído para demonstrar uma experiência SaaS gamer de ponta a ponta: catálogo público, lojas, carrinho, checkout, pedidos, painel do vendedor, assinaturas e administração.

![Status](https://img.shields.io/badge/status-em%20andamento-f59e0b?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=111827)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?style=for-the-badge&logo=prisma&logoColor=white)

## Visão Geral

O NexusPlay resolve o problema de apresentar um projeto full stack com fluxos reais o suficiente para uma avaliação técnica: usuários, vendedores, produtos, pedidos, pagamento, frete, upload de imagens e painel administrativo convivem em uma mesma aplicação.

O projeto também possui um modo demo no frontend para apresentação rápida, mas o backend está preparado para rodar com PostgreSQL, migrations, seed de vitrine e integrações externas configuradas por variáveis de ambiente.

## Estado Atual

O projeto está em andamento e já possui a base funcional do marketplace implementada. A aplicação conta com catálogo gamer/geek, autenticação, áreas de cliente, vendedor e administrador, seed demonstrativo e configuração para integrações externas. As próximas etapas são publicar o ambiente, validar os fluxos em produção e adicionar materiais visuais da demonstração.

## Funcionalidades

- Catálogo público com produtos, categorias, lojas e detalhes.
- Cadastro e login de cliente, vendedor e administrador.
- Carrinho agrupado por loja, cálculo de entrega e checkout.
- Histórico de pedidos, status e confirmação de recebimento.
- Painel do vendedor com perfil, produtos, pedidos e assinatura.
- Upload de imagens com Cloudinary em produção.
- Painel administrativo para clientes, lojas, produtos, pedidos, avaliações, categorias, assinaturas, pagamentos e repasses.
- Integração com Mercado Pago Checkout Pro.
- Integração com Melhor Envio para frete.
- Recuperação de senha por SMTP.
- Seed seguro para categorias, planos e catálogo público de demonstração.

## Perfis Disponíveis

- Cliente: cadastro, login, carrinho, checkout, pedidos e confirmação de recebimento.
- Vendedor: cadastro de loja, perfil, assinatura, produtos e pedidos recebidos.
- Administrador: painel para aprovar lojas/produtos e acompanhar a operação.

## Tecnologias

Frontend:

- React
- TypeScript
- Vite
- TailwindCSS
- Zustand
- React Router
- Axios
- Lucide React

Backend:

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt
- Zod
- Helmet
- CORS
- Rate limiting

Integrações:

- Mercado Pago
- Melhor Envio
- Cloudinary
- SMTP/Nodemailer

## Arquitetura

```txt
.
├── backend
│   ├── prisma              # Schema, migrations e seed
│   ├── scripts             # Criação segura de administrador
│   └── src
│       ├── config          # Variáveis e integrações
│       ├── controllers     # Regras HTTP
│       ├── middlewares     # Auth, validação, erros, upload
│       ├── modules         # Schemas, mappers e tipos
│       ├── routes          # Rotas da API
│       └── services        # Email, storage, pagamento e frete
├── frontend
│   ├── public              # Marca, favicon e assets públicos
│   └── src
│       ├── components
│       ├── config
│       ├── data            # Dados demo usados apenas como fallback/local
│       ├── pages
│       ├── services
│       └── store
├── .env.example
└── package.json
```

## Como Rodar Localmente

Pré-requisitos:

- Node.js 20+
- PostgreSQL
- npm

Instalação:

```bash
npm install
```

Configure as variáveis:

```bash
cp .env.example backend/.env
cp .env.example frontend/.env
```

No backend, preencha pelo menos:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/nexusplay?schema=public"
JWT_SECRET="uma_chave_com_pelo_menos_32_caracteres"
FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:4000"
```

No frontend:

```env
VITE_API_URL="http://localhost:4000/api/v1"
VITE_BACKEND_URL="http://localhost:4000"
VITE_DEMO_MODE=true
```

Banco de dados:

```bash
npm run db:generate
npm run db:migrate
npm run seed
```

Criar administrador:

```bash
npm run create:admin
```

Ambiente de desenvolvimento:

```bash
npm run dev --workspace backend
npm run dev --workspace frontend
```

URLs locais:

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://localhost:4000`
- Health check: `http://localhost:4000/health`

## Variáveis De Ambiente

Backend:

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `FRONTEND_URL`
- `BACKEND_URL`
- `CORS_ORIGINS`
- `MERCADO_PAGO_ACCESS_TOKEN`
- `MERCADO_PAGO_PUBLIC_KEY`
- `MERCADO_PAGO_WEBHOOK_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER`
- `MELHOR_ENVIO_BASE_URL`
- `MELHOR_ENVIO_TOKEN`
- `MELHOR_ENVIO_CLIENT_ID`
- `MELHOR_ENVIO_CLIENT_SECRET`
- `MELHOR_ENVIO_REDIRECT_URL`
- `MELHOR_ENVIO_SANDBOX`
- `MELHOR_ENVIO_USER_AGENT`
- `MELHOR_ENVIO_CEP_ORIGEM`
- `SEED_DEMO_SELLER_PASSWORD`
- `SEED_DEMO_CUSTOMER_EMAIL`
- `SEED_DEMO_CUSTOMER_PASSWORD`
- `SEED_DEMO_ADMIN_EMAIL`
- `SEED_DEMO_ADMIN_PASSWORD`

Frontend:

- `VITE_API_URL`
- `VITE_BACKEND_URL`
- `VITE_MERCADO_PAGO_PUBLIC_KEY`
- `VITE_MELHOR_ENVIO_ENABLED`
- `VITE_DEMO_MODE`

Em `NODE_ENV=production`, configure corretamente `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `BACKEND_URL` e `CORS_ORIGINS`. Credenciais de Mercado Pago, SMTP, Cloudinary e Melhor Envio são necessárias apenas quando esses fluxos reais ou sandbox estiverem ativos. Se `MERCADO_PAGO_ACCESS_TOKEN` estiver configurado em produção, `MERCADO_PAGO_WEBHOOK_SECRET` também é obrigatório.

## Modo Demonstração

`VITE_DEMO_MODE=true` ativa recursos pensados para apresentação:

- Botões de conta demo no login.
- Fallbacks locais quando a API não estiver disponível.
- Pedidos simulados para tokens demo.
- Aviso discreto no topo da interface.

`VITE_DEMO_MODE=false` desativa fallbacks silenciosos. Nesse modo, falhas da API aparecem como erro ou estado vazio, sem substituir dados reais por mocks.

## Segurança

- Senhas são armazenadas com bcrypt.
- JWT usa segredo obrigatório vindo do ambiente.
- Rotas administrativas exigem usuário `ADMIN`.
- Login possui rate limiting.
- Webhooks do Mercado Pago exigem assinatura em produção.
- CORS deve apontar apenas para os domínios HTTPS do frontend em produção.
- `.env` e `.env.*` são ignorados pelo Git.
- O seed não cria administrador automaticamente.

## Deploy Sugerido

Opção de baixo custo para portfólio:

- Frontend: Vercel ou Netlify.
- Backend: Render, Railway ou Fly.io.
- Banco: Neon, Supabase Postgres ou Railway Postgres.
- Imagens: Cloudinary.
- Email: Resend, Brevo ou SMTP compatível, opcional para a demonstração.

Passos:

1. Criar o banco PostgreSQL.
2. Cadastrar as variáveis de ambiente do backend.
3. Rodar `npm run db:migrate --workspace backend`.
4. Rodar `npm run seed --workspace backend`.
5. Criar o primeiro administrador com `npm run create:admin --workspace backend`.
6. Publicar o backend e testar `/health`.
7. Cadastrar `VITE_API_URL` e `VITE_BACKEND_URL` no frontend.
8. Publicar o frontend.
9. Atualizar `FRONTEND_URL`, `BACKEND_URL` e `CORS_ORIGINS` com os domínios finais.
10. Testar cadastro, login, painel, produto, frete, checkout e pedidos.

## Decisões Técnicas

- O backend mantém integrações reais configuráveis, mas o projeto é apresentado como ambiente demonstrativo.
- O seed é idempotente e cria dados públicos de vitrine, vendedor demo e cliente demo. Admin demo só é criado com `SEED_DEMO_ADMIN_EMAIL` e `SEED_DEMO_ADMIN_PASSWORD`.
- Produtos de demonstração usam imagens remotas para evitar depender de upload público no primeiro deploy.
- Favoritos usam estado local para manter o escopo simples; sincronização com backend é melhoria futura.
- A autenticação permanece com JWT em localStorage para evitar uma refatoração ampla nesta etapa.

## Limitações Conhecidas

- Não é uma aplicação pronta para produção comercial.
- Pagamento, frete e email podem rodar em sandbox ou simulação.
- Favoritos ainda não sincronizam com o backend.
- Não há backup automatizado documentado para ambiente comercial.
- Não há cobertura completa de testes automatizados.

## Melhorias Futuras

- Sincronizar favoritos por usuário.
- Adicionar testes automatizados E2E.
- Criar screenshots e vídeo demonstrativo da aplicação publicada.
- Evoluir logs estruturados e monitoramento.
- Migrar autenticação para cookie `httpOnly` em uma fase posterior.

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

## Status De Qualidade

Verificado durante a preparação do projeto:

- Build completo do backend e frontend.
- Configuração de produção mais restritiva.
- Seed seguro de catálogo para deploy.
- Metatags básicas, favicon e Open Graph.
- Revalidação de sessão no frontend.
