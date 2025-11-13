# Guide d'importation de l'OpenAPI JSON dans Postman

## ✅ Fichier généré avec succès

**Fichier**: `openapi.json`  
**Emplacement**: `/home/iheb/Desktop/projets/histo_rando/backend/openapi.json`  
**Taille**: ~60 KB  
**Format**: OpenAPI 3.0.0

## 📥 Comment importer dans Postman

### Méthode 1: Import direct

1. **Ouvrir Postman**
   - Lancez l'application Postman sur votre ordinateur

2. **Importer le fichier**
   - Cliquez sur le bouton **"Import"** en haut à gauche
   - Sélectionnez l'onglet **"File"**
   - Cliquez sur **"Choose Files"**
   - Naviguez vers `/home/iheb/Desktop/projets/histo_rando/backend/`
   - Sélectionnez le fichier **`openapi.json`**
   - Cliquez sur **"Open"**

3. **Configurer l'import**
   - Postman va détecter automatiquement le format OpenAPI 3.0
   - Vous pouvez choisir d'importer comme:
     - ✅ **Collection** (recommandé) - Crée une collection complète
     - API - Crée une API Postman
   - Cliquez sur **"Import"**

4. **Résultat**
   - Une nouvelle collection **"HistoRando API"** sera créée
   - Tous les endpoints (85+) seront organisés par tags
   - Les schémas de requête/réponse seront automatiquement configurés

### Méthode 2: Drag & Drop

1. Ouvrez Postman
2. Faites glisser le fichier `openapi.json` directement dans la fenêtre Postman
3. Confirmez l'importation

## 📚 Organisation de la collection

La collection importée sera organisée en 12 groupes:

1. **Health** (3 endpoints)
   - GET /api/v1/health
   - GET /api/v1/health/ready
   - GET /api/v1/health/live

2. **Auth** (2 endpoints)
   - POST /api/v1/auth/register
   - POST /api/v1/auth/login

3. **Users** (5 endpoints)
   - GET /api/v1/users/me
   - PUT /api/v1/users/me
   - PATCH /api/v1/users/me
   - GET /api/v1/users/me/stats
   - GET /api/v1/users/:id

4. **Parcours** (6 endpoints)
   - POST /api/v1/parcours
   - GET /api/v1/parcours
   - GET /api/v1/parcours/nearby
   - GET /api/v1/parcours/:id
   - PUT /api/v1/parcours/:id
   - DELETE /api/v1/parcours/:id

5. **POI** (6 endpoints)
   - POST /api/v1/poi
   - GET /api/v1/poi/parcours/:parcoursId
   - GET /api/v1/poi/:id
   - PUT /api/v1/poi/:id
   - PATCH /api/v1/poi/:id
   - DELETE /api/v1/poi/:id

6. **Media (Podcasts)** (8 endpoints)
   - POST /api/v1/podcasts
   - GET /api/v1/podcasts
   - GET /api/v1/podcasts/:id
   - PUT /api/v1/podcasts/:id
   - DELETE /api/v1/podcasts/:id
   - POST /api/v1/podcasts/:id/parcours
   - GET /api/v1/podcasts/parcours/:parcoursId
   - DELETE /api/v1/podcasts/:podcastId/parcours/:parcoursId

7. **Activities** (8 endpoints)
   - POST /api/v1/activities
   - GET /api/v1/activities
   - GET /api/v1/activities/stats
   - GET /api/v1/activities/:id
   - PUT /api/v1/activities/:id
   - DELETE /api/v1/activities/:id
   - POST /api/v1/activities/poi-visits
   - GET /api/v1/activities/poi-visits/me

8. **Quiz** (16 endpoints)
   - CRUD quizzes
   - CRUD questions
   - CRUD answers
   - Submit attempts
   - Get user attempts
   - Associate to parcours

9. **Challenges** (8 endpoints)
   - CRUD challenges
   - Start/complete challenges
   - Get user progress

10. **Treasure Hunt** (8 endpoints)
    - CRUD treasure hunts
    - Record found treasures
    - Get user treasures

11. **Rewards** (7 endpoints)
    - CRUD rewards
    - Redeem rewards
    - Get user redemptions

12. **Historical** (10 endpoints)
    - CRUD battalions
    - CRUD battalion routes
    - Get routes by battalion/parcours

## 🔐 Configuration de l'authentification

Après l'import, vous devrez configurer l'authentification Bearer Token:

### Configuration globale de la collection

1. **Sélectionnez la collection** "HistoRando API"
2. Cliquez sur l'onglet **"Authorization"**
3. Type: Sélectionnez **"Bearer Token"**
4. Token: `{{access_token}}`

### Créer une variable d'environnement

1. **Créer un environnement**
   - Cliquez sur l'icône ⚙️ en haut à droite
   - Cliquez sur **"Add"**
   - Nom: `HistoRando Dev`

