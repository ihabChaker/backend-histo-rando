# 📮 Guide de test Postman - Partie 2 : Parcours et POI

## 4. Parcours de randonnée

### 🗺️ 4.1 Lister tous les parcours (Public)

**Endpoint** : `GET {{base_url}}/parcours`

**Description** : Récupérer la liste de tous les parcours (endpoint public, pas d'authentification requise)

**Headers** : Aucun header requis

**Réponse attendue (200 OK)** :

```json
[
  {
    "id": 1,
    "name": "Plages du Débarquement",
    "description": "Un parcours historique le long des plages du débarquement de Normandie",
    "difficultyLevel": "medium",
    "distanceKm": 8.5,
    "estimatedDuration": 180,
    "isPmrAccessible": true,
    "historicalTheme": "Débarquement de Normandie",
    "startingPointLat": 49.3714,
    "startingPointLon": -0.8494,
    "gpxFileUrl": "https://example.com/tracks/parcours1.gpx",
    "imageUrl": "https://example.com/images/parcours1.jpg",
    "isActive": true,
    "createdAt": "2024-11-01T10:00:00.000Z",
    "updatedAt": "2024-11-01T10:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Batterie de Longues-sur-Mer",
    "description": "Découverte de la batterie côtière allemande",
    "difficultyLevel": "easy",
    "distanceKm": 4.2,
    "estimatedDuration": 90,
    "isPmrAccessible": true,
    "historicalTheme": "Seconde Guerre Mondiale",
    "startingPointLat": 49.3485,
    "startingPointLon": -0.6911,
    "isActive": true,
    "createdAt": "2024-11-02T10:00:00.000Z",
    "updatedAt": "2024-11-02T10:00:00.000Z"
  }
]
```

---

### 🔍 4.2 Filtrer les parcours

**Endpoint** : `GET {{base_url}}/parcours`

**Query Parameters** :

#### ✅ Filtrer par difficulté

```
GET {{base_url}}/parcours?difficultyLevel=easy
```

Valeurs possibles : `easy`, `medium`, `hard`

#### ✅ Filtrer les parcours PMR accessibles

```
GET {{base_url}}/parcours?isPmrAccessible=true
```

#### ✅ Filtrer les parcours actifs

```
GET {{base_url}}/parcours?isActive=true
```

#### ✅ Filtrer par distance minimale

```
GET {{base_url}}/parcours?minDistance=5
```

#### ✅ Filtrer par distance maximale

```
GET {{base_url}}/parcours?maxDistance=10
```

#### ✅ Combiner plusieurs filtres

```
GET {{base_url}}/parcours?difficultyLevel=medium&isPmrAccessible=true&minDistance=5&maxDistance=15
```

**Réponse** : Liste des parcours correspondant aux critères

---

### 📍 4.3 Rechercher des parcours à proximité (Public)

**Endpoint** : `GET {{base_url}}/parcours/nearby`

**Description** : Trouver les parcours dans un certain rayon autour d'une position GPS

**Query Parameters** :

- `lat` (required) : Latitude
- `lon` (required) : Longitude
- `radius` (optional) : Rayon en kilomètres (défaut: 50)

**Exemples** :

#### ✅ Parcours à 50km de Bayeux

```
GET {{base_url}}/parcours/nearby?lat=49.2764&lon=-0.7030
```

#### ✅ Parcours à 20km de Caen

```
GET {{base_url}}/parcours/nearby?lat=49.1829&lon=-0.3707&radius=20
```

#### ✅ Parcours à 100km d'Omaha Beach

```
GET {{base_url}}/parcours/nearby?lat=49.3714&lon=-0.8494&radius=100
```

**Réponse attendue (200 OK)** :

```json
[
  {
    "id": 1,
    "name": "Plages du Débarquement",
    "distanceKm": 8.5,
    "distanceFromUser": 2.3,
    "startingPointLat": 49.3714,
    "startingPointLon": -0.8494,
    "difficultyLevel": "medium",
    "isPmrAccessible": true
  }
]
```

---

### 🔎 4.4 Obtenir un parcours spécifique (Public)

**Endpoint** : `GET {{base_url}}/parcours/:id`

**Exemple** :

```
GET {{base_url}}/parcours/1
```

**Réponse attendue (200 OK)** :

```json
{
  "id": 1,
  "name": "Plages du Débarquement",
  "description": "Un parcours historique le long des plages du débarquement de Normandie",
  "difficultyLevel": "medium",
  "distanceKm": 8.5,
  "estimatedDuration": 180,
  "isPmrAccessible": true,
  "historicalTheme": "Débarquement de Normandie",
  "startingPointLat": 49.3714,
  "startingPointLon": -0.8494,
  "gpxFileUrl": "https://example.com/tracks/parcours1.gpx",
  "imageUrl": "https://example.com/images/parcours1.jpg",
  "isActive": true,
  "pointsOfInterest": [
    {
      "id": 1,
      "name": "Batterie de Longues-sur-Mer",
      "poiType": "bunker",
      "orderInParcours": 1
    },
    {
      "id": 2,
      "name": "Mémorial d'Omaha Beach",
      "poiType": "memorial",
      "orderInParcours": 2
    }
  ],
  "createdAt": "2024-11-01T10:00:00.000Z",
  "updatedAt": "2024-11-01T10:00:00.000Z"
}
```

#### ❌ Parcours inexistant (404 Not Found)

```
GET {{base_url}}/parcours/9999
```

**Réponse** :

```json
{
  "statusCode": 404,
  "message": "Parcours with ID 9999 not found",
  "error": "Not Found"
}
```

---

### ➕ 4.5 Créer un parcours (Authentifié)

**Endpoint** : `POST {{base_url}}/parcours`

**Headers** :

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON)** :

