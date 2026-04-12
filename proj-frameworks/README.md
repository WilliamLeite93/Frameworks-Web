# BrainLog - Plataforma de Resumos para Vestibular

Aplicação web em Vue 3 para organizar resumos de estudo, fazer upload de materiais e acompanhar evolução para vestibulares.

## Stack

- Vue 3 + Vite
- Vue Router
- Pinia
- Axios
- json-server

## Instalar dependências

```bash
npm install
```

## Rodar o projeto

Opção 1 (frontend + json-server juntos):

```bash
npm run dev:all
```

Opção 2 (em 2 terminais):

```bash
npm run server
npm run dev
```

Frontend: `http://localhost:5173`  
API fake (json-server): `http://localhost:3001`

## Acesso

Crie uma conta na rota `/register` para acessar as áreas privadas.

## Rotas

Públicas:

- `/`
- `/login`
- `/register`

Privadas (protegidas por Pinia + Navigation Guard):

- `/dashboard`
- `/upload`
- `/abstracts`
- `/evolution`

Sem login, qualquer acesso às rotas privadas redireciona para `/login`.

## Estrutura principal

- `src/pages/`: telas do sistema
- `src/routes/index.js`: configuração de rotas e guard
- `src/store/auth.js`: sessão e autenticação
- `src/services/authService.js`: login/cadastro no json-server
- `src/services/summaryService.js`: leitura e criação de resumos
- `src/services/api.js`: cliente axios e interceptors
- `db.json`: base fake com usuários e resumos