2. **Ajouter les variables**

   ```
   base_url: http://localhost:3000
   bearerToken: (sera rempli après le login)
   ```

3. **Sauvegarder et activer l'environnement**

### Workflow de test

1. **S'inscrire ou se connecter**
   - Exécuter `POST /api/v1/auth/register` ou `POST /api/v1/auth/login`
   - Dans le **Test** tab, ajoutez ce script:
     ```javascript
     pm.test('Login successful', function () {
       const response = pm.response.json();
       pm.environment.set('bearerToken', response.access_token);
     });
     ```
   - Le token sera automatiquement sauvegardé

2. **Tester les endpoints protégés**
   - Tous les endpoints (sauf `/health` et `/auth`) nécessitent le token
   - Le token sera automatiquement ajouté via la configuration de la collection

## 📝 Exemples de requêtes inclus

Chaque endpoint inclut:

- ✅ **Descriptions complètes** en français
- ✅ **Exemples de requêtes** avec données réalistes
- ✅ **Exemples de réponses** pour chaque status code
- ✅ **Paramètres documentés** (path, query, body)
- ✅ **Schémas de validation** Zod

## 🎯 Endpoints publics (pas d'authentification)

Ces endpoints peuvent être testés sans token:

- GET /api/v1/health
- GET /api/v1/health/ready
- GET /api/v1/health/live
- POST /api/v1/auth/register
- POST /api/v1/auth/login

## 🔒 Endpoints protégés (authentification requise)

Tous les autres endpoints nécessitent un JWT Bearer Token valide:

- Users: Tous les endpoints
- Parcours: Tous les endpoints
- POI: Tous les endpoints
- Media: Tous les endpoints
- Activities: Tous les endpoints
- Quiz: Tous les endpoints
- Challenges: Tous les endpoints
- Treasure Hunt: Tous les endpoints
- Rewards: Tous les endpoints
- Historical: Tous les endpoints

## 🚀 Configuration de l'URL de base

Pour faciliter le basculement entre environnements:

1. Dans Postman, remplacez `http://localhost:3000` par `{{base_url}}`
2. Créez plusieurs environnements:
   - **Dev Local**: `base_url = http://localhost:3000`
   - **Staging**: `base_url = https://staging.historando.com`
   - **Production**: `base_url = https://api.historando.com`

## 📊 Tests automatisés

Vous pouvez ajouter des tests dans l'onglet **Tests** de chaque requête:

```javascript
// Vérifier le status code
pm.test('Status code is 200', function () {
  pm.response.to.have.status(200);
});

// Vérifier la structure de la réponse
pm.test('Response has required fields', function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property('id');
  pm.expect(jsonData).to.have.property('name');
});

// Sauvegarder des données pour d'autres requêtes
pm.test('Save ID', function () {
  const jsonData = pm.response.json();
  pm.environment.set('parcours_id', jsonData.id);
});
```

## 🔄 Mise à jour de la collection

Si l'API change, vous pouvez régénérer le fichier OpenAPI:

1. **Redémarrer le serveur**

   ```bash
   npm run start:dev
   ```

2. **Exporter le nouveau fichier**

   ```bash
   curl -s http://localhost:3000/api-json > openapi.json
   ```

3. **Réimporter dans Postman**
   - Postman détectera la collection existante
   - Vous pourrez choisir de:
     - Remplacer la collection
     - Fusionner avec la collection existante
     - Créer une nouvelle collection

## 📖 Documentation API complète

La collection importée contient toute la documentation:

- Descriptions détaillées de chaque endpoint
- Paramètres requis et optionnels
- Formats de données attendus
- Exemples de réponses succès et erreurs
- Codes d'erreur possibles

## 🎓 Ressources supplémentaires

- **Documentation Swagger**: http://localhost:3000/api/docs
- **Guides Postman détaillés**: Voir `POSTMAN_TESTING_GUIDE_PART1.md` et `POSTMAN_TESTING_GUIDE_PART2.md`
- **Setup local**: Voir `LOCAL_SETUP_GUIDE.md`

## ✨ Avantages de l'import OpenAPI

1. ✅ **Gain de temps**: 85+ endpoints créés automatiquement
2. ✅ **Documentation intégrée**: Descriptions et exemples inclus
3. ✅ **Synchronisation facile**: Re-import automatique des changements
4. ✅ **Validation automatique**: Schémas de données prédéfinis
5. ✅ **Organisation parfaite**: Endpoints groupés par fonctionnalité
6. ✅ **Exemples réalistes**: Données de test prêtes à l'emploi

---

## 🎉 Prêt à tester!

Vous avez maintenant une collection Postman complète avec tous les endpoints de l'API HistoRando. Bon test! 🚀

**Date de génération**: 13 novembre 2025  
**Version de l'API**: 1.0.0  
**Format**: OpenAPI 3.0.0
