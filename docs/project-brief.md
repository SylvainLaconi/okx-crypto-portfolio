# Crypto Portfolio Tracker

## 1. Objectif du projet

Construire une application personnelle de suivi et d'analyse d'un portefeuille crypto.

L'objectif fonctionnel est d'avoir une vision fiable de mes investissements, notamment :

- valeur actuelle du portefeuille ;
- quantité détenue par actif ;
- coût d'acquisition ;
- prix de revient moyen ;
- plus-values et moins-values réalisées ;
- plus-values et moins-values latentes ;
- historique des transactions ;
- évolution de la valeur du portefeuille.

L'application sera dans un premier temps strictement en lecture. Aucun ordre d'achat, de vente ou de retrait ne devra pouvoir être exécuté depuis l'application.

## 2. Objectif principal du projet

La réalisation fonctionnelle de l'application n'est pas le seul objectif, ni même nécessairement le principal.

Ce projet doit surtout servir de terrain d'apprentissage pour :

1. apprendre sérieusement à utiliser Claude Code comme outil principal de développement ;
2. travailler principalement depuis le terminal et adopter un workflow agentique ;
3. concevoir une codebase facilement compréhensible et manipulable par des agents IA ;
4. construire une CI/CD complète avec GitHub Actions ;
5. mettre en place des environnements de preview éphémères par Pull Request ;
6. créer une branche PostgreSQL Neon dédiée à chaque Pull Request ;
7. automatiser les migrations, déploiements et nettoyages ;
8. intégrer de la code review assistée par IA ;
9. mettre en place des tests automatisés ;
10. introduire de l'observabilité dès le début du projet ;
11. expérimenter progressivement des problématiques de cache, temps réel, WebSocket et workers.

L'infrastructure fait donc partie intégrante du projet et doit être construite avant les fonctionnalités métier complexes.

---

# 3. Architecture cible

Le projet doit utiliser une séparation claire entre frontend et backend.

```text
Browser
   │
   ↓
React SPA
Vite
TanStack Router
TanStack Query
   │
   │ HTTPS
   ↓
Node.js API
Fastify
   │
   ├── PostgreSQL / Neon
   │
   ├── Redis si nécessaire
   │
   └── OKX API
       REST + WebSocket
```

## Monorepo

Utiliser un monorepo, idéalement avec `pnpm`.

Structure envisagée :

```text
apps/
  web/
  api/

packages/
  domain/
  db/
  contracts/
  config/

docs/
```

La structure exacte pourra évoluer si une meilleure organisation apparaît pendant la conception.

---

# 4. Stack technique initiale

## Frontend

- React
- TypeScript
- Vite
- TanStack Router
- TanStack Query

Le frontend doit rester une SPA.

Next.js n'est volontairement pas utilisé.

L'objectif est notamment de conserver une séparation explicite entre frontend et backend et de travailler davantage les problématiques d'infrastructure.

## Backend

- Node.js
- TypeScript
- Fastify

Le backend sera responsable :

- de l'accès à PostgreSQL ;
- des calculs métier ;
- de l'intégration avec OKX ;
- de la conservation des secrets ;
- des éventuelles connexions WebSocket vers OKX ;
- du cache et des traitements asynchrones si nécessaire.

## Base de données

- PostgreSQL
- Neon
- Drizzle ORM

Neon doit notamment permettre d'avoir une branche de base de données isolée pour chaque environnement de Pull Request.

## Hébergement

Frontend :

```text
Vercel
```

Backend :

```text
Fly.io
```

Base de données :

```text
Neon
```

## Infrastructure

- GitHub
- GitHub Actions
- Vercel Preview Deployments
- Fly.io
- Neon branches
- CI automatisée
- CD automatisée

---

# 5. Workflow Pull Request souhaité

Chaque Pull Request doit disposer autant que possible d'un environnement complet et isolé.

Exemple :

```text
feature/foo
    ↓
Pull Request #42
    ↓
GitHub Actions
    │
    ├── lint
    ├── typecheck
    ├── tests
    ├── build
    ├── AI code review
    │
    ├── Neon branch pr-42
    │
    ├── migrations DB
    │
    ├── Fly.io API preview
    │
    └── Vercel web preview
```

Le frontend de preview doit utiliser l'API correspondant à cette PR.

L'API de preview doit elle-même utiliser la branche Neon correspondant à cette PR.

Conceptuellement :

```text
web-pr-42
    ↓
api-pr-42
    ↓
neon/pr-42
```

À la fermeture ou au merge de la Pull Request :

```text
PR closed
   ↓
cleanup
   ├── environnement API preview
   ├── ressources spécifiques à la PR
   └── branche Neon
```

Le workflow doit être aussi automatisé et reproductible que possible.

---

# 6. CI

La CI doit être présente très tôt dans le projet.

