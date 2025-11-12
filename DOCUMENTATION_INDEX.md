# 📚 Documentation complète - HistoRando Backend

## 🎯 Guide de démarrage rapide

Bienvenue dans la documentation complète du backend HistoRando ! Ce document vous guide à travers toutes les ressources disponibles.

---

## 📂 Index des documents

### 1. **POSTGRESQL_SETUP_GUIDE.md** 🗄️

**Objectif** : Configuration complète de PostgreSQL

**Contenu** :

- ✅ Réinitialiser le mot de passe PostgreSQL
- ✅ Créer un nouvel utilisateur et base de données
- ✅ Scripts automatisés pour setup rapide
- ✅ Configuration des fichiers .env et .env.test
- ✅ Résolution des problèmes courants
- ✅ Commandes PostgreSQL utiles
- ✅ Alternative avec Docker

**À lire en premier si** : Vous avez oublié vos identifiants PostgreSQL ou c'est votre première installation

---

### 2. **LOCAL_SETUP_GUIDE.md** 🚀

**Objectif** : Démarrer l'application localement

**Contenu** :

- ✅ Installation des dépendances
- ✅ Configuration des variables d'environnement
- ✅ Démarrage en mode développement et production
- ✅ Lancement des tests (E2E et unitaires)
- ✅ Accès à Swagger (documentation API interactive)
- ✅ Scripts npm disponibles
- ✅ Dépannage des erreurs courantes
- ✅ Structure du projet

**À lire après** : POSTGRESQL_SETUP_GUIDE.md

---

### 3. **POSTMAN_TESTING_GUIDE_PART1.md** 📮

**Objectif** : Tester l'API avec Postman - Partie 1

**Contenu** :

- ✅ Configuration initiale de Postman
- ✅ Variables d'environnement
- ✅ Authentification automatique du token
- ✅ **Module Authentification** :
  - Inscription (Register)
  - Connexion (Login)
  - Cas d'erreurs (401, 409, 400)
- ✅ **Module Utilisateurs** :
  - Récupérer mon profil
  - Obtenir mes statistiques
  - Mise à jour complète (PUT)
  - Mise à jour partielle (PATCH)