```json
{
  "name": "Circuit des Bunkers d'Arromanches",
  "description": "Découverte des fortifications allemandes autour d'Arromanches-les-Bains. Ce parcours vous emmène à travers les vestiges de la Seconde Guerre Mondiale avec des vues imprenables sur la Manche.",
  "difficultyLevel": "medium",
  "distanceKm": 7.8,
  "estimatedDuration": 150,
  "isPmrAccessible": false,
  "historicalTheme": "Fortifications du Mur de l'Atlantique",
  "startingPointLat": 49.3394,
  "startingPointLon": -0.6228,
  "gpxFileUrl": "https://example.com/tracks/arromanches-bunkers.gpx",
  "imageUrl": "https://example.com/images/arromanches.jpg",
  "isActive": true
}
```

**Réponse attendue (201 Created)** :

```json
{
  "id": 3,
  "name": "Circuit des Bunkers d'Arromanches",
  "description": "Découverte des fortifications allemandes autour d'Arromanches-les-Bains...",
  "difficultyLevel": "medium",
  "distanceKm": 7.8,
  "estimatedDuration": 150,
  "isPmrAccessible": false,
  "historicalTheme": "Fortifications du Mur de l'Atlantique",
  "startingPointLat": 49.3394,
  "startingPointLon": -0.6228,
  "gpxFileUrl": "https://example.com/tracks/arromanches-bunkers.gpx",
  "imageUrl": "https://example.com/images/arromanches.jpg",
  "isActive": true,
  "createdAt": "2024-11-12T15:30:00.000Z",
  "updatedAt": "2024-11-12T15:30:00.000Z"
}
```

**Script Tests Postman** :

```javascript
if (pm.response.code === 201) {
  const jsonData = pm.response.json();
  pm.environment.set("parcours_id", jsonData.id);
  console.log("✅ Parcours created with ID:", jsonData.id);
}
```

**Scénarios de test** :

#### ✅ Parcours facile et PMR accessible

```json
{
  "name": "Promenade du Port Winston",
  "description": "Balade facile le long du port artificiel",
  "difficultyLevel": "easy",
  "distanceKm": 3.5,
  "estimatedDuration": 75,
  "isPmrAccessible": true,
  "historicalTheme": "Port artificiel Mulberry",
  "startingPointLat": 49.3394,
  "startingPointLon": -0.6228,
  "isActive": true
}
```

#### ✅ Parcours difficile pour randonneurs expérimentés

```json
{
  "name": "Grande Traversée des Plages",
  "description": "Parcours complet de Utah Beach à Sword Beach",
  "difficultyLevel": "hard",
  "distanceKm": 25.6,
  "estimatedDuration": 480,
  "isPmrAccessible": false,
  "historicalTheme": "D-Day - Toutes les plages",
  "startingPointLat": 49.4173,
  "startingPointLon": -1.1775,
  "isActive": true
}
```

#### ❌ Distance négative (400 Bad Request)

```json
{
  "name": "Parcours invalide",
  "description": "Test d'erreur",
  "difficultyLevel": "easy",
  "distanceKm": -5,
  "estimatedDuration": 100,
  "startingPointLat": 49.3394,
  "startingPointLon": -0.6228
}
```

#### ❌ Latitude hors limites (400 Bad Request)

```json
{
  "name": "Parcours invalide",
  "description": "Test d'erreur",
  "difficultyLevel": "easy",
  "distanceKm": 5,
  "estimatedDuration": 100,
  "startingPointLat": 95,
  "startingPointLon": -0.6228
}
```

---

### ✏️ 4.6 Mettre à jour un parcours (PUT)

**Endpoint** : `PUT {{base_url}}/parcours/{{parcours_id}}`

**Headers** :

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON)** :

