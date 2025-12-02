# Admin Dashboard API Documentation

## Overview

The Admin Dashboard provides comprehensive management and analytics capabilities for the HistoRando platform. All endpoints require admin authentication.

## Authentication

All admin endpoints require:
1. Valid JWT token in the Authorization header
2. User role set to `admin`

```
Authorization: Bearer <admin_token>
```

## Endpoints

### 1. Get Dashboard Statistics

**Endpoint**: `GET /api/v1/admin/stats`

**Description**: Returns comprehensive platform statistics including user metrics, content counts, and activity analytics.

**Response Example**:
```json
{
  "users": {
    "total": 1250,
    "newLast30Days": 85,
    "newLast7Days": 12,
    "pmrUsers": 230,
    "totalPoints": 125000,
    "totalKm": 4580.5
  },
  "content": {
    "parcours": {
      "total": 45,
      "active": 42
    },
    "pois": 320,
    "quizzes": {
      "total": 78,
      "active": 75
    },
    "challenges": 25,
    "treasures": 150,
    "rewards": {
      "total": 50,
      "available": 42
    },
    "podcasts": 180
  },
  "activity": {
    "totalActivities": 5420,
    "completedActivities": 4210,
    "activitiesLast30Days": 420,
    "completionRate": "77.68",
    "poiVisits": 8540,
    "quizAttempts": 3250,
    "quizPassRate": "68.50",
    "challengesCompleted": 1240,
    "treasuresFound": 2850,
    "rewardsRedeemed": 840
  }
}
```

---

### 2. List All Users

**Endpoint**: `GET /api/v1/admin/users`

**Description**: Returns a paginated list of all users with optional filtering.

**Query Parameters**:
- `limit` (optional): Number of users per page (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `role` (optional): Filter by role (`user` or `admin`)
- `isPmr` (optional): Filter by PMR status (`true` or `false`)

**Example Request**:
```
GET /api/v1/admin/users?limit=20&offset=0&role=user&isPmr=true
```

**Response Example**:
```json
{
  "total": 1250,
  "users": [
    {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isPmr": false,
      "totalPoints": 850,
      "totalKm": 42.5,
      "registrationDate": "2025-01-15T10:00:00Z"
    }
  ],
  "limit": 20,
  "offset": 0
}
```

---

### 3. Get User Details

**Endpoint**: `GET /api/v1/admin/users/:id`

**Description**: Returns detailed information about a specific user, including recent activities.

**Path Parameters**:
- `id`: User ID

**Response Example**:
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user",
  "isPmr": false,
  "totalPoints": 850,
  "totalKm": 42.5,
  "avatarUrl": "https://example.com/avatar.jpg",
  "phoneNumber": "+33612345678",
  "registrationDate": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-11-20T14:30:00Z",
  "activities": [...],
  "poiVisits": [...],
  "quizAttempts": [...]
}
```

---

### 4. Update User Role

**Endpoint**: `PUT /api/v1/admin/users/:id/role`

**Description**: Updates a user's role (promotes to admin or demotes to regular user).

**Path Parameters**:
- `id`: User ID

**Request Body**:
```json
{
  "role": "admin"
}
```

**Allowed Values**:
- `user`: Regular user
- `admin`: Administrator

**Response Example**:
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "role": "admin"
}
```

---

### 5. Delete User

**Endpoint**: `DELETE /api/v1/admin/users/:id`

**Description**: Permanently deletes a user account and all associated data.

**Path Parameters**:
- `id`: User ID

**Response Example**:
```json
{
  "message": "User deleted successfully"
}
```

**Warning**: This action is irreversible. All user data including activities, quiz attempts, and progress will be deleted.

---

### 6. Get Recent Activities

**Endpoint**: `GET /api/v1/admin/activities/recent`

**Description**: Returns the most recent user activities across the platform.

**Query Parameters**:
- `limit` (optional): Number of activities to return (default: 20)

**Example Request**:
```
GET /api/v1/admin/activities/recent?limit=10
```

**Response Example**:
```json
[
  {
    "id": 1,
    "userId": 15,
    "parcoursId": 3,
    "startTime": "2025-12-02T10:30:00Z",
    "endTime": "2025-12-02T13:45:00Z",
    "isCompleted": true,
    "totalDistanceKm": 12.5,
    "totalPoints": 125,
    "user": {
      "id": 15,
      "username": "explorer123",
      "email": "explorer@example.com"
    },
    "parcours": {
      "id": 3,
      "name": "Omaha Beach Trail",
      "difficultyLevel": "medium"
    }
  }
]
```

---

### 7. Get Content Statistics

**Endpoint**: `GET /api/v1/admin/stats/content`

**Description**: Returns statistics about content distribution across the platform.

