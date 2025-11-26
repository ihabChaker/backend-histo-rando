# HistoRando Backend API

Backend NestJS en architecture **Modular Monolith** pour l'application mobile HistoRando — randonnées historiques en Normandie.

## 🏗️ Architecture

- **Framework**: NestJS (TypeScript)
- **Base de données**: MySQL avec Sequelize ORM
- **Validation**: Zod schemas
- **Documentation API**: Swagger / OpenAPI
- **Authentification**: JWT Bearer tokens
- **CI/CD**: GitHub Actions with automated deployment gating

## 🚀 Deployment Status

[![CI Pipeline](https://github.com/ihabChaker/backend-histo-rando/actions/workflows/ci.yml/badge.svg)](https://github.com/ihabChaker/backend-histo-rando/actions/workflows/ci.yml)

**Automated CI/CD Workflow:**

```
main branch → CI Tests → ✓ Pass → Auto-merge to deploy → DigitalOcean Deploys
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for deployment instructions.

## 📋 Prérequis

- Node.js >= 20.x
- MySQL >= 8.0
- npm >= 10.x

## 🚀 Installation

### 1. Cloner le dépôt et installer les dépendances

```bash
cd backend
npm install
```

### 2. Configuration de l'environnement

Copier le fichier `.env.example` vers `.env` et ajuster les valeurs :

```bash
cp .env.example .env
```

Éditer `.env` :

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=historando
DB_PASSWORD=historando_password
DB_DATABASE=historando_db

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d

SWAGGER_ENABLED=true
SWAGGER_PATH=api/docs
```

### 3. Créer la base de données PostgreSQL

```bash
# Connexion à PostgreSQL
psql -U postgres

# Créer la base de données et l'utilisateur
CREATE DATABASE historando_db;
CREATE USER historando WITH ENCRYPTED PASSWORD 'historando_password';
GRANT ALL PRIVILEGES ON DATABASE historando_db TO historando;
\q
```

### 4. Synchroniser les tables (développement)

En développement, Sequelize peut créer automatiquement les tables au démarrage. Pour la production, utilisez les migrations.

### 5. Lancer l'application

```bash
# Mode développement avec hot-reload
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

L'API sera disponible sur `http://localhost:3000` et la documentation Swagger sur `http://localhost:3000/api/docs`.

## 📚 Structure du projet

```
backend/
├── src/
│   ├── main.ts                 # Point d'entrée de l'application
│   ├── app.module.ts            # Module principal
│   ├── config/
│   │   ├── configuration.ts     # Configuration globale
│   │   └── database.config.js   # Configuration Sequelize CLI
│   ├── database/
│   │   └── database.module.ts   # Module Sequelize
│   ├── common/
│   │   ├── decorators/          # Decorators personnalisés (@CurrentUser, @Public)
│   │   ├── guards/              # Guards d'authentification (JWT)
│   │   └── types/               # Types TypeScript communs
│   └── modules/
│       ├── auth/                # Authentification (login, register)
│       ├── users/               # Gestion des profils utilisateurs
│       ├── parcours/            # Parcours de randonnée
│       ├── poi/                 # Points d'intérêt historiques
│       ├── media/               # Podcasts et médias
│       ├── activity/            # Suivi des activités utilisateur
│       ├── quiz/                # Quizzes éducatifs
│       ├── challenge/           # Défis physiques
│       ├── treasure-hunt/       # Chasse aux trésors (QR codes)
│       ├── reward/              # Système de récompenses
│       └── historical/          # Données historiques (bataillons)
├── package.json
├── tsconfig.json
├── nest-cli.json
└── .env.example
```

## 🔐 Authentification

L'API utilise JWT pour l'authentification. Les endpoints publics sont marqués avec `@Public()`, tous les autres nécessitent un token Bearer.

### Inscription

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "isPmr": false
}
```

### Connexion

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

Réponse :

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "username": "johndoe"
  }
}
```

### Utiliser le token

Ajouter le header `Authorization` à chaque requête authentifiée :

```bash
GET /api/v1/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📖 Modules et Endpoints principaux

### 🔑 Auth (`/api/v1/auth`)

- `POST /register` — Inscription
- `POST /login` — Connexion

### 👤 Users (`/api/v1/users`)

- `GET /me` — Profil utilisateur connecté
- `GET /me/stats` — Statistiques (points, km)
- `PUT /me` — Mise à jour du profil
- `GET /:id` — Profil public d'un utilisateur

### 🥾 Parcours (`/api/v1/parcours`)

- `GET /` — Lister tous les parcours (filtres : difficulté, PMR, distance)
- `GET /nearby?lat=X&lon=Y&radius=50` — Parcours à proximité
- `GET /:id` — Détails d'un parcours (avec POI)
- `POST /` — Créer un parcours (admin)
- `PUT /:id` — Mettre à jour un parcours
- `DELETE /:id` — Supprimer un parcours

### 📍 POI (`/api/v1/poi`)

- `GET /parcours/:parcoursId` — Lister les POI d'un parcours
- `GET /:id` — Détails d'un POI
- `POST /` — Créer un POI
- `PUT /:id` — Mettre à jour un POI
- `DELETE /:id` — Supprimer un POI

### 🎧 Media, 🏃 Activity, 🧠 Quiz, 💪 Challenge, 🏆 Treasure Hunt, 🎁 Reward, 📜 Historical

Les modules sont définis avec leurs entités Sequelize. Les controllers et services CRUD peuvent être ajoutés selon les besoins.

## 📊 Swagger Documentation

La documentation complète de l'API est disponible via Swagger :

```
http://localhost:3000/api/docs
```

Swagger offre :

- Liste de tous les endpoints avec paramètres et schémas
- Essais interactifs (Try it out)
- Exemples de requêtes et réponses
- Authentification Bearer intégrée

## 🗄️ Base de données

### Entités principales

- **User** — Utilisateurs (profils, points, km cumulés)
- **Parcours** — Parcours de randonnée
- **PointOfInterest** — POI historiques (bunkers, mémoriaux)
- **Podcast** — Podcasts audio
- **Quiz, Question, Answer** — Quizzes éducatifs
- **Challenge** — Défis physiques
- **TreasureHunt** — Trésors à scanner (QR codes)
- **Reward** — Récompenses échangeables
- **UserActivity** — Sessions de randonnée
- **UserPOIVisit** — Visites de POI
- **UserQuizAttempt** — Tentatives de quiz
- **UserChallengeProgress** — Progression des challenges
- **UserTreasureFound** — Trésors trouvés
- **UserRewardRedeemed** — Récompenses réclamées
- **HistoricalBattalion, BattalionRoute** — Données historiques

### Migrations (recommandé pour production)

Pour créer une migration :

```bash
npm run migration:generate -- create-users-table
```

Appliquer les migrations :

```bash
npm run migration:run
```

Annuler la dernière migration :

```bash
npm run migration:revert
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Couverture de code
npm run test:cov
```

## 🏗️ Build et déploiement

```bash
# Build de production
npm run build

# Lancer en production
NODE_ENV=production npm run start:prod
```

### Docker (optionnel)

Créer un `Dockerfile` pour conteneuriser l'application :

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/main"]
```

## 🔧 Scripts utiles

```bash
npm run start:dev       # Développement avec hot-reload
npm run build           # Build de production
npm run format          # Formater le code avec Prettier
npm run lint            # Linter avec ESLint
```

## 🤝 Contribution

1. Créer une branche feature : `git checkout -b feature/ma-fonctionnalite`
2. Commit : `git commit -m "Ajout de ma fonctionnalité"`
3. Push : `git push origin feature/ma-fonctionnalite`
4. Ouvrir une Pull Request

## 📝 Licence

MIT

## 📧 Contact

Pour toute question, contacter l'équipe HistoRando.

---

**HistoRando Backend** — Transformer chaque randonnée en voyage dans l'histoire. 🇫🇷