```json
{
  "name": "Circuit des Bunkers d'Arromanches - MISE À JOUR",
  "description": "Version mise à jour avec nouveaux points d'intérêt",
  "difficultyLevel": "hard",
  "distanceKm": 9.5,
  "estimatedDuration": 180,
  "isPmrAccessible": false,
  "historicalTheme": "Fortifications du Mur de l'Atlantique - Édition 2024",
  "startingPointLat": 49.3394,
  "startingPointLon": -0.6228,
  "gpxFileUrl": "https://example.com/tracks/arromanches-bunkers-v2.gpx",
  "imageUrl": "https://example.com/images/arromanches-new.jpg",
  "isActive": true
}
```

**Réponse attendue (200 OK)** : Parcours mis à jour avec tous les nouveaux champs

---

### 🗑️ 4.7 Supprimer un parcours

**Endpoint** : `DELETE {{base_url}}/parcours/{{parcours_id}}`

**Headers** :

```
Authorization: Bearer {{token}}
```

**Réponse attendue (200 OK)** :

```json
{
  "message": "Parcours deleted successfully"
}
```

---

## 5. Points d'intérêt (POI)

### 📍 5.1 Lister les POI d'un parcours (Public)

**Endpoint** : `GET {{base_url}}/poi/parcours/:parcoursId`

**Exemple** :

```
GET {{base_url}}/poi/parcours/1
```

**Réponse attendue (200 OK)** :

```json
[
  {
    "id": 1,
    "parcoursId": 1,
    "name": "Batterie de Longues-sur-Mer",
    "description": "Batterie côtière allemande construite en 1943, seule batterie conservée intacte avec ses canons d'origine",
    "poiType": "bunker",
    "latitude": 49.3485,
    "longitude": -0.6911,
    "historicalPeriod": "Seconde Guerre Mondiale",
    "orderInParcours": 1,
    "qrCode": "QR_LONGUES_001",
    "imageUrl": "https://example.com/images/longues.jpg",
    "audioUrl": "https://example.com/audio/longues.mp3",
    "createdAt": "2024-11-01T11:00:00.000Z"
  },
  {
    "id": 2,
    "parcoursId": 1,
    "name": "Cimetière Américain de Colleville",
    "description": "Le plus grand cimetière militaire américain en Europe",
    "poiType": "memorial",
    "latitude": 49.3607,
    "longitude": -0.8578,
    "historicalPeriod": "1944-1945",
    "orderInParcours": 2,
    "qrCode": "QR_COLLEVILLE_001",
    "imageUrl": "https://example.com/images/colleville.jpg",
    "audioUrl": "https://example.com/audio/colleville.mp3",
    "createdAt": "2024-11-01T11:15:00.000Z"
  }
]
```

---

### 🔎 5.2 Obtenir un POI spécifique (Public)

**Endpoint** : `GET {{base_url}}/poi/:id`

**Exemple** :

```
GET {{base_url}}/poi/1
```

**Réponse attendue (200 OK)** :

```json
{
  "id": 1,
  "parcoursId": 1,
  "name": "Batterie de Longues-sur-Mer",
  "description": "Batterie côtière allemande construite en 1943, seule batterie conservée intacte avec ses canons d'origine. Position stratégique pour défendre la côte normande.",
  "poiType": "bunker",
  "latitude": 49.3485,
  "longitude": -0.6911,
  "historicalPeriod": "Seconde Guerre Mondiale",
  "orderInParcours": 1,
  "qrCode": "QR_LONGUES_001",
  "imageUrl": "https://example.com/images/longues.jpg",
  "audioUrl": "https://example.com/audio/longues.mp3",
  "parcours": {
    "id": 1,
    "name": "Plages du Débarquement"
  },
  "createdAt": "2024-11-01T11:00:00.000Z",
  "updatedAt": "2024-11-01T11:00:00.000Z"
}
```

---

### ➕ 5.3 Créer un POI (Authentifié)

**Endpoint** : `POST {{base_url}}/poi`

**Headers** :

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON)** :

```json
{
  "parcoursId": 1,
  "name": "Pointe du Hoc",
  "description": "Site d'assaut du 2e bataillon de Rangers américains le 6 juin 1944. Position stratégique prise après d'intenses combats.",
  "poiType": "bunker",
  "latitude": 49.3976,
  "longitude": -0.9889,
  "historicalPeriod": "6 juin 1944",
  "orderInParcours": 3,
  "qrCode": "QR_POINTE_HOC_001",
  "imageUrl": "https://example.com/images/pointe-hoc.jpg",
  "audioUrl": "https://example.com/audio/pointe-hoc.mp3"
}
```

**Réponse attendue (201 Created)** :

