# Journal de décisions

Décisions structurantes prises au fil du projet, avec leur justification. Voir aussi
`docs/project-brief.md` pour le contexte complet et `CLAUDE.md` pour les conventions qui en
découlent.

## 2026-08-27 — Bootstrap du monorepo (M0)

- **Lint/format : Biome.** Un seul outil plutôt qu'ESLint+Prettier — config minimale, plus
  simple à documenter pour un agent.
- **Orchestration monorepo : pnpm workspaces seul.** Pas de Turborepo/Nx tant qu'un besoin
  concret de cache/orchestration n'apparaît pas.
- **Base de données : toujours une branche Neon**, y compris en local (branche personnelle
  dédiée) — pas de Postgres via Docker.
- **Driver DB : `postgres` (postgres.js)**, pas `@neondatabase/serverless` — l'API tourne en
  conteneur persistant sur Fly.io, pas en edge runtime ; une connexion TCP classique contre
  l'endpoint pooled de Neon est plus simple et a un coût par requête plus faible.
- **Validation d'environnement : zod**, pas `@fastify/env` — évite une surface de config
  JSON-schema supplémentaire, réutilise une dépendance déjà nécessaire à `packages/contracts`.
- **Test runner : Vitest** pour tout le monorepo — partage le pipeline Vite côté frontend,
  s'intègre nativement avec `app.inject()` côté Fastify.
- **`packages/domain` non créé pour l'instant** — aucun contenu concret avant le ledger/
  position engine (M7). Créer un package vide serait une abstraction prématurée.
- **Authentification : OAuth via une lib dédiée (Auth.js recommandé), différée après le
  vertical slice `/health`** — `/health` n'expose aucune donnée sensible, pas besoin de
  bloquer le pipeline CI/CD sur l'auth pour le valider.
- **Previews Vercel pilotées depuis GitHub Actions** (CLI `vercel`) plutôt que l'intégration
  Git native — évite la course entre le déploiement Vercel et la disponibilité de l'URL API
  Fly par-PR, et évite de devoir faire varier une env var par PR dans le dashboard Vercel.
- **Neon branch et Fly app par PR** via `neondatabase/create-branch-action` et un
  `flyctl deploy` sur une app nommée dynamiquement (`api-pr-N`) — pas d'équivalent "review
  apps" natif sur Fly, donc c'est déjà l'option la plus simple disponible.
