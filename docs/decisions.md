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

## 2026-08-28 — Workflow Linear (ticket OKX-6)

- **Passage du ticket en `Done` automatisé via GitHub Action au merge de la PR**, plutôt que
  fait manuellement par l'agent — à mettre en place en M1 (CI). Le reste du cycle
  (cadrage → ticket → branche → implémentation → auto-review → commit/push) reste manuel,
  cf. `CLAUDE.md` section 12.
- **Nouveau statut d'équipe Linear `QA`** (catégorie *Started*, entre `In Progress` et
  `Done`) — représente "branche déployée en preview, en attente de validation". Une GitHub
  Action y bascule le ticket quand la preview (Neon + Fly + Vercel, M3) est déployée. Au
  merge de la PR, le ticket passe en `Done` **et** l'environnement de preview est détruit
  (branche Neon, app Fly, déploiement Vercel) — réutilise le cleanup déjà prévu en M3 sur
  `pull_request: closed` ; la transition `Done` ne doit se déclencher que si
  `github.event.pull_request.merged` est vrai (une fermeture sans merge ne doit pas
  marquer le ticket comme terminé).

## 2026-08-28 — CI et branch protections (M1, ticket OKX-7)

- **Architecture CI/CD cible à 4 workflows** (`pr-ci`, `pr-preview`, `production`,
  `pr-cleanup`), construite progressivement sur M1/M2/M3 plutôt que d'un coup : M1 n'introduit
  que `pr-ci.yml` (lint/typecheck/test/build) et l'automatisation Linear ; `production.yml`
  arrive en M2 avec l'infrastructure Neon/Fly/Vercel ; `pr-preview.yml`/`pr-cleanup.yml`
  arrivent en M3 avec les previews par PR. Éviter d'anticiper cette structure finale en M1
  pour ne pas construire des composants qui n'ont pas encore de cible réelle.
- **`pr-ci.yml` : 4 jobs indépendants** (`lint`, `typecheck`, `test`, `build`), pas de
  workflow réutilisable (`workflow_call`) pour l'instant — sera introduit en M2 quand
  `production.yml` devra réexécuter les mêmes vérifications avant de déployer en
  production, pour éviter la duplication.
- **`linear-sync.yml` : passage en `Done` via `issueVcsBranchSearch`.** Cette query
  GraphQL Linear est prévue précisément pour retrouver une issue à partir d'un nom de
  branche Git, sans avoir à parser l'identifiant depuis le nom de branche à la main.
  Nécessite un secret de repo `LINEAR_API_KEY` (clé API personnelle Linear).
- **Branch protection sur `main` sans review obligatoire.** Projet solo — un auteur ne
  peut pas approuver sa propre PR sur GitHub, donc exiger une review bloquerait tout
  merge. Seuls les 4 status checks de `pr-ci.yml` sont requis.
- **`enforce_admins: true`.** Aucune exception, y compris pour l'admin du repo (Sylvain) —
  cohérent avec la règle CLAUDE.md "pas de push direct sur `main`" sans échappatoire,
  volontairement strict pendant l'apprentissage du workflow.
- **Repo GitHub passé en public.** Ni les branch protections classiques ni les rulesets ne
  sont disponibles sur un repo privé avec le plan GitHub Free (`403 Upgrade to GitHub Pro`) —
  seule option gratuite pour les activer. Le repo ne contient aujourd'hui aucun secret ni
  donnée réelle (`.env` gitignoré, pas encore de ledger importé) ; à réévaluer avant
  l'import de données personnelles réelles (M7, cf. section 9 du brief sur la
  confidentialité).