**À lire après** : LOCAL_SETUP_GUIDE.md (une fois l'app démarrée)

---

### 4. **POSTMAN_TESTING_GUIDE_PART2.md** 📮

**Objectif** : Tester l'API avec Postman - Partie 2

**Contenu** :

- ✅ **Module Parcours** :
  - Lister tous les parcours (public)
  - Filtres (difficulté, PMR, distance)
  - Recherche géolocalisée (nearby)
  - CRUD complet (Create, Read, Update, Delete)
- ✅ **Module POI (Points d'Intérêt)** :
  - Lister les POI d'un parcours
  - Obtenir un POI spécifique
  - Créer des POI (6 types différents)
  - CRUD complet
  - Exemples pour chaque type : bunker, memorial, museum, beach, monument, blockhaus

**À lire après** : POSTMAN_TESTING_GUIDE_PART1.md

---

### 5. **POSTMAN_TESTING_GUIDE_PART3.md** 📮 _(À venir)_

**Objectif** : Modules avancés

**Contenu prévu** :

- ✅ Activités utilisateur
- ✅ Visites de POI
- ✅ Quiz et questions
- ✅ Challenges
- ✅ Chasse aux trésors
- ✅ Récompenses
- ✅ Médias et podcasts
- ✅ Données historiques

---

## 🗺️ Parcours d'apprentissage recommandé

### Pour les débutants

```
1. POSTGRESQL_SETUP_GUIDE.md
   ↓
2. LOCAL_SETUP_GUIDE.md
   ↓
3. Démarrer l'app : npm run start:dev
   ↓
4. Ouvrir Swagger : http://localhost:3000/api/docs
   ↓
5. POSTMAN_TESTING_GUIDE_PART1.md
   ↓
6. POSTMAN_TESTING_GUIDE_PART2.md
   ↓
7. Expérimenter avec Postman !
```

### Pour les développeurs expérimentés

```
1. Lecture rapide de POSTGRESQL_SETUP_GUIDE.md
2. Configuration rapide (.env)
3. npm run start:dev
4. Exploration directe dans Swagger
5. Référence aux guides Postman si besoin
```

---

## 🎓 Concepts clés

### Architecture

```
HistoRando Backend
├── Modular Monolith (NestJS)
├── PostgreSQL + Sequelize ORM
├── Zod pour validation
├── JWT pour authentification
└── Swagger pour documentation
```

### Base URL

```
http://localhost:3000/api/v1
```

### Documentation interactive

```
http://localhost:3000/api/docs
```

### Authentification

- **Type** : JWT Bearer Token
- **Header** : `Authorization: Bearer <token>`
- **Expiration** : 7 jours (configurable)
- **Obtention** : POST /auth/login

### Endpoints publics vs protégés

**Publics** (pas d'authentification) :

- `POST /auth/register`
- `POST /auth/login`
- `GET /parcours`
- `GET /parcours/nearby`
- `GET /parcours/:id`
- `GET /poi/parcours/:parcoursId`
- `GET /poi/:id`

**Protégés** (token requis) :

- Tous les autres endpoints

---

## 🧪 Tests

### Tests E2E (End-to-End)

```bash
# Tous les tests (134 tests)
npm run test:e2e

# Test spécifique
npm run test:e2e -- auth.e2e-spec.ts

# Avec coverage
npm run test:e2e -- --coverage
```

**Résultat actuel** : ✅ 134/134 tests passing (100%)

**Modules testés** :

- ✅ Auth (5 tests)
- ✅ Users (5 tests)
- ✅ Parcours (6 tests)
- ✅ Parcours Full (17 tests)
- ✅ POI (7 tests)
- ✅ Activity (11 tests)
- ✅ Treasure Hunt (9 tests)
- ✅ Challenge (8 tests)
- ✅ Media (9 tests)
- ✅ Historical (12 tests)
- ✅ Quiz (11 tests)
- ✅ Reward (10 tests)

### Tests unitaires

```bash
npm test
```

---

## 📊 Modules disponibles

| Module            | Endpoints | Description                    |
| ----------------- | --------- | ------------------------------ |
| **Auth**          | 2         | Inscription, connexion         |
| **Users**         | 4         | Profils, stats, mise à jour    |
| **Parcours**      | 6         | CRUD, filtres, géolocalisation |
| **POI**           | 5         | Points d'intérêt historiques   |
| **Activity**      | 6         | Suivi des randonnées           |
| **Quiz**          | 8         | Quizzes éducatifs              |
| **Challenge**     | 6         | Défis physiques                |
| **Treasure Hunt** | 5         | Chasse aux trésors QR          |
| **Reward**        | 6         | Système de récompenses         |
| **Media**         | 5         | Podcasts et médias             |
| **Historical**    | 6         | Données historiques            |

**Total** : 59+ endpoints

---

## 🔧 Commandes essentielles

```bash
# Démarrage
npm run start:dev          # Mode développement
npm run start:prod         # Mode production

# Tests
npm run test:e2e           # Tests E2E
npm test                   # Tests unitaires

# Build
npm run build              # Compiler le projet

# Database
psql -U historando -d historando_db -h localhost

# Vérifier les logs
# Les logs s'affichent dans la console lors du démarrage
```

---

## 🚨 Problèmes courants et solutions

### 1. "Cannot connect to database"

**Solution** :

```bash
# Vérifier que PostgreSQL est démarré
sudo systemctl status postgresql
sudo systemctl start postgresql

# Tester la connexion
psql -U historando -d historando_db -h localhost
```

### 2. "Port 3000 already in use"

**Solution** :

```bash
# Trouver et tuer le processus
lsof -i :3000
kill -9 <PID>

# Ou changer le port dans .env
PORT=3001
```

### 3. "Token expired" dans Postman

**Solution** :

- Reconnectez-vous : `POST /auth/login`
- Le token sera automatiquement sauvegardé si vous avez ajouté le script Tests

### 4. Swagger affiche des schémas vides

**Solution** :

- ✅ **Corrigé !** Les DTOs ont maintenant des `@ApiProperty` decorators
- Redémarrez l'application : `npm run start:dev`
- Rechargez Swagger : `http://localhost:3000/api/docs`

---

## 📈 Statistiques du projet

### Code

- **Langage** : TypeScript
- **Framework** : NestJS 10.x
- **Base de données** : PostgreSQL 14+
- **ORM** : Sequelize 6.x
- **Validation** : Zod 3.x
- **Documentation** : Swagger/OpenAPI 3.x

### Tests

- **E2E Tests** : 134 tests ✅
- **Coverage** :
  - Statements: 88.27%
  - Branches: 51.42%
  - Functions: 72%
  - Lines: 87.3%

### Entités

- **20 tables PostgreSQL**
- **12 modules fonctionnels**
- **59+ endpoints API**

---

## 🎯 Checklist de démarrage

Avant de commencer à tester l'API :

- [ ] PostgreSQL installé et configuré
- [ ] Base de données `historando_db` créée
- [ ] Base de données `historando_test` créée
- [ ] Utilisateur PostgreSQL `historando` créé
- [ ] Fichier `.env` configuré
- [ ] Fichier `.env.test` configuré
- [ ] `npm install` exécuté
- [ ] Application démarre sans erreur (`npm run start:dev`)
- [ ] Swagger accessible (`http://localhost:3000/api/docs`)
- [ ] Tests E2E passent (`npm run test:e2e`)
- [ ] Postman configuré avec les variables d'environnement

---

## 🔐 Sécurité - Points importants

### En développement ✅

```env
CORS_ORIGIN=*
JWT_SECRET=simple-secret
DB_LOGGING=true
```

### En production ⚠️ À FAIRE

```env
CORS_ORIGIN=https://votre-domaine.com
JWT_SECRET=<générer une clé forte aléatoire>
DB_LOGGING=false
NODE_ENV=production
```

**Recommandations** :

- Utiliser HTTPS uniquement
- Activer les rate limits
- Configurer des migrations DB au lieu de sync auto
- Mettre en place un monitoring (logs, métriques)
- Sauvegardes régulières de la base de données

---

## 📞 Support et ressources

### Documentation interne

- `README.md` - Vue d'ensemble du projet
- `POSTGRESQL_SETUP_GUIDE.md` - Setup PostgreSQL
- `LOCAL_SETUP_GUIDE.md` - Démarrage local
- `POSTMAN_TESTING_GUIDE_PART1.md` - Tests Postman (Auth & Users)
- `POSTMAN_TESTING_GUIDE_PART2.md` - Tests Postman (Parcours & POI)

### Swagger Documentation

```
http://localhost:3000/api/docs
```

### Tests automatisés

```bash
# Voir tous les scénarios testés
npm run test:e2e -- --verbose
```

---

## 🎉 Prochaines étapes

1. ✅ Configurez PostgreSQL avec `POSTGRESQL_SETUP_GUIDE.md`
2. ✅ Démarrez l'application avec `LOCAL_SETUP_GUIDE.md`
3. ✅ Explorez Swagger : `http://localhost:3000/api/docs`
4. ✅ Testez avec Postman en suivant les guides
5. ✅ Lancez les tests E2E pour tout valider
6. 🚀 Commencez à développer votre frontend !

---

**Bon développement avec HistoRando Backend ! 🇫🇷**

_Transformer chaque randonnée en voyage dans l'histoire._
