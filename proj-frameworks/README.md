# BrainLog - Plataforma de Resumos para Vestibular

Aplicacao web em Vue 3 para organizar resumos de estudo, fazer upload de materiais e acompanhar evolucao para vestibulares.

## Stack

- Frontend: Vue 3, Vite, Vue Router, Pinia e Axios
- Backend: Node.js, Express, TypeScript, JWT, bcrypt e Zod
- Banco: PostgreSQL com Prisma ORM
- Infra local: Docker Compose

## Estrutura

```txt
proj-frameworks/
  frontend/
    src/
    public/
    package.json
    vite.config.js

  backend/
    src/
    prisma/
    package.json
    Dockerfile

  docker-compose.yml
  package.json
```

## Instalar dependencias

Na raiz do projeto:

```bash
npm install
```

O projeto usa npm workspaces para instalar dependencias de `frontend` e `backend`.

## Executar apos clonar em outra maquina

1. Clone o repositorio e entre na pasta do projeto:

```bash
git clone <url-do-repositorio>
cd proj-frameworks
```

2. Instale as dependencias:

```bash
npm install
```

3. Crie o arquivo de ambiente do backend:

```bash
copy backend\.env.example backend\.env
```

No Linux/macOS:

```bash
cp backend/.env.example backend/.env
```

4. Suba PostgreSQL, API e frontend com Docker:

```bash
docker compose up -d --build
```

5. Acesse:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001`
- Health check da API: `http://localhost:3001/health`

Observacao: o container da API executa as migrations automaticamente com `prisma migrate deploy`.

## Configurar backend local

Crie um arquivo `backend/.env` a partir de `backend/.env.example`:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/brainlog?schema=public"
JWT_SECRET="troque-este-segredo-em-producao"
PORT=3001
UPLOAD_DIR="uploads"
```

## Rodar com Docker

Para subir PostgreSQL, API e frontend:

```bash
docker compose up -d --build
```

Frontend: `http://localhost:5173`
API: `http://localhost:3001`
PostgreSQL: `localhost:5432`

O container da API executa `prisma migrate deploy` antes de iniciar.

## Rodar em desenvolvimento

Suba o Postgres pelo Docker:

```bash
docker compose up -d postgres
```

Gere o Prisma Client e aplique as migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Rode frontend e backend juntos:

```bash
npm run dev:all
```

Ou em terminais separados:

```bash
npm run server
npm run dev
```

Frontend: `http://localhost:5173`
API Node/Prisma: `http://localhost:3001`

## Endpoints principais

- `GET /health`: status da API
- `POST /users`: cadastro com e-mail unico, senha criptografada e retorno de JWT
- `GET /users?email=...`: consulta de usuario sem expor senha
- `POST /auth/login`: autenticacao por e-mail/senha
- `POST /auth/logout`: rota protegida para encerrar sessao no cliente
- `GET /auth/me`: usuario autenticado pelo token
- `GET /summaries?ownerId=...`: biblioteca do usuario autenticado, com filtros opcionais `subject`, `status` e `search`
- `POST /summaries`: criacao de resumo
- `PATCH /summaries/:id/status`: alteracao de status entre `Novo`, `Em revisão` e `Revisado`
- `POST /summaries/:id/files`: upload real de anexos via multipart/form-data
- `GET /dashboard/:ownerId`: metricas agregadas por status, materia e evolucao mensal

## Rotas do frontend

Publicas:

- `/`
- `/login`
- `/register`

Privadas:

- `/dashboard`
- `/upload`
- `/abstracts`
- `/evolution`

Sem login, qualquer acesso as rotas privadas redireciona para `/login`.

## Scripts principais

- `npm run dev`: frontend
- `npm run server`: backend
- `npm run dev:all`: frontend + backend
- `npm run build`: build do frontend
- `npm run server:build`: build do backend
- `npm run prisma:generate`: gera Prisma Client
- `npm run prisma:migrate`: cria/aplica migrations em desenvolvimento
- `npm run docker:up`: sobe Compose com build
- `npm run docker:down`: derruba Compose

## Observacoes

- `db.json` permanece apenas como referencia antiga dos dados usados antes do backend real.
- O backend local usa `backend/.env`.
- O Docker Compose injeta as variaveis da API diretamente no servico `api`.
- Para producao, troque `JWT_SECRET` por um segredo forte.
