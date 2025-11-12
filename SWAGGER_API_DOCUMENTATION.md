# Swagger API Documentation - HistoRando Backend

## Overview

This document provides comprehensive API documentation for the HistoRando backend application, including all 11 modules and 92 endpoints.

## Base URL

```
Development: http://localhost:3000/api/v1
Production: https://api.historando.fr/api/v1
```

## Interactive Documentation

Swagger UI is available at: `/api/docs`

## Authentication

Most endpoints require JWT Bearer authentication:

```http
Authorization: Bearer <your_jwt_token>
```

Obtain tokens via `/api/v1/auth/register` or `/api/v1/auth/login`

---

## Module Overview

| Module             | Endpoints | Public | Protected | Description                 |
| ------------------ | --------- | ------ | --------- | --------------------------- |
| **Auth**           | 2         | 2      | 0         | User registration and login |
| **Users**          | 5         | 0      | 5         | User profile management     |
| **Parcours**       | 6         | 3      | 3         | Hiking trails/routes        |
| **POI**            | 6         | 3      | 3         | Points of Interest          |
| **Podcasts**       | 8         | 3      | 5         | Audio content for parcours  |
| **Activities**     | 8         | 0      | 8         | User activity tracking      |
| **Quizzes**        | 16        | 4      | 12        | Interactive quizzes         |
| **Challenges**     | 8         | 2      | 6         | Physical challenges         |
| **Treasure Hunts** | 8         | 3      | 5         | GPS-based treasure hunting  |
| **Rewards**        | 7         | 3      | 4         | Points redemption system    |
| **Historical**     | 10        | 5      | 5         | WWII battalion information  |
| **TOTAL**          | **92**    | **27** | **65**    |                             |

---

## 1. Authentication Module

### POST /auth/register

Register a new user account.

**Access**: Public  
**Request Body**:

```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "isPmr": false
}
```

**Response** (201):

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "isPmr": false,
    "totalPoints": 0,
    "totalKm": 0
  }
}
```

### POST /auth/login

Login with existing credentials.

**Access**: Public  
**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200):

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "totalPoints": 150,
    "totalKm": 12.5
  }
}
```

---

## 2. Users Module

### GET /users/profile

Get current user's profile.

**Access**: Protected  
**Headers**: `Authorization: Bearer <token>`

**Response** (200):

```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "isPmr": false,
  "profilePictureUrl": "https://example.com/avatars/1.jpg",
  "totalPoints": 450,
  "totalKm": 35.2,
  "memberSince": "2025-01-15T10:30:00Z"
}
```

### PUT /users/profile

Update current user's profile.

**Access**: Protected

