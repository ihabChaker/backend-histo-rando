# 🚀 Guide de démarrage local - HistoRando Backend

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- ✅ **Node.js** (version 18.x ou supérieure)
- ✅ **PostgreSQL** (version 14.x ou supérieure)
- ✅ **npm** ou **yarn**
- ✅ **Git**

---

## 📦 Installation étape par étape

### Étape 1 : Cloner le projet

```bash
cd /home/iheb/Desktop/projets/histo_rando
cd backend
```

### Étape 2 : Installer les dépendances

```bash
npm install
```

Cela installera toutes les dépendances nécessaires définies dans `package.json`.

**Durée estimée** : 2-3 minutes ⏱️

---

### Étape 3 : Configurer PostgreSQL

Référez-vous au fichier `POSTGRESQL_SETUP_GUIDE.md` pour :

1. Créer l'utilisateur PostgreSQL
2. Créer les bases de données (production et test)
3. Configurer les permissions

**Résumé rapide** :

```bash
sudo -u postgres psql
```

```sql
CREATE USER historando WITH PASSWORD 'historando_password_2024';
CREATE DATABASE historando_db OWNER historando;
CREATE DATABASE historando_test OWNER historando;
\q
```

---

### Étape 4 : Configurer les variables d'environnement

#### Créer le fichier `.env` pour la production/développement

```bash
cp .env.example .env
```

Éditez `.env` :

```bash
# Application
NODE_ENV=development
PORT=3000
APP_NAME=HistoRando API

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=historando
DB_PASSWORD=historando_password_2024
DB_DATABASE=historando_db
DB_LOGGING=true

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2024
JWT_EXPIRATION=7d

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIRECTORY=./uploads

# CORS
CORS_ORIGIN=*

# API Documentation
SWAGGER_ENABLED=true
SWAGGER_PATH=api/docs
```

#### Créer le fichier `.env.test` pour les tests

```bash
cat > .env.test << 'EOF'
NODE_ENV=test
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=historando
DB_PASSWORD=historando_password_2024
DB_DATABASE=historando_test
DB_LOGGING=false

JWT_SECRET=test-jwt-secret-key
JWT_EXPIRATION=1d

SWAGGER_ENABLED=false
EOF
```

---

### Étape 5 : Vérifier la configuration

```bash
# Tester la connexion à la base de données
psql -U historando -d historando_db -h localhost -c "SELECT version();"
```

Si vous voyez la version de PostgreSQL, c'est bon ! ✅

---

### Étape 6 : Démarrer l'application

#### Mode développement (avec hot-reload)

```bash
npm run start:dev
```

Vous devriez voir :

```
🔍 Database config: {
  host: 'localhost',
  port: 5432,
  username: 'historando',
  database: 'historando_db'
}
✅ Test database connection established successfully
✅ Test database synced (force: false)
🚀 HistoRando API is running on: http://localhost:3000
📚 Swagger docs available at: http://localhost:3000/api/docs
```

#### Mode production

```bash
# Build
npm run build

# Start
npm run start:prod
```

---

## 🧪 Lancer les tests

### Tests E2E (End-to-End)

```bash
# Tous les tests
npm run test:e2e

# Tests spécifiques
npm run test:e2e -- auth.e2e-spec.ts
npm run test:e2e -- users.e2e-spec.ts

# Avec coverage
npm run test:e2e -- --coverage
```

### Tests unitaires

```bash
# Tous les tests
npm test

# En mode watch
npm run test:watch

# Avec coverage
npm run test:cov
```

---

## 📚 Accéder à la documentation Swagger

Une fois l'application démarrée, ouvrez votre navigateur :

```
http://localhost:3000/api/docs
```

Vous verrez l'interface Swagger interactive avec :

- 📋 Liste complète des endpoints
- 🔐 Authentification Bearer Token intégrée
- 🧪 Interface "Try it out" pour tester les endpoints
- 📖 Schémas de requêtes/réponses avec exemples
- ✅ Validation en temps réel

---

## 🔍 Vérifier que tout fonctionne

### Test 1 : Health Check

```bash
curl http://localhost:3000/api/v1/
```

Attendu : Une réponse JSON ou un message de bienvenue

### Test 2 : Créer un utilisateur

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

Attendu : Réponse 201 avec les données de l'utilisateur

### Test 3 : Se connecter

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

Attendu : Réponse avec `access_token`

---

## 📊 Structure des endpoints

### Base URL

```
http://localhost:3000/api/v1
```

### Endpoints publics (sans authentification)

- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `GET /parcours` - Liste des parcours
- `GET /parcours/nearby` - Parcours à proximité
- `GET /parcours/:id` - Détails d'un parcours
- `GET /poi/parcours/:parcoursId` - POI d'un parcours
- `GET /poi/:id` - Détails d'un POI

