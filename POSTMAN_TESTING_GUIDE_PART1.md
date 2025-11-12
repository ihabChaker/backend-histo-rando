# 📮 Guide de test Postman - HistoRando Backend API

## 🎯 Table des matières

1. [Configuration initiale de Postman](#1-configuration-initiale-de-postman)
2. [Authentification](#2-authentification)
3. [Gestion des utilisateurs](#3-gestion-des-utilisateurs)
4. [Parcours de randonnée](#4-parcours-de-randonnée)
5. [Points d'intérêt (POI)](#5-points-dintérêt-poi)
6. [Activités utilisateur](#6-activités-utilisateur)
7. [Quiz et questions](#7-quiz-et-questions)
8. [Challenges](#8-challenges)
9. [Chasse aux trésors](#9-chasse-aux-trésors)
10. [Récompenses](#10-récompenses)
11. [Médias et podcasts](#11-médias-et-podcasts)
12. [Données historiques](#12-données-historiques)

---

## 1. Configuration initiale de Postman

### Créer une nouvelle collection

1. Ouvrez Postman
2. Cliquez sur **"New Collection"**
3. Nommez-la : **"HistoRando API"**
4. Description : **"API Backend pour application de randonnées historiques"**

### Configurer les variables d'environnement

1. Créez un nouvel environnement : **"HistoRando Local"**
2. Ajoutez ces variables :

| Variable      | Initial Value                  | Current Value                  |
| ------------- | ------------------------------ | ------------------------------ |
| `base_url`    | `http://localhost:3000/api/v1` | `http://localhost:3000/api/v1` |
| `token`       | (laissez vide)                 | (laissez vide)                 |
| `user_id`     | (laissez vide)                 | (laissez vide)                 |
| `parcours_id` | (laissez vide)                 | (laissez vide)                 |
| `poi_id`      | (laissez vide)                 | (laissez vide)                 |
| `activity_id` | (laissez vide)                 | (laissez vide)                 |

### Configuration automatique du token

Pour automatiquement sauvegarder le token après login, ajoutez ce script dans l'onglet **"Tests"** des requêtes de login :

```javascript
// Script à ajouter dans l'onglet "Tests" de la requête POST /auth/login
if (pm.response.code === 201 || pm.response.code === 200) {
  const jsonData = pm.response.json();
  pm.environment.set("token", jsonData.access_token);
  pm.environment.set("user_id", jsonData.user.id);
  console.log("Token saved:", jsonData.access_token);
}
```

### Configuration de l'authentification globale

Pour la collection complète :

1. Allez dans **Collection Settings**
2. Onglet **Authorization**
3. Type : **Bearer Token**
4. Token : `{{token}}`

Cela appliquera automatiquement le token à toutes les requêtes de la collection.

---

## 2. Authentification

### 🔐 2.1 Inscription (Register)

**Endpoint** : `POST {{base_url}}/auth/register`

**Description** : Créer un nouveau compte utilisateur

**Headers** :

```
Content-Type: application/json
```

**Body (JSON)** :

```json
{
  "username": "jean.dupont",
  "email": "jean.dupont@example.com",
  "password": "SecurePass123!",
  "firstName": "Jean",
  "lastName": "Dupont",
  "isPmr": false,
  "phoneNumber": "+33612345678"
}
```

**Réponse attendue (201 Created)** :

```json
{
  "id": 1,
  "username": "jean.dupont",
  "email": "jean.dupont@example.com",
  "firstName": "Jean",
  "lastName": "Dupont",
  "isPmr": false,
  "phoneNumber": "+33612345678",
  "totalPoints": 0,
  "totalKm": 0,
  "registrationDate": "2024-11-12T10:30:00.000Z"
}
```

**Scénarios de test** :

#### ✅ Inscription valide

```json
{
  "username": "marie.martin",
  "email": "marie.martin@example.com",
  "password": "StrongPassword456!",
  "firstName": "Marie",
  "lastName": "Martin"
}
```

#### ✅ Inscription utilisateur PMR (Personne à Mobilité Réduite)

```json
{
  "username": "pierre.pmr",
  "email": "pierre.pmr@example.com",
  "password": "AccessPass789!",
  "firstName": "Pierre",
  "lastName": "Bernard",
  "isPmr": true
}
```

#### ❌ Email déjà utilisé (409 Conflict)

```json
{
  "username": "jean.dupont2",
  "email": "jean.dupont@example.com",
  "password": "SecurePass123!",
  "firstName": "Jean",
  "lastName": "Dupont"
}
```

**Réponse** :

```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}
```

#### ❌ Email invalide (400 Bad Request)

```json
{
  "username": "invalid.user",
  "email": "invalid-email",
  "password": "SecurePass123!",
  "firstName": "Invalid",
  "lastName": "User"
}
```

**Réponse** :

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "code": "invalid_string",
      "path": ["email"],
      "message": "Invalid email"
    }
  ]
}
```

#### ❌ Mot de passe trop court (400 Bad Request)

```json
{
  "username": "short.pass",
  "email": "short@example.com",
  "password": "123",
  "firstName": "Short",
  "lastName": "Pass"
}
```

---

### 🔑 2.2 Connexion (Login)

**Endpoint** : `POST {{base_url}}/auth/login`

**Description** : Se connecter et obtenir un token JWT

**Headers** :

```
Content-Type: application/json
```

**Body (JSON)** :

```json
{
  "email": "jean.dupont@example.com",
  "password": "SecurePass123!"
}
```

**Réponse attendue (200 OK)** :

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiamVhbi5kdXBvbnRAZXhhbXBsZS5jb20iLCJpYXQiOjE2OTk4MDAwMDAsImV4cCI6MTcwMDQwNDgwMH0.signature",
  "user": {
    "id": 1,
    "username": "jean.dupont",
    "email": "jean.dupont@example.com",
    "firstName": "Jean",
    "lastName": "Dupont"
  }
}
```

**Script Tests Postman** (à ajouter dans l'onglet Tests) :

```javascript
if (pm.response.code === 200) {
  const jsonData = pm.response.json();
  pm.environment.set("token", jsonData.access_token);
  pm.environment.set("user_id", jsonData.user.id);
  console.log("✅ Token saved successfully");
  console.log("Token:", jsonData.access_token.substring(0, 50) + "...");
}
```

**Scénarios de test** :

#### ✅ Connexion réussie

```json
{
  "email": "jean.dupont@example.com",
  "password": "SecurePass123!"
}
```

#### ❌ Mot de passe incorrect (401 Unauthorized)

```json
{
  "email": "jean.dupont@example.com",
  "password": "WrongPassword"
}
```

**Réponse** :

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

#### ❌ Email inexistant (401 Unauthorized)

```json
{
  "email": "nonexistent@example.com",
  "password": "SomePassword123!"
}
```

**Réponse** :

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

---

## 3. Gestion des utilisateurs

⚠️ **Important** : Tous ces endpoints nécessitent l'authentification (token Bearer)

### 👤 3.1 Obtenir mon profil

**Endpoint** : `GET {{base_url}}/users/me`

**Headers** :

```
Authorization: Bearer {{token}}
```

**Réponse attendue (200 OK)** :

```json
{
  "id": 1,
  "username": "jean.dupont",
  "email": "jean.dupont@example.com",
  "firstName": "Jean",
  "lastName": "Dupont",
  "isPmr": false,
  "totalPoints": 150,
  "totalKm": 12.5,
  "phoneNumber": "+33612345678",
  "avatarUrl": null,
  "registrationDate": "2024-11-12T10:30:00.000Z"
}
```

**Scénarios de test** :

#### ✅ Récupération du profil avec token valide

Headers : `Authorization: Bearer {{token}}`

#### ❌ Sans token (401 Unauthorized)

Supprimez le header `Authorization`

**Réponse** :

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### ❌ Token invalide (401 Unauthorized)

Headers : `Authorization: Bearer invalid_token_here`

---

### 📊 3.2 Obtenir mes statistiques

**Endpoint** : `GET {{base_url}}/users/me/stats`

**Headers** :

```
Authorization: Bearer {{token}}
```

**Réponse attendue (200 OK)** :

```json
{
  "totalPoints": 150,
  "totalKm": 12.5,
  "totalParcours": 3,
  "totalPOIsVisited": 8,
  "totalChallengesCompleted": 2,
  "totalTreasuresFound": 5,
  "totalQuizzesPassed": 4,
  "rank": "Explorer",
  "nextRankPoints": 350
}
```

---

### ✏️ 3.3 Mettre à jour mon profil (PUT)

**Endpoint** : `PUT {{base_url}}/users/me`

**Description** : Remplacer tout le profil (tous les champs requis)

**Headers** :

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON)** :

```json
{
  "username": "jean.dupont.updated",
  "firstName": "Jean-Claude",
  "lastName": "Dupont-Martin",
  "isPmr": false,
  "phoneNumber": "+33698765432",
  "avatarUrl": "https://example.com/avatars/jean.jpg"
}
```

**Réponse attendue (200 OK)** :

```json
{
  "id": 1,
  "username": "jean.dupont.updated",
  "email": "jean.dupont@example.com",
  "firstName": "Jean-Claude",
  "lastName": "Dupont-Martin",
  "isPmr": false,
  "totalPoints": 150,
  "totalKm": 12.5,
  "phoneNumber": "+33698765432",
  "avatarUrl": "https://example.com/avatars/jean.jpg",
  "registrationDate": "2024-11-12T10:30:00.000Z"
}
```

---

### ✏️ 3.4 Mettre à jour partiellement mon profil (PATCH)

**Endpoint** : `PATCH {{base_url}}/users/me`

**Description** : Mettre à jour seulement certains champs

**Headers** :

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Scénarios de test** :

#### ✅ Changer seulement le prénom

```json
{
  "firstName": "Jean-Michel"
}
```

#### ✅ Activer le statut PMR

```json
{
  "isPmr": true
}
```

#### ✅ Changer l'avatar et le téléphone

```json
{
  "avatarUrl": "https://example.com/avatars/new-avatar.jpg",
  "phoneNumber": "+33787654321"
}
```

#### ✅ Mettre à jour plusieurs champs

```json
{
  "firstName": "Jean-Paul",
  "lastName": "Dupont-Durand",
  "phoneNumber": "+33611223344"
}
```

**Réponse attendue (200 OK)** :

```json
{
  "id": 1,
  "username": "jean.dupont.updated",
  "email": "jean.dupont@example.com",
  "firstName": "Jean-Paul",
  "lastName": "Dupont-Durand",
  "isPmr": false,
  "totalPoints": 150,
  "totalKm": 12.5,
  "phoneNumber": "+33611223344",
  "avatarUrl": "https://example.com/avatars/new-avatar.jpg",
  "registrationDate": "2024-11-12T10:30:00.000Z"
}
```

---

**📝 Note** : Cette partie couvre l'authentification et la gestion des utilisateurs.

**➡️ Suite dans le fichier suivant** : `POSTMAN_TESTING_GUIDE_PART2.md` pour les parcours, POI et autres modules.