**Request Body**:

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "profilePictureUrl": "https://example.com/new-avatar.jpg",
  "isPmr": true
}
```

### DELETE /users/profile

Delete current user's account.

**Access**: Protected  
**Response** (200): `{ "message": "Account deleted successfully" }`

---

## 3. Parcours Module

### POST /parcours

Create a new parcours (hiking trail).

**Access**: Protected

**Request Body**:

```json
{
  "name": "Omaha Beach Trail",
  "description": "Historic D-Day landing beach route",
  "difficulty": "medium",
  "estimatedDurationMinutes": 180,
  "totalDistanceKm": 12.5,
  "startLatitude": 49.369,
  "startLongitude": -0.867,
  "isPmrAccessible": false,
  "imageUrl": "https://example.com/trails/omaha.jpg",
  "gpxFileUrl": "https://example.com/gpx/omaha-trail.gpx",
  "historicalContext": "Site of the D-Day landings on June 6, 1944"
}
```

**Response** (201):

```json
{
  "id": 1,
  "name": "Omaha Beach Trail",
  "difficulty": "medium",
  "totalDistanceKm": 12.5,
  "isActive": true,
  "createdAt": "2025-11-12T10:00:00Z"
}
```

### GET /parcours

List all active parcours.

**Access**: Public  
**Query Parameters**:

- `difficulty` (optional): `easy`, `medium`, `hard`
- `isPmrAccessible` (optional): `true`, `false`

**Response** (200):

```json
[
  {
    "id": 1,
    "name": "Omaha Beach Trail",
    "difficulty": "medium",
    "estimatedDurationMinutes": 180,
    "totalDistanceKm": 12.5,
    "isPmrAccessible": false,
    "imageUrl": "https://example.com/trails/omaha.jpg"
  }
]
```

### GET /parcours/:id

Get parcours details with POIs.

**Access**: Public

**Response** (200):

```json
{
  "id": 1,
  "name": "Omaha Beach Trail",
  "description": "Historic D-Day landing beach route",
  "difficulty": "medium",
  "totalDistanceKm": 12.5,
  "pointsOfInterest": [
    {
      "id": 1,
      "name": "Colleville Cemetery",
      "poiType": "monument",
      "latitude": 49.358,
      "longitude": -0.858,
      "orderInParcours": 1
    }
  ]
}
```

---

## 4. Points of Interest (POI) Module

### POST /pois

Create a new POI.

**Access**: Protected

**Request Body**:

```json
{
  "parcoursId": 1,
  "name": "Colleville American Cemetery",
  "description": "American military cemetery with 9,388 graves",
  "poiType": "monument",
  "latitude": 49.358,
  "longitude": -0.858,
  "orderInParcours": 1,
  "historicalPeriod": "World War II",
  "imageUrl": "https://example.com/pois/colleville.jpg",
  "audioUrl": "https://example.com/audio/colleville.mp3",
  "qrCode": "POI001"
}
```

**POI Types**: `monument`, `memorial`, `bunker`, `museum`, `viewpoint`, `battlefield`, `other`

**Response** (201):

```json
{
  "id": 1,
  "name": "Colleville American Cemetery",
  "poiType": "monument",
  "latitude": 49.358,
  "longitude": -0.858,
  "createdAt": "2025-11-12T10:30:00Z"
}
```

### GET /pois

List all POIs or filter by parcours.

**Access**: Public  
**Query Parameters**:

- `parcoursId` (optional): Filter by parcours ID

### GET /pois/:id

Get POI details.

**Access**: Public

---

## 5. Podcasts Module (NEW)

### POST /podcasts

Create a new podcast audio file.

**Access**: Protected

**Request Body**:

```json
{
  "title": "Le Débarquement de Normandie",
  "description": "Récit historique du D-Day et de la bataille de Normandie",
  "durationSeconds": 1200,
  "audioFileUrl": "https://example.com/podcasts/normandy-dday.mp3",
  "narrator": "Jean Dupont, historien",
  "language": "fr",
  "thumbnailUrl": "https://example.com/thumbnails/dday.jpg"
}
```

**Response** (201):

```json
{
  "id": 1,
  "title": "Le Débarquement de Normandie",
  "durationSeconds": 1200,
  "narrator": "Jean Dupont, historien",
  "language": "fr",
  "createdAt": "2025-11-12T11:00:00Z"
}
```

### POST /podcasts/:id/parcours

Associate podcast with a parcours.

**Access**: Protected

**Request Body**:

```json
{
  "parcoursId": 1,
  "playOrder": 1,
  "suggestedKm": 2.5
}
```

**Response** (201):

```json
{
  "podcastId": 1,
  "parcoursId": 1,
  "playOrder": 1,
  "suggestedKm": 2.5
}
```

### GET /podcasts/parcours/:parcoursId

Get all podcasts for a specific parcours, ordered by playOrder.

**Access**: Public

**Response** (200):

```json
[
  {
    "id": 1,
    "title": "Introduction to Omaha Beach",
    "durationSeconds": 600,
    "ParcoursPodcast": {
      "playOrder": 1,
      "suggestedKm": 0
    }
  },
  {
    "id": 2,
    "title": "The Landing",
    "durationSeconds": 900,
    "ParcoursPodcast": {
      "playOrder": 2,
      "suggestedKm": 3.5
    }
  }
]
```

---

## 6. Activities Module (NEW)

### POST /activities

Start a new activity (begin a parcours).

**Access**: Protected

**Request Body**:

```json
{
  "parcoursId": 1,
  "activityType": "walking"
}
```

**Activity Types**: `walking`, `running`, `cycling`

**Response** (201):

```json
{
  "id": 1,
  "userId": 1,
  "parcoursId": 1,
  "activityType": "walking",
  "startDatetime": "2025-11-12T14:30:00Z",
  "status": "in_progress",
  "distanceCoveredKm": 0,
  "pointsEarned": 0
}
```

### PUT /activities/:id

Update activity (complete, add distance, points).

**Access**: Protected

**Request Body**:

```json
{
  "status": "completed",
  "endDatetime": "2025-11-12T17:45:00Z",
  "distanceCoveredKm": 12.5,
  "pointsEarned": 125,
  "averageSpeed": 4.2,
  "gpxTraceUrl": "https://example.com/traces/my-hike.gpx"
}
```

**Status Values**: `in_progress`, `completed`, `paused`, `abandoned`

**Note**: When status changes to `completed`, user's `totalPoints` and `totalKm` are automatically updated.

### GET /activities/stats

Get user's activity statistics.

**Access**: Protected

**Response** (200):

```json
{
  "totalActivities": 15,
  "completedActivities": 12,
  "totalDistance": 156.3,
  "totalPoints": 1420,
  "totalPOIVisits": 45,
  "averageDistance": 13.03
}
```

### POST /activities/poi-visits

Record a POI visit during an activity.

**Access**: Protected

**Request Body**:

```json
{
  "poiId": 1,
  "activityId": 5,
  "scannedQr": true,
  "listenedAudio": true,
  "pointsEarned": 10
}
```

**Response** (201):

```json
{
  "id": 1,
  "userId": 1,
  "poiId": 1,
  "activityId": 5,
  "scannedQr": true,
  "listenedAudio": true,
  "pointsEarned": 10,
  "visitedAt": "2025-11-12T15:20:00Z"
}
```

**Note**: User's `totalPoints` is automatically updated. Duplicate visits to same POI within same activity are prevented (409 Conflict).

---

## 7. Quizzes Module (NEW)

### POST /quizzes

Create a new quiz.

**Access**: Protected

**Request Body**:

```json
{
  "title": "Quiz: D-Day Landing",
  "description": "Test your knowledge of the Normandy invasion",
  "difficulty": "medium",
  "pointsReward": 50,
  "isActive": true
}
```

**Difficulty Levels**: `easy`, `medium`, `hard`

**Response** (201):

```json
{
  "id": 1,
  "title": "Quiz: D-Day Landing",
  "difficulty": "medium",
  "pointsReward": 50,
  "isActive": true,
  "createdAt": "2025-11-12T10:00:00Z"
}
```

### POST /quizzes/:id/questions

Add a question to a quiz.

**Access**: Protected

**Request Body**:

```json
{
  "questionText": "When was D-Day?",
  "correctAnswer": "June 6, 1944",
  "questionOrder": 1,
  "points": 10
}
```

**Response** (201):

```json
{
  "id": 1,
  "quizId": 1,
  "questionText": "When was D-Day?",
  "correctAnswer": "June 6, 1944",
  "questionOrder": 1,
  "points": 10
}
```

### POST /quizzes/questions/:id/answers

Add answer options to a question.

**Access**: Protected

**Request Body**:

```json
{
  "answerText": "June 6, 1944",
  "isCorrect": true
}
```

### POST /quizzes/attempts

Submit a quiz attempt.

**Access**: Protected

**Request Body**:

```json
{
  "quizId": 1,
  "answers": [
    {
      "questionId": 1,
      "answerId": 2
    },
    {
      "questionId": 2,
      "answerId": 5
    }
  ],
  "timeTakenSeconds": 120
}
```

**Response** (201):

```json
{
  "id": 1,
  "userId": 1,
  "quizId": 1,
  "score": 8,
  "maxScore": 10,
  "isPassing": true,
  "pointsEarned": 50,
  "timeTakenSeconds": 120,
  "results": [
    {
      "questionId": 1,
      "correct": true,
      "points": 5
    },
    {
      "questionId": 2,
      "correct": false,
      "points": 0
    }
  ],
  "attemptedAt": "2025-11-12T16:30:00Z"
}
```

**Scoring Logic**:

- Points awarded only if score ≥ 50% of maxScore
- User's `totalPoints` automatically updated on passing
- Detailed results show per-question performance

### POST /quizzes/:id/parcours

Associate quiz with a parcours.

**Access**: Protected

**Request Body**:

```json
{
  "parcoursId": 1,
  "unlockAtKm": 5.0
}
```

**Response**: Quiz unlocks for users when they reach 5km in the parcours.

---

## 8. Challenges Module (NEW)

### POST /challenges

Create a new challenge.

**Access**: Protected

**Request Body**:

```json
{
  "name": "Weighted Backpack Challenge",
  "description": "Complete the parcours with a 10kg weighted backpack",
  "challengeType": "weighted_backpack",
  "pointsReward": 150,
  "difficultyMultiplier": 1.5
}
```

**Challenge Types**:

- `weighted_backpack` - Carry extra weight
- `period_clothing` - Wear period-appropriate clothing
- `distance` - Complete specific distance
- `time` - Complete within time limit

**Response** (201):

```json
{
  "id": 1,
  "name": "Weighted Backpack Challenge",
  "challengeType": "weighted_backpack",
  "pointsReward": 150,
  "difficultyMultiplier": 1.5,
  "createdAt": "2025-11-12T10:00:00Z"
}
```

### POST /challenges/start

Start a challenge (must be linked to an activity).

**Access**: Protected

**Request Body**:

```json
{
  "challengeId": 1,
  "activityId": 5
}
```

**Response** (201):

```json
{
  "id": 1,
  "userId": 1,
  "challengeId": 1,
  "activityId": 5,
  "status": "in_progress",
  "startedAt": "2025-11-12T14:30:00Z"
}
```

### PUT /challenges/progress/:id

Complete or fail a challenge.

**Access**: Protected

**Request Body**:

```json
{
  "status": "completed",
  "pointsEarned": 150
}
```

**Status Values**: `in_progress`, `completed`, `failed`

**Note**: On completion, user's `totalPoints` is automatically updated.

---

## 9. Treasure Hunts Module (NEW)

### POST /treasure-hunts

Create a GPS-based treasure hunt.

**Access**: Protected

**Request Body**:

```json
{
  "parcoursId": 1,
  "name": "Hidden Bunker",
  "description": "Find the hidden German bunker from WWII",
  "targetObject": "Bunker entrance door",
  "latitude": 49.182863,
  "longitude": -0.370679,
  "scanRadiusMeters": 30,
  "pointsReward": 75,
  "qrCode": "BUNKER001"
}
```

**Coordinates**:

- `latitude`: -90 to 90
- `longitude`: -180 to 180
- `scanRadiusMeters`: Detection radius (default: 50m)

**Response** (201):

```json
{
  "id": 1,
  "name": "Hidden Bunker",
  "targetObject": "Bunker entrance door",
  "scanRadiusMeters": 30,
  "pointsReward": 75,
  "isActive": true,
  "createdAt": "2025-11-12T11:00:00Z"
}
```

### POST /treasure-hunts/found

Record treasure discovery (validates GPS distance).

**Access**: Protected

**Request Body**:

```json
{
  "treasureId": 1,
  "latitude": 49.18287,
  "longitude": -0.370685
}
```

**Response** (201):

```json
{
  "id": 1,
  "userId": 1,
  "treasureId": 1,
  "latitude": 49.18287,
  "longitude": -0.370685,
  "distance": 8.5,
  "pointsEarned": 75,
  "foundAt": "2025-11-12T15:45:00Z"
}
```

**Validation**:

- User must be within `scanRadiusMeters` of treasure
- Uses Haversine formula for GPS distance calculation
- Returns 400 Bad Request if too far
- Prevents duplicate finds (409 Conflict)
- User's `totalPoints` automatically updated

**Error Response** (400):

```json
{
  "statusCode": 400,
  "message": "You are 125.3 meters away. You must be within 30 meters to claim this treasure.",
  "error": "Bad Request"
}
```

---

## 10. Rewards Module (NEW)

### POST /rewards

Create a new reward.

**Access**: Protected

**Request Body**:

```json
{
  "name": "Free Museum Entry",
  "description": "Get free entry to Normandy American Cemetery Museum",
  "pointsCost": 200,
  "rewardType": "discount",
  "partnerName": "Normandy Museum",
  "stockQuantity": 50,
  "imageUrl": "https://example.com/rewards/museum.jpg"
}
```

**Reward Types**:

- `discount` - Price discounts
- `gift` - Physical gifts
- `badge` - Digital badges
- `premium_content` - Exclusive content access

**Response** (201):

```json
{
  "id": 1,
  "name": "Free Museum Entry",
  "pointsCost": 200,
  "rewardType": "discount",
  "stockQuantity": 50,
  "createdAt": "2025-11-12T10:00:00Z"
}
```

### POST /rewards/redeem

Redeem a reward using points.

**Access**: Protected

**Request Body**:

```json
{
  "rewardId": 1
}
```

**Response** (201):

```json
{
  "id": 1,
  "userId": 1,
  "rewardId": 1,
  "pointsSpent": 200,
  "redemptionCode": "RWD-1731425000-ABC123",
  "status": "pending",
  "redeemedAt": "2025-11-12T16:00:00Z"
}
```

**Validation**:

- User must have sufficient points
- Reward must have stock available (`stockQuantity > 0`)
- Returns 400 Bad Request if insufficient points or out of stock
- Points deducted from user's `totalPoints`
- Stock quantity decremented
- Unique redemption code generated

**Redemption Statuses**:

- `pending` - Awaiting partner confirmation
- `redeemed` - Confirmed by partner
- `used` - Reward has been used
- `expired` - Redemption expired
- `cancelled` - Redemption cancelled

### GET /rewards/redemptions/me

List user's reward redemptions.

**Access**: Protected

**Response** (200):

```json
[
  {
    "id": 1,
    "reward": {
      "id": 1,
      "name": "Free Museum Entry",
      "rewardType": "discount"
    },
    "pointsSpent": 200,
    "redemptionCode": "RWD-1731425000-ABC123",
    "status": "redeemed",
    "redeemedAt": "2025-11-12T16:00:00Z"
  }
]
```

---

## 11. Historical Module (NEW)

### POST /historical/battalions

Create a historical battalion record.

**Access**: Protected

**Request Body**:

```json
{
  "name": "116th Infantry Regiment",
  "country": "United States",
  "militaryUnit": "29th Infantry Division",
  "period": "June 6-7, 1944",
  "description": "Landed on Omaha Beach Dog Green sector. Suffered heavy casualties but secured beachhead."
}
```

**Response** (201):

```json
{
  "id": 1,
  "name": "116th Infantry Regiment",
  "country": "United States",
  "militaryUnit": "29th Infantry Division",
  "period": "June 6-7, 1944",
  "createdAt": "2025-11-12T10:00:00Z"
}
```

### GET /historical/battalions

List all battalions.

**Access**: Public

**Response** (200):

```json
[
  {
    "id": 1,
    "name": "116th Infantry Regiment",
    "country": "United States",
    "militaryUnit": "29th Infantry Division",
    "period": "June 6-7, 1944"
  }
]
```

### POST /historical/routes

Link battalion to a parcours (route they took).

**Access**: Protected

**Request Body**:

```json
{
  "battalionId": 1,
  "parcoursId": 1,
  "routeDate": "1944-06-06",
  "historicalContext": "Advance inland from Omaha Beach to Vierville-sur-Mer"
}
```

**Response** (201):

```json
{
  "id": 1,
  "battalionId": 1,
  "parcoursId": 1,
  "routeDate": "1944-06-06",
  "historicalContext": "Advance inland from Omaha Beach to Vierville-sur-Mer",
  "createdAt": "2025-11-12T11:00:00Z"
}
```

### GET /historical/routes/parcours/:parcoursId

Get all battalions that used a specific route.

**Access**: Public

**Response** (200):

```json
[
  {
    "id": 1,
    "routeDate": "1944-06-06",
    "historicalContext": "Advance inland...",
    "battalion": {
      "id": 1,
      "name": "116th Infantry Regiment",
      "country": "United States",
      "militaryUnit": "29th Infantry Division"
    }
  }
]
```

---

## Error Responses

All endpoints follow standard HTTP status codes:

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Parcours with ID 999 not found",
  "error": "Not Found"
}
```