```json
{
  "id": 3,
  "parcoursId": 1,
  "name": "Pointe du Hoc",
  "description": "Site d'assaut du 2e bataillon de Rangers américains...",
  "poiType": "bunker",
  "latitude": 49.3976,
  "longitude": -0.9889,
  "historicalPeriod": "6 juin 1944",
  "orderInParcours": 3,
  "qrCode": "QR_POINTE_HOC_001",
  "imageUrl": "https://example.com/images/pointe-hoc.jpg",
  "audioUrl": "https://example.com/audio/pointe-hoc.mp3",
  "createdAt": "2024-11-12T16:00:00.000Z",
  "updatedAt": "2024-11-12T16:00:00.000Z"
}
```

**Script Tests Postman** :

```javascript
if (pm.response.code === 201) {
  const jsonData = pm.response.json();
  pm.environment.set("poi_id", jsonData.id);
  console.log("✅ POI created with ID:", jsonData.id);
}
```

**Scénarios de test par type de POI** :

#### ✅ Type: Memorial

```json
{
  "parcoursId": 1,
  "name": "Mémorial de Caen",
  "description": "Musée et mémorial dédié à la paix",
  "poiType": "memorial",
  "latitude": 49.2016,
  "longitude": -0.3841,
  "historicalPeriod": "1939-1945",
  "orderInParcours": 4,
  "imageUrl": "https://example.com/images/memorial-caen.jpg",
  "audioUrl": "https://example.com/audio/memorial-caen.mp3"
}
```

#### ✅ Type: Museum

```json
{
  "parcoursId": 1,
  "name": "Musée du Débarquement",
  "description": "Musée racontant l'histoire du D-Day",
  "poiType": "museum",
  "latitude": 49.3394,
  "longitude": -0.6228,
  "historicalPeriod": "1944",
  "orderInParcours": 5,
  "imageUrl": "https://example.com/images/musee-debarquement.jpg"
}
```

#### ✅ Type: Beach

```json
{
  "parcoursId": 1,
  "name": "Omaha Beach",
  "description": "Plage du débarquement américain",
  "poiType": "beach",
  "latitude": 49.3714,
  "longitude": -0.8494,
  "historicalPeriod": "6 juin 1944",
  "orderInParcours": 6,
  "qrCode": "QR_OMAHA_001",
  "imageUrl": "https://example.com/images/omaha.jpg",
  "audioUrl": "https://example.com/audio/omaha.mp3"
}
```

#### ✅ Type: Monument

```json
{
  "parcoursId": 1,
  "name": "Monument Signal",
  "description": "Monument commémoratif des Rangers",
  "poiType": "monument",
  "latitude": 49.3976,
  "longitude": -0.9889,
  "historicalPeriod": "Inauguré en 1979",
  "orderInParcours": 7,
  "imageUrl": "https://example.com/images/monument-signal.jpg"
}
```

#### ✅ Type: Blockhaus

```json
{
  "parcoursId": 1,
  "name": "Blockhaus SK15",
  "description": "Bunker d'observation allemand",
  "poiType": "blockhaus",
  "latitude": 49.35,
  "longitude": -0.7,
  "historicalPeriod": "1942-1944",
  "orderInParcours": 8,
  "qrCode": "QR_SK15_001",
  "imageUrl": "https://example.com/images/sk15.jpg"
}
```

---

### ✏️ 5.4 Mettre à jour un POI

**Endpoint** : `PUT {{base_url}}/poi/{{poi_id}}`

**Headers** :

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON)** :

```json
{
  "name": "Pointe du Hoc - Site Historique Majeur",
  "description": "Site d'assaut du 2e bataillon de Rangers américains le 6 juin 1944. Position stratégique prise après d'intenses combats. Aujourd'hui site préservé avec cratères de bombes visibles.",
  "poiType": "bunker",
  "latitude": 49.3976,
  "longitude": -0.9889,
  "historicalPeriod": "6 juin 1944 - D-Day",
  "orderInParcours": 3,
  "qrCode": "QR_POINTE_HOC_002",
  "imageUrl": "https://example.com/images/pointe-hoc-hd.jpg",
  "audioUrl": "https://example.com/audio/pointe-hoc-extended.mp3"
}
```

**Réponse attendue (200 OK)** : POI mis à jour

---

### 🗑️ 5.5 Supprimer un POI

**Endpoint** : `DELETE {{base_url}}/poi/{{poi_id}}`

**Headers** :

```
Authorization: Bearer {{token}}
```

**Réponse attendue (200 OK)** :

```json
{
  "message": "POI deleted successfully"
}
```

---

**📝 Note** : Cette partie couvre les parcours et points d'intérêt.

**➡️ Suite dans le fichier suivant** : `POSTMAN_TESTING_GUIDE_PART3.md` pour les activités, quiz, challenges et plus.
