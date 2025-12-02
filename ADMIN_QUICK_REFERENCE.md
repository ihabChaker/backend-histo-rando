# Admin Dashboard - Quick Reference

## 🔑 Authentication

```bash
# All requests require admin JWT token
Authorization: Bearer <admin_token>
```

## 📊 Endpoints Cheat Sheet

### Dashboard Stats
```bash
GET /api/v1/admin/stats
# Returns: user metrics, content stats, activity analytics
```

### User Management
```bash
# List users (with optional filters)
GET /api/v1/admin/users?limit=50&offset=0&role=user&isPmr=true

# Get user details
GET /api/v1/admin/users/:id

# Update user role
PUT /api/v1/admin/users/:id/role
Body: {"role": "admin"}

# Delete user
DELETE /api/v1/admin/users/:id
```

### Analytics
```bash
# Recent activities
GET /api/v1/admin/activities/recent?limit=20

# Content distribution
GET /api/v1/admin/stats/content

# User growth trends
GET /api/v1/admin/stats/user-growth?days=30
```

## 📈 Response Examples

### Dashboard Stats
```json
{
  "users": { "total": 1250, "newLast30Days": 85, "pmrUsers": 230 },
  "content": { "parcours": { "total": 45 }, "pois": 320 },
  "activity": { "totalActivities": 5420, "completionRate": "77.68" }
}
```

### User List
```json
{
  "total": 1250,
  "users": [{"id": 1, "username": "john", "email": "john@ex.com", "role": "user"}],
  "limit": 50,
  "offset": 0
}
```

### User Growth
```json
[
  { "date": "2025-11-30", "newUsers": 5 },
  { "date": "2025-12-01", "newUsers": 8 }
]
```

## ⚡ Common Tasks

### Create Admin User
```sql
-- After registration, update role in database
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### Postman Collection
```bash
# Import OpenAPI spec
GET http://localhost:3000/api-json
```

### Filter Examples
```bash
# Only admin users
GET /api/v1/admin/users?role=admin

# Only PMR users
GET /api/v1/admin/users?isPmr=true

# Combine filters
GET /api/v1/admin/users?role=user&isPmr=false&limit=10
```

## 🔒 Security

- ✅ JWT required
- ✅ Admin role required
- ✅ Passwords excluded from responses
- ✅ Input validation with DTOs

## 🧪 Testing

```bash
# Run admin E2E tests
npm run test:e2e admin.e2e-spec

# Run all E2E tests
npm run test:e2e -- --runInBand
```

## 📚 Documentation

- Full API Docs: `ADMIN_DASHBOARD_DOCUMENTATION.md`
- Module Docs: `src/modules/admin/README.md`
- Implementation Summary: `ADMIN_IMPLEMENTATION_SUMMARY.md`
- Swagger UI: http://localhost:3000/api/docs