### Endpoints protégés (nécessitent un token)

- Tous les autres endpoints nécessitent le header :
  ```
  Authorization: Bearer <votre_token>
  ```

---

## 🛠️ Scripts disponibles

```bash
# Développement
npm run start:dev         # Démarrer en mode dev avec hot-reload
npm run start:debug       # Démarrer en mode debug

# Build & Production
npm run build             # Compiler TypeScript → JavaScript
npm run start:prod        # Démarrer en mode production

# Tests
npm test                  # Tests unitaires
npm run test:watch        # Tests en mode watch
npm run test:cov          # Tests avec coverage
npm run test:e2e          # Tests E2E

# Code Quality
npm run lint              # Linter avec ESLint
npm run format            # Formater avec Prettier

# Database
npm run migration:generate -- --name my-migration
npm run migration:run     # Exécuter les migrations
npm run migration:revert  # Annuler la dernière migration
```

---

## 🐛 Dépannage

### Problème : Port 3000 déjà utilisé

```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 <PID>

# Ou utiliser un autre port dans .env
PORT=3001
```

### Problème : Base de données inaccessible

```bash
# Vérifier que PostgreSQL est démarré
sudo systemctl status postgresql

# Démarrer PostgreSQL si nécessaire
sudo systemctl start postgresql

# Tester la connexion
psql -U historando -d historando_db -h localhost
```

### Problème : Erreurs de synchronisation Sequelize

```bash
# Option 1: Supprimer et recréer la base
sudo -u postgres psql
DROP DATABASE historando_db;
CREATE DATABASE historando_db OWNER historando;
\q

# Option 2: Supprimer toutes les tables
psql -U historando -d historando_db
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO historando;
\q

# Redémarrer l'application
npm run start:dev
```

### Problème : Module not found

```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Problème : Les tests échouent

```bash
# Vérifier que la base de test existe
psql -U historando -d historando_test -c "SELECT 1;"

# Si elle n'existe pas
sudo -u postgres psql
CREATE DATABASE historando_test OWNER historando;
\q

# Relancer les tests
npm run test:e2e
```

---

## 📂 Fichiers importants

```
backend/
├── .env                    # Configuration production/dev (à créer)
├── .env.test              # Configuration test (à créer)
├── .env.example           # Template de configuration
├── package.json           # Dépendances et scripts
├── nest-cli.json          # Configuration NestJS
├── tsconfig.json          # Configuration TypeScript
├── src/
│   ├── main.ts           # Point d'entrée
│   ├── app.module.ts     # Module racine
│   ├── config/
│   │   └── configuration.ts
│   └── modules/          # Tous les modules métier
└── test/                 # Tests E2E
```

---

## 🔐 Sécurité

### En développement

- CORS autorisé pour tous les domaines (`CORS_ORIGIN=*`)
- JWT_SECRET simple acceptable
- DB_LOGGING=true pour debug

### En production (à faire)

- Changer `JWT_SECRET` en une valeur forte et aléatoire
- Configurer `CORS_ORIGIN` avec votre domaine frontend
- Mettre `DB_LOGGING=false`
- Utiliser HTTPS
- Configurer les rate limits
- Activer les migrations au lieu de sync auto

---

## 📈 Monitoring

### Logs de l'application

Les logs s'affichent dans la console en mode développement.

### Logs de la base de données

Si `DB_LOGGING=true`, toutes les requêtes SQL s'affichent dans la console.

### Performances

Surveillez les temps de réponse dans Swagger ou avec des outils comme Postman.

---

## 🎯 Prochaines étapes

Une fois l'application démarrée avec succès :

1. ✅ Explorez la documentation Swagger : `http://localhost:3000/api/docs`
2. ✅ Lisez le guide Postman : `POSTMAN_TESTING_GUIDE.md`
3. ✅ Testez les endpoints avec les exemples fournis
4. ✅ Lancez les tests E2E pour valider tout le système
5. ✅ Commencez le développement de votre frontend

---

## 💡 Conseils

- **Gardez la console ouverte** : Les erreurs et logs y apparaissent en temps réel
- **Utilisez Swagger** : C'est le moyen le plus rapide pour tester vos endpoints
- **Vérifiez les tests** : Lancez `npm run test:e2e` régulièrement
- **Consultez la documentation** : Les fichiers `.md` contiennent des infos détaillées

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans la console
2. Consultez le fichier `POSTGRESQL_SETUP_GUIDE.md`
3. Vérifiez que tous les prérequis sont installés
4. Assurez-vous que les ports 3000 et 5432 sont disponibles

---

**🎉 Bon développement avec HistoRando Backend !**
