# PostgreSQL Setup Guide - HistoRando Backend

## 📋 Guide complet pour configurer PostgreSQL

### Option 1: Réinitialiser le mot de passe PostgreSQL existant

Si PostgreSQL est déjà installé mais que vous avez oublié le mot de passe :

#### Sur Linux (Ubuntu/Debian)

```bash
# 1. Basculer vers l'utilisateur postgres
sudo -i -u postgres

# 2. Ouvrir psql
psql

# 3. Dans psql, réinitialiser le mot de passe
ALTER USER postgres WITH PASSWORD 'nouveau_mot_de_passe';

# 4. Quitter psql
\q

# 5. Retourner à votre utilisateur
exit
```

#### Sur macOS

```bash
# 1. Ouvrir psql en tant que superuser
psql postgres

# 2. Réinitialiser le mot de passe
ALTER USER postgres WITH PASSWORD 'nouveau_mot_de_passe';

# 3. Quitter
\q
```

#### Sur Windows

```powershell
# 1. Ouvrir pgAdmin ou SQL Shell (psql)
# 2. Se connecter avec l'utilisateur postgres
# 3. Exécuter:
ALTER USER postgres WITH PASSWORD 'nouveau_mot_de_passe';
```

---

### Option 2: Créer un nouvel utilisateur et une nouvelle base de données

#### Méthode complète (Recommandée)

```bash
# 1. Se connecter à PostgreSQL
sudo -i -u postgres psql

# OU directement:
psql -U postgres
```

```sql
-- 2. Créer un nouvel utilisateur
CREATE USER historando WITH PASSWORD 'historando_password_2024';

-- 3. Créer la base de données de production
CREATE DATABASE historando_db;

-- 4. Créer la base de données de test
CREATE DATABASE historando_test;

-- 5. Donner tous les privilèges à l'utilisateur
GRANT ALL PRIVILEGES ON DATABASE historando_db TO historando;
GRANT ALL PRIVILEGES ON DATABASE historando_test TO historando;

-- 6. Se connecter à la base historando_db
\c historando_db

-- 7. Donner les privilèges sur le schéma public
GRANT ALL ON SCHEMA public TO historando;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO historando;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO historando;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO historando;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO historando;

-- 8. Même chose pour la base de test
\c historando_test
GRANT ALL ON SCHEMA public TO historando;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO historando;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO historando;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO historando;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO historando;

-- 9. Quitter
\q
```

---

### Option 3: Configuration rapide avec script

Créez un fichier `setup_db.sql` :

```sql
-- setup_db.sql
DROP DATABASE IF EXISTS historando_db;
DROP DATABASE IF EXISTS historando_test;
DROP USER IF EXISTS historando;

CREATE USER historando WITH PASSWORD 'historando_password_2024';
CREATE DATABASE historando_db OWNER historando;
CREATE DATABASE historando_test OWNER historando;

\c historando_db
GRANT ALL ON SCHEMA public TO historando;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO historando;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO historando;

\c historando_test
GRANT ALL ON SCHEMA public TO historando;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO historando;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO historando;
```

Exécutez-le :

```bash
# Linux/macOS
sudo -u postgres psql -f setup_db.sql

# Ou directement
psql -U postgres -f setup_db.sql
```

---

### Vérifier la configuration

```bash
# Tester la connexion
psql -U historando -d historando_db -h localhost

# Ou avec mot de passe dans la commande (pour tester)
PGPASSWORD=historando_password_2024 psql -U historando -d historando_db -h localhost
```

Si vous voyez le prompt `historando_db=>`, c'est réussi ! ✅

---

### Configuration du fichier .env

Une fois PostgreSQL configuré, mettez à jour votre `.env` :

```bash
# .env
NODE_ENV=development
PORT=3000
APP_NAME=HistoRando API

# Database - PRODUCTION
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

Et créez `.env.test` pour les tests :

```bash
# .env.test
NODE_ENV=test
PORT=3000

# Database - TEST
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=historando
DB_PASSWORD=historando_password_2024
DB_DATABASE=historando_test
DB_LOGGING=false

# JWT
JWT_SECRET=test-jwt-secret-key
JWT_EXPIRATION=1d

SWAGGER_ENABLED=false
```

---

### Problèmes courants et solutions

#### ❌ "Peer authentication failed"

**Solution**: Modifier `/etc/postgresql/XX/main/pg_hba.conf`

```bash
# Ouvrir le fichier
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Changer cette ligne:
# local   all             all                                     peer

# En:
local   all             all                                     md5

# Sauvegarder et redémarrer
sudo systemctl restart postgresql
```

#### ❌ "Password authentication failed"

**Solution**: Vérifiez que le mot de passe dans `.env` correspond à celui dans PostgreSQL

```bash
# Réinitialiser le mot de passe
sudo -u postgres psql
ALTER USER historando WITH PASSWORD 'historando_password_2024';
\q
```

#### ❌ "Database does not exist"

**Solution**: Créez la base de données

```bash
sudo -u postgres psql
CREATE DATABASE historando_db OWNER historando;
\q
```

#### ❌ "Connection refused"

**Solution**: Vérifiez que PostgreSQL est démarré

```bash
# Linux
sudo systemctl status postgresql
sudo systemctl start postgresql

# macOS
brew services start postgresql

# Windows
# Vérifier dans Services.msc que PostgreSQL est démarré
```

---

### Commandes PostgreSQL utiles

```bash
# Lister tous les utilisateurs
sudo -u postgres psql -c "\du"

# Lister toutes les bases de données
sudo -u postgres psql -c "\l"

# Se connecter à une base
psql -U historando -d historando_db -h localhost

# Dans psql:
\l                  # Lister les bases de données
\c database_name    # Se connecter à une base
\dt                 # Lister les tables
\d+ table_name      # Décrire une table
\du                 # Lister les utilisateurs
\q                  # Quitter

# Supprimer toutes les tables (dans psql connecté à la base)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO historando;
```

---

### Version Docker (Alternative)

Si vous préférez utiliser Docker :

```bash
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: historando
      POSTGRES_PASSWORD: historando_password_2024
      POSTGRES_DB: historando_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Démarrez avec :

```bash
docker-compose up -d
```

---

## ✅ Vérification finale

Une fois tout configuré, testez la connexion depuis le backend :

```bash
cd /home/iheb/Desktop/projets/histo_rando/backend

# Démarrer l'application
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
🚀 HistoRando API is running on: http://localhost:3000
📚 Swagger docs available at: http://localhost:3000/api/docs
```

🎉 **Votre base de données PostgreSQL est prête !**