### 409 Conflict

```json
{
  "statusCode": 409,
  "message": "You have already found this treasure",
  "error": "Conflict"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Points Economy System

### Earning Points

| Action               | Points   | Notes                            |
| -------------------- | -------- | -------------------------------- |
| Complete parcours    | Variable | Based on distance and difficulty |
| Visit POI            | 5-20     | Varies by POI                    |
| Scan QR code         | +5       | Bonus for QR verification        |
| Listen to audio      | +5       | Bonus for audio completion       |
| Complete quiz (≥50%) | 25-100   | Based on difficulty              |
| Find treasure        | 50-150   | Based on difficulty              |
| Complete challenge   | 100-300  | Based on difficulty multiplier   |

### Spending Points

| Reward Type     | Cost Range |
| --------------- | ---------- |
| Digital Badges  | 50-100     |
| Discounts       | 100-300    |
| Physical Gifts  | 200-500    |
| Premium Content | 150-400    |

---

## Data Relationships

### Parcours Relationships

- **Has Many**: POIs, Podcasts, Quizzes, Treasure Hunts
- **Used By**: Activities, Historical Battalions (via routes)

### User Relationships

- **Has Many**: Activities, Quiz Attempts, Treasure Finds, Reward Redemptions, Challenge Progress, POI Visits

### Activity Relationships

- **Belongs To**: User, Parcours
- **Has Many**: POI Visits, Challenge Progress

---

## Pagination

For endpoints returning lists, pagination is supported via query parameters:

```
GET /api/v1/parcours?page=2&limit=10
```

**Parameters**:

- `page` (default: 1)
- `limit` (default: 20, max: 100)

**Response includes metadata**:

```json
{
  "data": [...],
  "meta": {
    "page": 2,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

## Rate Limiting

API calls are rate-limited to prevent abuse:

- **Authenticated**: 100 requests per minute
- **Public**: 60 requests per minute

Headers include rate limit info:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1731426000
```

---

## Webhooks (Future)

Planned webhook support for:

- Activity completion
- Points milestones
- Reward redemption
- Treasure discovery

---

## SDKs and Client Libraries

Official SDKs available:

- JavaScript/TypeScript (npm: `@historando/sdk`)
- React Native (npm: `@historando/react-native`)
- Flutter (pub: `historando_sdk`)

---

## Support

- **Documentation**: https://docs.historando.fr
- **API Status**: https://status.historando.fr
- **Email**: api@historando.fr
- **Discord**: https://discord.gg/historando

---

## Changelog

### v1.0.0 (2025-11-12)

- Initial release
- 11 modules, 92 endpoints
- JWT authentication
- Points economy system
- GPS-based features
- Comprehensive Swagger documentation
