# CLAUDE.md

## 1. Objet du projet

Tracker de portefeuille crypto en lecture seule (OKX + import d'historique multi-exchanges).
L'objectif **premier** du projet est pédagogique : apprendre un workflow de développement
agentique complet avec Claude Code (terminal-first, CI/CD, preview environments par PR,
observabilité, code review IA) — pas seulement livrer le produit. Contexte complet dans
`docs/project-brief.md`.

## 2. Architecture

```
Browser
   → React SPA (Vite, TanStack Router, TanStack Query)   apps/web
   → HTTPS
   → Node.js API (Fastify)                                apps/api
        → PostgreSQL / Neon (via Drizzle)                 packages/db
        → OKX API (pas encore implémenté)
```

Monorepo pnpm, sans Turborepo/Nx (pas de besoin réel identifié pour l'instant).

```
apps/
  web/           # SPA React — parle uniquement à apps/api via VITE_API_URL
  api/           # Fastify — seul point d'accès à Neon et (plus tard) OKX
packages/
  db/            # schéma Drizzle, client, migrations — source unique de vérité DB
  contracts/     # schémas zod partagés au travers de la frontière API ↔ web
  config/        # tsconfig de base + loader d'env (zod) partagé
```

`packages/domain` n'existe pas encore : il sera créé quand la première règle métier
(ledger/position engine, M7) aura besoin d'un endroit où vivre — pas avant.

Flux d'une requête `/health` : `apps/web` appelle `GET {VITE_API_URL}/health` →
`apps/api` fait un `select 1` via `packages/db` → répond `{status, database, environment, commit}`
conforme à `packages/contracts`.

## 3. Commandes clés

Depuis la racine (fan-out sur tous les workspaces) :

| Commande | Effet |
|---|---|
| `pnpm install` | installe toutes les dépendances du monorepo |
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

## 4. Conventions

- TypeScript strict partout (`packages/config/tsconfig.base.json` — `strict`,
  `noUncheckedIndexedAccess`, etc.), chaque workspace l'étend.
- **Biome** est le seul outil de lint/format (pas d'ESLint, pas de Prettier, pas d'oxlint).
- `packages/db`, `packages/contracts`, `packages/config`, `apps/api` utilisent
  `module: NodeNext` → imports relatifs avec l'extension `.js` (même en TypeScript).
  `apps/web` utilise `moduleResolution: bundler` → imports relatifs sans extension.
- Un commit = une étape logique. Messages à l'impératif, concis.

## 5. Règles Git

- Pas de push direct sur `main` une fois la protection de branche activée (M1) — passer par
  une PR.
- Ne jamais forcer un push ou réécrire l'historique d'une branche partagée.
- Une branche par changement fonctionnel.

## 6. Stratégie de tests

- **Vitest** partout (front et back) — un seul runner pour tout le monorepo.
- Tests colocalisés avec le code (`*.test.ts` / `*.test.tsx` à côté du fichier testé).
- Tests API : toujours via `app.inject()` (cf. `apps/api/src/app.ts`, fonction `buildApp`),
  jamais contre un serveur réellement démarré.
- Un test ne doit **jamais** dépendre d'une vraie branche Neon accessible en CI classique
  (`ci.yml` n'a pas de DB) — une DB injoignable doit produire une réponse applicative
  valide (`database: "disconnected"`), pas un crash. Les tests contre une vraie branche Neon
  n'existent que dans le contexte `preview.yml` (M3).

## 7. Base de données & migrations

- Toujours passer par le schéma Drizzle dans `packages/db/src/schema.ts`.
- Après tout changement de schéma : `pnpm --filter @repo/db db:generate` pour créer la
  migration, jamais de modification manuelle d'une base.
- Ne jamais toucher la branche Neon `main`/production directement — toujours via une
  branche de preview ou une branche personnelle de dev.

## 8. Environnement & secrets

- `.env.example` (racine) est la source de vérité des variables requises — toujours le
  tenir à jour quand une variable est ajoutée/retirée.
- Ne jamais committer de secret réel.
- Les clés OKX (réservées, pas encore utilisées) sont strictement lecture seule, ne
  transitent jamais par le frontend, et ne vivent que côté API/Fly.

## 9. Avant / après une modification

Avant :
- comprendre le domaine concerné ;
- inspecter les implémentations existantes ;
- identifier les tests concernés.

Après :
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build` si pertinent

## 10. Milestone courant

**M0 — Bootstrap** (en cours). Roadmap complète : `docs/project-brief.md` section 15.
Ne pas anticiper les milestones suivants sans instruction explicite.

## 11. Hors scope pour l'instant

Ne pas implémenter sans qu'on en discute d'abord :
- authentification (prévue après le vertical slice `/health`, cf. `docs/decisions.md`) ;
- intégration OKX (M8) ;
- modèle de domaine / ledger / position engine (M7) ;
- Redis, queues, workers (M10, seulement si un besoin réel apparaît).
