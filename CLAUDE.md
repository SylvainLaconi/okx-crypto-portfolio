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
- Avant de créer une branche (étape 4 du workflow Linear, section 12), toujours synchroniser
  `main` local avec `origin/main` (`git fetch` + fast-forward) et brancher depuis cette base
  à jour.
- Si une branche se retrouve quand même en retard sur `main` (autre PR mergée entre-temps),
  la remettre à jour avec `git merge origin/main` — jamais de rebase ni de force-push.

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
- pour une feature (pas un fix trivial), passer par le cadrage puis la création du ticket
  Linear — voir section 12 ;
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

## 12. Intégration Linear

Chaque feature suit un cycle **cadrage → ticket → implémentation**. Un fix trivial (typo,
config mineure, dépendance) n'a pas besoin de ce cycle.

1. **Cadrage.** On échange librement sur l'idée jusqu'à couvrir : objectif, comportement
   attendu, architecture envisagée, cas limites, critères d'acceptation.
2. **Validation.** Une fois le cadrage suffisant, je demande confirmation avant de créer
   le ticket ("OK pour créer le ticket ?") — je ne crée jamais de ticket sans cette
   confirmation explicite.
3. **Création du ticket.** Équipe Linear `OKX Portfolio`, projet `OKX Portfolio`. Le ticket
   contient :
   - un titre court et actionnable ;
   - une description structurée : Contexte / Critères d'acceptation / Principaux choix
     techniques ;
   - le label `Feature`, `Improvement` ou `Bug` selon la nature ;
   - le statut initial `Todo`.

   Je ne commence pas l'implémentation à ce stade.
4. **Démarrage.** Tu m'indiques le code du ticket (ex. `OKX-12`). Je récupère son
   `gitBranchName` Linear, crée la branche locale correspondante, puis passe le ticket en
   `In Progress` — avant toute modification.
5. **Cadrage technique.** J'analyse le code concerné puis passe en Plan Mode pour cadrer
   techniquement la feature. Aucun fichier n'est encore modifié à ce stade.
6. **Implémentation.** Une fois le plan validé, j'implémente conformément à ce plan et
   lance lint/typecheck/tests pertinents. Je ne commit rien à ce stade.
7. **Auto-review.** Je review le code modifié : bugs, régressions, cas limites, problèmes
   d'architecture, tests manquants. Je ne modifie rien à cette étape. S'il y a des points à
   corriger, on les valide ensemble un par un, je corrige, puis je relance l'auto-review —
   et ainsi de suite jusqu'à ce qu'il n'y ait plus rien à traiter.
8. **Commit & push.** Une fois que tu as toi-même reviewé les modifications et qu'il n'y a
   plus rien à traiter, je commit en référençant l'identifiant du ticket (ex. `OKX-12`)
   dans le message de commit et la description de la PR, je push la branche sur GitHub, et
   je synchronise le ticket Linear (lien vers la branche/PR).
9. **Preview / QA.** Une fois la PR ouverte et l'environnement de preview déployé (branche
   Neon + API Fly.io + frontend Vercel, cf. M3), le ticket passe automatiquement en `QA`
   via une GitHub Action — c'est la fenêtre de validation manuelle de la preview avant merge.
10. **Merge.** Une fois la PR mergée dans `main`, le ticket passe en `Done` automatiquement
    et l'environnement de preview est détruit (branche Neon, app Fly, déploiement Vercel) —
    automatisation mise en place en M1 (transition de statut) et M3 (déploiement/cleanup
    preview). Je n'interviens plus manuellement à ces deux étapes.

Pas de milestones Linear pour l'instant (pas de besoin réel identifié) — le projet
`OKX Portfolio` reste plat.
