# NexusPlay

Marketplace full stack geek/gamer feito para portfólio. A ideia do projeto é simular uma plataforma onde clientes compram produtos de várias lojas, vendedores gerenciam seus itens e um administrador acompanha a operação.

![Status](https://img.shields.io/badge/status-demo%20online-22c55e?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=111827)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?style=for-the-badge&logo=prisma&logoColor=white)

## Sobre o projeto

O NexusPlay foi criado para praticar e mostrar um fluxo mais completo de aplicação web, indo além de um CRUD simples. Ele tem catálogo público, carrinho, checkout, pedidos, painel de vendedor, painel administrativo e integrações que podem rodar em modo real ou em modo demonstração.

Para portfólio, o projeto pode rodar em `DEMO_MODE=true`: o frontend permanece navegável, o backend fica publicado e responde rotas representativas sem depender de PostgreSQL, Mercado Pago, Melhor Envio ou Cloudinary. Para uso completo, basta desligar o modo demo e configurar PostgreSQL com Prisma, migrations, seed e variáveis de ambiente.

## Status atual

O projeto está publicado em modo portfólio e a base principal já foi implementada. Hoje ele conta com:

- Catálogo geek/gamer.
- Login e cadastro.
- Perfis de cliente, vendedor e administrador.
- Carrinho e pedidos.
- Painéis separados por tipo de usuário.
- API demo sem banco externo para apresentação online.
- Seed com dados de demonstração para o modo completo.
- Configuração para Mercado Pago, Melhor Envio, Cloudinary e envio de email.

As próximas melhorias são ampliar testes automatizados, melhorar observabilidade e adicionar imagens ou vídeo de demonstração no README.

## Funcionalidades

- Catálogo público com produtos, categorias, lojas e página de detalhes.
- Cadastro e login de cliente, vendedor e administrador.
- Carrinho separado por loja.
- Cálculo de entrega e checkout.
- Histórico de pedidos e confirmação de recebimento.
- Painel do vendedor para loja, produtos, pedidos e assinatura.
- Upload de imagens com Cloudinary.
- Painel administrativo para acompanhar clientes, lojas, produtos, pedidos, avaliações, categorias, assinaturas, pagamentos e repasses.
- Integração com Mercado Pago Checkout Pro.
- Integração com Melhor Envio para frete.
- Recuperação de senha por SMTP.
- Seed seguro para categorias, planos e catálogo demo.

## Perfis da aplicação

- Cliente: pode se cadastrar, fazer login, adicionar produtos ao carrinho, finalizar compra e acompanhar pedidos.
- Vendedor: pode cadastrar loja, editar perfil, gerenciar produtos e acompanhar pedidos recebidos.
- Administrador: pode acessar um painel para aprovar e acompanhar dados importantes da plataforma.

## Tecnologias utilizadas

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

## Estrutura

```txt
.
├── backend
│   ├── prisma              # Schema, migrations e seed
│   ├── scripts             # Criação segura de administrador
│   └── src
│       ├── config          # Variáveis e integrações
│       ├── controllers     # Controllers das rotas
│       ├── middlewares     # Auth, validação, erros e upload
│       ├── modules         # Schemas, mappers e tipos
│       ├── routes          # Rotas da API
│       └── services        # Email, storage, pagamento e frete
├── frontend
│   ├── public              # Marca, favicon e assets públicos
│   └── src
│       ├── components
│       ├── config
│       ├── data            # Dados demo usados como fallback/local
│       ├── pages
│       ├── services
│       └── store
├── .env.example
└── package.json
```

## Como rodar localmente

Pré-requisitos:

- Node.js 20+
- PostgreSQL
- npm

Instale as dependências:

```bash
npm install
```

Crie os arquivos de ambiente:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

No backend, configure pelo menos:

```env
NODE_ENV=development
DEMO_MODE=false
PORT=4000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/nexusplay_dev?schema=nexusplay_dev"
DATABASE_SCHEMA="nexusplay_dev"
JWT_SECRET="uma_chave_com_pelo_menos_32_caracteres"
FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:4000"
```

Use um banco ou schema dedicado para o NexusPlay. O backend bloqueia `DATABASE_URL` sem `schema`, com `schema=public` ou com schema diferente de `DATABASE_SCHEMA`, para evitar mexer sem querer em outro projeto.

No frontend:

```env
VITE_API_URL="http://localhost:4000/api/v1"
VITE_BACKEND_URL="http://localhost:4000"
VITE_DEMO_MODE=true
```

Prepare o banco:

```bash
npm run db:generate
npm run db:migrate
npm run seed
```

Crie um administrador:

```bash
npm run create:admin
```

Rode o backend e o frontend:

```bash
npm run dev --workspace backend
npm run dev --workspace frontend
```

URLs locais:

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://localhost:4000`
- Health check: `http://localhost:4000/health`

### Rodar sem banco para portfólio

Para apresentar o projeto sem configurar PostgreSQL, use o backend em modo demo:

```env
NODE_ENV=development
DEMO_MODE=true
PORT=4000
FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:4000"
CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
```

Nesse modo, `DATABASE_URL` deixa de ser obrigatória. O backend responde `/health`, `/api/v1/demo/status`, catálogo, lojas, login demo, pedidos, frete e assinatura com dados simulados. O modo completo continua disponível com `DEMO_MODE=false` e PostgreSQL configurado.

## Variáveis de ambiente

Backend:

- `NODE_ENV`
- `DEMO_MODE`
- `PORT`
- `DATABASE_URL`
- `DATABASE_SCHEMA`
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

Em produção demo, configure `DEMO_MODE=true`, `FRONTEND_URL`, `BACKEND_URL` e `CORS_ORIGINS`. `DATABASE_URL` não é necessária para a vitrine de portfólio.

Em produção real, use `DEMO_MODE=false` e configure com cuidado `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `BACKEND_URL` e `CORS_ORIGINS`. As credenciais do Mercado Pago, SMTP, Cloudinary e Melhor Envio só precisam estar preenchidas quando esses fluxos forem usados de verdade ou em sandbox.

Se `MERCADO_PAGO_ACCESS_TOKEN` estiver configurado em produção, `MERCADO_PAGO_WEBHOOK_SECRET` também é obrigatório.

Use `backend/.env.example` e `frontend/.env.example` como base. A ideia é manter ambientes separados, por exemplo:

- Desenvolvimento: `nexusplay_dev`
- Teste: `nexusplay_test`
- Produção: `nexusplay`

O valor de `DATABASE_URL` precisa apontar para o mesmo schema definido em `DATABASE_SCHEMA`. Evite usar `public` ou compartilhar schema com outro projeto.

## Modo demonstração

O modo demonstração tem duas camadas:

- Backend: `DEMO_MODE=true`
- Frontend: `VITE_DEMO_MODE=true`

`DEMO_MODE=true` faz a API subir sem banco externo e responder dados simulados para rotas importantes da apresentação:

- `/health`
- `/api/v1/demo/status`
- `/api/v1/categories`
- `/api/v1/products`
- `/api/v1/sellers`
- Login demo, pedidos, frete, assinatura e dashboard com respostas mockadas.

`VITE_DEMO_MODE=true` ativa recursos no frontend para facilitar a apresentação:

- Botões de conta demo no login.
- Fallbacks locais quando a API não está disponível.
- Pedidos simulados para tokens demo.
- Aviso discreto no topo da interface.

Com `DEMO_MODE=false` e `VITE_DEMO_MODE=false`, os fallbacks são desligados. Nesse caso, se a API ou o banco falharem, o frontend mostra erro ou estado vazio em vez de trocar dados reais por mocks.

## Segurança

Alguns cuidados que já foram colocados no projeto:

- Senhas salvas com bcrypt.
- JWT usando segredo vindo do ambiente.
- Rotas administrativas protegidas para usuário `ADMIN`.
- Rate limiting no login.
- Webhooks do Mercado Pago com assinatura obrigatória em produção.
- CORS configurável por ambiente.
- Arquivos `.env` ignorados pelo Git.
- Seed sem criação automática de administrador.
- Bloqueio de migrations e seed quando o banco usa schema `public` ou não declara schema dedicado.

## Deploy

### Deploy de portfólio sem banco

Este é o caminho recomendado para manter a demo online e estável:

1. Publicar o backend no Vercel com root directory `backend`.
2. Configurar no backend:
   - `NODE_ENV=production`
   - `DEMO_MODE=true`
   - `FRONTEND_URL=<url do frontend>`
   - `BACKEND_URL=<url do backend>`
   - `CORS_ORIGINS=<url do frontend>`
3. Publicar o frontend no Vercel com root directory `frontend`.
4. Configurar no frontend:
   - `VITE_API_URL=<url do backend>/api/v1`
   - `VITE_BACKEND_URL=<url do backend>`
   - `VITE_DEMO_MODE=true`
5. Testar `/health`, `/api/v1/demo/status`, catálogo, login demo, carrinho, checkout simulado e painéis.

### Deploy completo com banco

Uma opção para publicar o modo completo:

- Frontend: Vercel ou Netlify.
- Backend: Render, Railway ou Fly.io.
- Banco: Neon, Supabase Postgres ou Railway Postgres.
- Imagens: Cloudinary.
- Email: Resend, Brevo ou SMTP compatível.

Passos gerais:

1. Criar o banco PostgreSQL com um schema dedicado, por exemplo `nexusplay`.
2. Configurar as variáveis de ambiente do backend.
3. Rodar `npm run db:migrate --workspace backend`.
4. Rodar `npm run seed --workspace backend`.
5. Criar o primeiro administrador com `npm run create:admin --workspace backend`.
6. Publicar o backend e testar `/health`.
7. Configurar `VITE_API_URL` e `VITE_BACKEND_URL` no frontend.
8. Publicar o frontend.
9. Atualizar `FRONTEND_URL`, `BACKEND_URL` e `CORS_ORIGINS` com os domínios finais.
10. Testar cadastro, login, painel, produto, frete, checkout e pedidos.

## Algumas decisões do projeto

- O backend tem integrações reais configuráveis, mas o projeto foi pensado principalmente para demonstração.
- O seed cria dados de vitrine, vendedor demo e cliente demo sem apagar dados antigos de outros projetos.
- O admin demo só é criado quando `SEED_DEMO_ADMIN_EMAIL` e `SEED_DEMO_ADMIN_PASSWORD` estão definidos.
- Os produtos demo usam imagens remotas para facilitar o primeiro deploy.
- Favoritos ficam no estado local por enquanto.
- A autenticação usa JWT em `localStorage` para manter o escopo mais simples nesta versão.

## Limitações conhecidas

- Ainda não é uma aplicação pronta para uso comercial real.
- Pagamento, frete e email podem depender de sandbox ou simulação.
- Favoritos ainda não sincronizam com o backend.
- Não há backup automatizado documentado.
- Ainda não existe cobertura completa de testes automatizados.
- Qualquer limpeza destrutiva em banco compartilhado deve ser feita manualmente, com backup e cuidado.

## Melhorias futuras

- Sincronizar favoritos por usuário.
- Adicionar testes automatizados E2E.
- Criar screenshots e vídeo demonstrativo da aplicação publicada.
- Melhorar logs e monitoramento.
- Migrar autenticação para cookie `httpOnly` em uma próxima etapa.

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

## Qualidade

Durante a preparação do projeto foram verificados:

- Build completo do backend e frontend.
- Configuração de produção mais restritiva.
- Seed seguro para catálogo de demonstração.
- Metatags básicas, favicon e Open Graph.
- Revalidação de sessão no frontend.
