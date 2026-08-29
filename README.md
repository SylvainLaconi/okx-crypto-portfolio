# OKX Crypto Portfolio

Tracker de portefeuille crypto en lecture seule (OKX + import d'historique multi-exchanges).

L'objectif **premier** de ce projet est pédagogique : apprendre un workflow de
développement agentique complet avec Claude Code (terminal-first, CI/CD, environnements
de preview par PR, observabilité, code review IA) — pas seulement livrer le produit.
Contexte complet dans [`docs/project-brief.md`](docs/project-brief.md), décisions
structurantes dans [`docs/decisions.md`](docs/decisions.md), conventions de développement
dans [`CLAUDE.md`](CLAUDE.md).

> **Statut : M0 — Bootstrap** (en cours). Application en lecture seule uniquement — aucun
> ordre d'achat, de vente ou de retrait ne peut être exécuté depuis l'application.

## Architecture

```
Browser
   → React SPA (Vite, TanStack Router, TanStack Query)   apps/web
   → HTTPS
   → Node.js API (Fastify)                                apps/api
        → PostgreSQL / Neon (via Drizzle)                 packages/db
        → OKX API (pas encore implémenté)
```

Monorepo pnpm, sans Turborepo/Nx.

```
apps/
  web/           # SPA React — parle uniquement à apps/api via VITE_API_URL
  api/           # Fastify — seul point d'accès à Neon et (plus tard) OKX
packages/
  db/            # schéma Drizzle, client, migrations — source unique de vérité DB
  contracts/     # schémas zod partagés au travers de la frontière API ↔ web
  config/        # tsconfig de base + loader d'env (zod) partagé
docs/
  project-brief.md  # contexte, objectifs, roadmap complète
  decisions.md       # journal des décisions structurantes
```

## Prérequis

- Node.js ≥ 24
- pnpm (`packageManager` défini dans `package.json`)
- Une base PostgreSQL Neon (branche personnelle en local — jamais `main`/production)

## Installation

```bash
pnpm install
cp .env.example .env   # puis renseigner DATABASE_URL avec ta branche Neon personnelle
```

`.env.example` est la source de vérité des variables requises.

## Commandes

Depuis la racine (fan-out sur tous les workspaces) :

| Commande | Effet |
|---|---|
| `pnpm dev` | lance `apps/web` + `apps/api` en parallèle |
| `pnpm lint` | Biome — vérifie lint + format |
| `pnpm lint:fix` | Biome — corrige lint + format |
| `pnpm typecheck` | `tsc --noEmit` dans chaque workspace |
| `pnpm test` | Vitest dans chaque workspace |
| `pnpm build` | build de chaque workspace |

Ciblé sur un workspace avec `--filter` :

| Commande | Effet |
|---|---|
| `pnpm --filter @repo/api dev` | API seule (`tsx watch`, port 3001) |
| `pnpm --filter @repo/web dev` | web seul (`vite`, port 5173) |
| `pnpm --filter @repo/db db:generate` | génère une migration Drizzle depuis `schema.ts` |
| `pnpm --filter @repo/db db:migrate` | applique les migrations sur `DATABASE_URL` |

## Stack technique

- **Frontend** : React, TypeScript, Vite, TanStack Router, TanStack Query
- **Backend** : Node.js, TypeScript, Fastify
- **Base de données** : PostgreSQL (Neon), Drizzle ORM
- **Lint/format** : Biome (seul outil, pas d'ESLint/Prettier)
- **Tests** : Vitest partout, colocalisés avec le code

## Conventions

Voir [`CLAUDE.md`](CLAUDE.md) pour le détail complet (TypeScript strict, imports NodeNext
avec extension `.js` côté back, stratégie de tests, règles Git, workflow Linear, etc.).

## Roadmap

Roadmap complète en 10 milestones (M0 à M10) dans
[`docs/project-brief.md`](docs/project-brief.md#15-roadmap-initiale). Milestone courant :
**M0 — Bootstrap**.