**Response Example**:
```json
{
  "parcoursByDifficulty": [
    { "difficultyLevel": "easy", "count": 15 },
    { "difficultyLevel": "medium", "count": 20 },
    { "difficultyLevel": "hard", "count": 10 }
  ],
  "poisByType": [
    { "poiType": "bunker", "count": 80 },
    { "poiType": "memorial", "count": 120 },
    { "poiType": "museum", "count": 50 },
    { "poiType": "battlefield", "count": 70 }
  ]
}
```

---

### 8. Get User Growth Statistics

**Endpoint**: `GET /api/v1/admin/stats/user-growth`

**Description**: Returns user registration trends over time.

**Query Parameters**:
- `days` (optional): Number of days to analyze (default: 30)

**Example Request**:
```
GET /api/v1/admin/stats/user-growth?days=7
```

**Response Example**:
```json
[
  { "date": "2025-11-25", "newUsers": 5 },
  { "date": "2025-11-26", "newUsers": 8 },
  { "date": "2025-11-27", "newUsers": 3 },
  { "date": "2025-11-28", "newUsers": 12 },
  { "date": "2025-11-29", "newUsers": 7 },
  { "date": "2025-11-30", "newUsers": 9 },
  { "date": "2025-12-01", "newUsers": 6 }
]
```

---

## Error Responses

### 401 Unauthorized
**Reason**: Missing or invalid authentication token
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
**Reason**: User does not have admin role
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### 404 Not Found
**Reason**: Requested user or resource does not exist
```json
{
  "statusCode": 404,
  "message": "User with ID 999 not found"
}
```

### 400 Bad Request
**Reason**: Invalid request parameters
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [...]
}
```

---

## Usage Examples

### 1. Getting Dashboard Overview

```bash
curl -X GET "http://localhost:3000/api/v1/admin/stats" \
  -H "Authorization: Bearer <admin_token>"
```

### 2. Listing All PMR Users

```bash
curl -X GET "http://localhost:3000/api/v1/admin/users?isPmr=true&limit=50" \
  -H "Authorization: Bearer <admin_token>"
```

### 3. Promoting User to Admin

```bash
curl -X PUT "http://localhost:3000/api/v1/admin/users/123/role" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

### 4. Viewing Recent Activity

```bash
curl -X GET "http://localhost:3000/api/v1/admin/activities/recent?limit=5" \
  -H "Authorization: Bearer <admin_token>"
```

### 5. Analyzing User Growth

```bash
curl -X GET "http://localhost:3000/api/v1/admin/stats/user-growth?days=14" \
  -H "Authorization: Bearer <admin_token>"
```

---

## Dashboard Metrics Explanation

### User Metrics
- **total**: Total number of registered users
- **newLast30Days**: Users registered in the last 30 days
- **newLast7Days**: Users registered in the last 7 days
- **pmrUsers**: Users with reduced mobility accessibility needs
- **totalPoints**: Cumulative points earned by all users
- **totalKm**: Total kilometers traveled by all users

### Content Metrics
- **parcours.total**: Total number of trails/routes
- **parcours.active**: Number of currently active trails
- **pois**: Total points of interest
- **quizzes.total**: Total number of quizzes
- **quizzes.active**: Number of active quizzes
- **challenges**: Total challenges available
- **treasures**: Total treasure hunt items
- **rewards.total**: Total rewards in the system
- **rewards.available**: Currently available rewards
- **podcasts**: Total audio content items

### Activity Metrics
- **totalActivities**: Total user activity sessions
- **completedActivities**: Successfully completed activities
- **activitiesLast30Days**: Activities started in the last 30 days
- **completionRate**: Percentage of activities completed
- **poiVisits**: Total POI check-ins
- **quizAttempts**: Total quiz attempts
- **quizPassRate**: Percentage of quizzes passed
- **challengesCompleted**: Total challenges completed
- **treasuresFound**: Total treasures discovered
- **rewardsRedeemed**: Total rewards claimed

---

## Best Practices

1. **Performance**: Use pagination for large datasets
2. **Caching**: Consider caching dashboard statistics for better performance
3. **Monitoring**: Track admin actions for audit purposes
4. **Rate Limiting**: Implement rate limiting for admin endpoints
5. **Backup**: Always backup data before bulk deletions

---

## Security Considerations

- Admin endpoints are protected by both authentication and role-based authorization
- All user passwords are excluded from responses
- Sensitive operations (delete, role changes) should be logged
- Consider implementing 2FA for admin accounts
- Regular security audits recommended

---

## Future Enhancements

- [ ] Export users to CSV
- [ ] Bulk user operations
- [ ] Advanced filtering and search
- [ ] Real-time dashboard updates via WebSocket
- [ ] Detailed audit logs
- [ ] Custom report generation
- [ ] Email notifications for critical events
- [ ] Data analytics and visualization