Minimum attendu :

```text
lint
typecheck
unit tests
build
```

Puis progressivement :

```text
integration tests
database tests
E2E tests
AI-assisted code review
```

Les Pull Requests ne doivent idéalement pas pouvoir être mergées lorsque des checks essentiels échouent.

Les workflows GitHub Actions doivent être conçus proprement :

- permissions minimales ;
- gestion correcte des secrets ;
- cache lorsque pertinent ;
- cancellation des workflows obsolètes ;
- séparation claire des jobs ;
- logs exploitables.

---

# 7. Claude Code

Claude Code doit être utilisé comme outil principal pour développer ce projet.

Le projet doit lui-même être conçu pour faciliter le travail des agents.

Un `CLAUDE.md` devra documenter notamment :

- architecture du projet ;
- commandes principales ;
- conventions ;
- règles de développement ;
- règles Git ;
- stratégie de tests ;
- architecture de la base de données ;
- comportement attendu avant et après une modification.

Exemple de principes :

```text
Avant une modification :
- comprendre le domaine concerné ;
- inspecter les implémentations existantes ;
- identifier les tests concernés.

Après une modification :
- lint ;
- typecheck ;
- tests ;
- vérifier le build si pertinent.

Modification DB :
- passer par le schéma Drizzle ;
- créer une migration ;
- ne jamais modifier directement une DB de production.
```

Le projet pourra progressivement expérimenter :

- subagents ;
- hooks ;
- commandes Claude Code ;
- MCP ;
- GitHub integration ;
- génération ou amélioration automatique de tests ;
- analyse des erreurs de CI ;
- code review par IA.

Le but n'est pas simplement de générer du code avec Claude.

Le but est d'apprendre à construire un workflow de développement réellement AI-native.

---

# 8. Observabilité

L'observabilité doit être introduite tôt.

Minimum souhaité :

- gestion structurée des erreurs ;
- logs structurés ;
- distinction claire entre local, preview et production ;
- identification du commit / de la version déployée ;
- visibilité sur les erreurs frontend et backend.

Possibilités à étudier :

- Sentry ;
- OpenTelemetry ;
- logging structuré côté API.

Éviter néanmoins d'introduire une infrastructure disproportionnée au besoin.

---

# 9. Sécurité

Même si l'application est en lecture seule, les données sont privées.

Elles pourront révéler :

- valeur du patrimoine crypto ;
- actifs détenus ;
- quantités ;
- historique ;
- prix d'achat ;
- performances.

Une authentification légère devra donc être mise en place.

Il n'est pas nécessaire de construire un système complexe de gestion des utilisateurs.

Cas initial :

```text
1 utilisateur
```

Une authentification simple via un provider externe peut suffire.

Les secrets OKX ne doivent jamais être exposés au frontend.

Architecture obligatoire :

```text
React
  ↓
API
  ↓
OKX
```

et jamais :

```text
React
  ↓
OKX authenticated API
```

La clé API OKX utilisée devra être strictement en lecture seule.

Aucun droit de trading ou de retrait ne devra être nécessaire.

---

# 10. Données historiques

Je dispose déjà d'un historique de transactions crypto provenant de plusieurs plateformes.

Exemples :

- OKX ;
- Binance ;
- Kraken ;
- Bitget ;
- eToro ;
- autres plateformes utilisées historiquement.

Ces transactions sont aujourd'hui centralisées dans une base Retool.

Cette donnée pourra être importée dans PostgreSQL afin de constituer le ledger historique.

---

# 11. Modèle métier principal

Le cœur fonctionnel du projet est la reconstruction fiable du portefeuille à partir des transactions.

Il faut distinguer trois couches.

## Ledger

Source historique de vérité.

Exemple conceptuel :

```text
Transaction
- id
- exchange
- asset
- transactionType
- quantity
- price
- quoteCurrency
- fee
- timestamp
- externalId
```

Le modèle exact devra être conçu avant implémentation.

## Position engine

À partir du ledger, calculer pour chaque actif :

```text
quantity
average acquisition price
remaining cost basis
realized P&L
unrealized P&L
total P&L
```

Les règles exactes de valorisation devront être définies explicitement.

Il faudra notamment décider comment traiter :

- ventes partielles ;
- rachats après vente ;
- frais ;
- transferts ;
- conversions ;
- opérations entre exchanges ;
- méthode de calcul du coût de revient.

Cette logique doit être indépendante de l'interface et très fortement testée.

## Market data

Les données live seront récupérées principalement via OKX.

À terme :

```text
historical ledger
       +
position engine
       +
live market data
       =
current portfolio state
```

---

# 12. Intégration OKX

L'intégration doit se faire progressivement.

Première étape :

```text
OKX REST API
```

Objectifs :

