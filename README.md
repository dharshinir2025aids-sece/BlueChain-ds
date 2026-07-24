# BlueChain MRV

Blockchain-Based Blue Carbon Registry and Monitoring, Reporting & Verification (MRV) System — Smart India Hackathon.

## Stack

| Layer | Technology |
|-------|------------|
| Web | Next.js 15, React 19, TypeScript, Tailwind CSS, Shadcn/UI, Framer Motion |
| API | Node.js, Express.js, Prisma, PostgreSQL |
| AI | Python FastAPI (stub in Phase 1) |
| Chain | Solidity + Hardhat scaffold (logic in Phase 8) |

## Monorepo

```text
apps/web          Next.js frontend
apps/api          Express + Prisma API
apps/ai           FastAPI AI service
packages/shared   Shared TypeScript types
contracts         Solidity / Hardhat
```

## Prerequisites

- Node.js **20+**
- **pnpm** 9+ (`npm install -g pnpm`)
- Python **3.11+** (for AI service)
- PostgreSQL 16 (local or Docker)

## Setup

```bash
# 1. Clone / open the repo
cd BlueChain-ds

# 2. Copy env (already created as .env for local dev)
cp .env.example .env

# 3. Install JS dependencies
pnpm install

# 4. Build shared package
pnpm build:shared

# 5. Generate Prisma client
pnpm db:generate

# 6. (Optional) Start Postgres with Docker, then push schema
docker compose up -d postgres
pnpm db:push

# 7. (Optional) AI service venv
cd apps/ai
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate
pip install -r requirements.txt
cd ../..
```

## Run (development)

Open **three terminals** (or use the combined scripts):

### Frontend (http://localhost:3000)

```bash
pnpm dev:web
```

### API (http://localhost:4000)

```bash
pnpm dev:api
```

Health check: [http://localhost:4000/v1/health](http://localhost:4000/v1/health)

### AI stub (http://localhost:8000)

```bash
cd apps/ai
# activate venv first
pnpm --filter @bluechain/ai dev
# or: uvicorn app.main:app --reload --port 8000
```

Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Web + API together

```bash
pnpm dev
```

## Useful routes

| URL | Description |
|-----|-------------|
| `/` | Landing |
| `/registry`, `/map`, `/docs` | Public pages |
| `/login`, `/register` | Auth shells |
| `/field`, `/ngo`, `/verifier`, `/admin`, `/buyer`, `/super` | Role dashboards |

## Phase 2 — Authentication

JWT-based auth with bcrypt password hashing, role-based access, and Prisma/PostgreSQL persistence.

### API endpoints (`http://localhost:4000/v1/auth`)

| Method | Route | Auth | Body |
|--------|-------|------|------|
| POST | `/register` | public | `{ name, email, password, role? }` |
| POST | `/login` | public | `{ email, password }` |
| GET | `/me` | Bearer token | — |

`register` and `login` return `{ token, user }`. Send the token as `Authorization: Bearer <token>` on protected routes.

Roles (from the `Role` enum): `SUPER_ADMIN`, `NCCR_ADMIN` (Government), `NGO_MANAGER` (NGO), `FIELD_WORKER` (Field Officer), `VERIFIER`, `CORPORATE_BUYER` (Buyer). Guard routes with the `authorize(...roles)` middleware after `authenticate`.

### Database migration

```bash
# Prisma reads DATABASE_URL from apps/api/.env (or export it inline).
cp .env apps/api/.env        # or set DATABASE_URL for the api workspace
pnpm --filter @bluechain/api exec prisma migrate deploy   # apply existing migrations
# For local dev iterations:
pnpm db:migrate              # prisma migrate dev
```

The initial migration lives at `apps/api/prisma/migrations/`.

### Frontend

`/login` and `/register` are wired to the API via `lib/auth-context.tsx`. On success the JWT is stored client-side and the user is redirected to their role dashboard (`/super`, `/admin`, `/ngo`, `/field`, `/verifier`, `/buyer`).

## Phase 1 scope

Foundation only: structure, design system, themes, layouts, routing, Docker/env, Prisma schema, API health, AI stubs, Solidity placeholders.

**Not included yet:** auth, MRV business logic, blockchain txs, AI models, GIS maps.