- balances ;
- actifs ;
- prix ;
- éventuellement historique récent ;
- réconciliation avec les données internes.

Deuxième étape :

```text
OKX WebSocket
```

Pour expérimenter :

- données temps réel ;
- événements ;
- synchronisation ;
- reconnexion ;
- gestion des erreurs ;
- mise à jour du frontend.

---

# 13. Redis et traitements asynchrones

Redis ne doit pas être ajouté uniquement pour pouvoir dire que le projet utilise Redis.

Il pourra être introduit lorsqu'un besoin concret apparaît.

Cas possibles :

- cache des cours ;
- cache de données calculées ;
- rate limiting ;
- coordination entre instances ;
- pub/sub ;
- jobs asynchrones ;
- traitement de données ;
- synchronisation avec OKX.

Même principe pour les queues et workers.

Ils doivent répondre à une problématique identifiée.

---

# 14. Premier vertical slice

Avant de développer le domaine crypto, construire un flux extrêmement simple permettant de valider toute l'infrastructure.

Exemple :

```text
GET /health
```

Réponse :

```json
{
  "status": "ok",
  "database": "connected",
  "environment": "preview",
  "commit": "abc123"
}
```

Cette feature doit idéalement permettre de tester toute la chaîne :

```text
Claude Code
↓
code
↓
commit
↓
push
↓
Pull Request
↓
CI
↓
Neon branch
↓
Fly API preview
↓
Vercel frontend preview
↓
observabilité
↓
AI review
↓
merge
↓
production
↓
cleanup
```

Une fois cette chaîne fonctionnelle, commencer réellement les fonctionnalités métier.

---

# 15. Roadmap initiale

## M0 - Bootstrap

- repository ;
- monorepo ;
- React/Vite ;
- Fastify ;
- TypeScript ;
- pnpm ;
- Claude Code ;
- `CLAUDE.md` ;
- conventions.

## M1 - CI

- lint ;
- typecheck ;
- tests ;
- builds ;
- GitHub branch protections.

## M2 - Infrastructure

- Neon ;
- Vercel ;
- Fly.io ;
- environnements ;
- gestion des secrets.

## M3 - Preview environments

Pour chaque PR :

- branche Neon ;
- API preview ;
- frontend preview ;
- migrations ;
- cleanup automatique.

## M4 - Quality & AI

- tests ;
- code review automatisée ;
- Claude Code / GitHub ;
- amélioration du workflow agentique.

## M5 - Observabilité

- logs ;
- erreurs ;
- environnement ;
- commit/version ;
- monitoring minimum.

## M6 - Premier vertical slice

- `/health` ;
- connexion DB ;
- affichage frontend ;
- validation complète du pipeline.

## M7 - Ledger crypto

- modèle de données ;
- import historique ;
- transaction normalization ;
- moteur de positions ;
- tests métier.

## M8 - OKX

- REST API ;
- synchronisation ;
- balances ;
- prix.

## M9 - Temps réel

- WebSocket ;
- mises à jour live ;
- gestion des reconnexions.

## M10 - Infrastructure avancée

Selon les besoins rencontrés :

- Redis ;
- queues ;
- workers ;
- cache ;
- tracing ;
- optimisations.

---

# 16. Principes du projet

1. Comprendre avant d'automatiser.
2. L'infrastructure est un objectif du projet, pas une tâche annexe.
3. Chaque technologie doit répondre à un besoin réel ou à un objectif pédagogique explicite.
4. Préférer une architecture simple mais clairement séparée.
5. Automatiser tout ce qui doit être reproductible.
6. Tester fortement la logique métier financière.
7. Les données financières doivent rester privées.
8. Les secrets ne doivent jamais atteindre le navigateur.
9. Les environnements de preview doivent être réellement isolés.
10. Utiliser Claude Code pour apprendre à travailler avec des agents, pas simplement pour générer plus rapidement du code.
11. Documenter les décisions importantes au fur et à mesure.
12. Ne pas surarchitecturer prématurément le domaine fonctionnel.
13. En revanche, prendre volontairement au sérieux CI/CD, environnements, observabilité et qualité, car ils constituent une partie centrale de l'objectif pédagogique.

# 17. Première mission pour Claude Code

Commencer par analyser ce brief puis proposer, sans encore implémenter l'ensemble du produit :

1. une architecture précise du monorepo ;
2. les dépendances initiales ;
3. la stratégie locale / preview / production ;
4. la stratégie de variables d'environnement et secrets ;
5. le workflow GitHub / Neon / Fly.io / Vercel ;
6. la structure initiale du `CLAUDE.md` ;
7. un plan d'implémentation permettant d'atteindre le premier vertical slice `/health`.

Les choix doivent être expliqués et challengés lorsqu'une solution plus simple, plus robuste ou plus pédagogique paraît préférable.