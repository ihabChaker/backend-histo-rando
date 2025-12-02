# Recent Changes Summary

## Date: December 2, 2025

### Overview

Fixed E2E test failures caused by database schema changes and new features. All tests are now passing (93 unit tests + 147 E2E tests).

---

## New Features Added

### 1. **Role-Based Access Control (RBAC)**

- Added `role` field to User entity (`user` | `admin`)
- Created `RolesGuard` for role-based authorization
- Created `@Roles()` decorator for protecting admin routes
- Updated JWT payload to include user role

**Files Modified:**

- `src/modules/users/entities/user.entity.ts` - Added role column
- `src/common/guards/roles.guard.ts` - New guard
- `src/common/decorators/roles.decorator.ts` - New decorator
- `src/common/types/auth.types.ts` - Updated JWT payload interface
- `src/modules/auth/auth.service.ts` - Include role in token
- `src/modules/auth/auth.module.ts` - Made module global, added RolesGuard

### 2. **Admin Module**

New admin-only endpoints for system management.

**New Files:**

- `src/modules/admin/admin.module.ts`
- `src/modules/admin/admin.controller.ts`
- `src/modules/admin/admin.service.ts`

**Endpoints:**

- `GET /api/v1/admin/stats` - Dashboard statistics (Admin only)

### 3. **Badge System & Leaderboard**

Gamification features with badges and user rankings.

**New Files:**

- `src/modules/badge/badge.module.ts`
- `src/modules/badge/badge.controller.ts`
- `src/modules/badge/badge.service.ts`
- `src/modules/badge/leaderboard.controller.ts`
- `src/modules/badge/entities/badge.entity.ts`
- `src/modules/badge/entities/user-badge.entity.ts`
- `src/modules/badge/dto/badge.dto.ts`

**Endpoints:**

- `POST /api/v1/badges` - Create badge (Admin)
- `GET /api/v1/badges` - List all badges
- `GET /api/v1/badges/my-badges` - Get my badges
- `GET /api/v1/badges/:id` - Get badge by ID
- `PATCH /api/v1/badges/:id` - Update badge (Admin)
- `DELETE /api/v1/badges/:id` - Delete badge (Admin)
- `GET /api/v1/leaderboard` - Get leaderboard

### 4. **Enhanced User Management**

Admin endpoints for managing users.

**Files Modified:**

- `src/modules/users/users.controller.ts` - Added admin routes
- `src/modules/users/users.service.ts` - Added admin methods
- `src/modules/users/dto/user.dto.ts` - Added AdminUpdateUserDto

**New Endpoints:**

- `GET /api/v1/users` - List all users (Admin)
- `PUT /api/v1/users/:id` - Update user (Admin)
- `DELETE /api/v1/users/:id` - Delete user (Admin)

### 5. **Enhanced Challenge System**

Made challenges more flexible.

**Files Modified:**

- `src/modules/challenge/challenge.controller.ts` - Added alias routes
- `src/modules/challenge/challenge.service.ts` - Made activityId optional
- `src/modules/challenge/dto/challenge.dto.ts` - activityId is now optional

**Changes:**

- `activityId` is now optional when starting a challenge
- Added alias routes: `GET /api/v1/challenges/active`, `GET /api/v1/challenges/my-challenges`

### 6. **Enhanced Treasure Hunt**

QR code support and improved treasure finding.

**Files Modified:**

- `src/modules/treasure-hunt/treasure-hunt.service.ts` - QR code scanning
- `src/modules/treasure-hunt/dto/treasure-hunt.dto.ts` - Added qrCode field

**Changes:**

- Find treasures by QR code OR by location
- `treasureId` is now optional (can find by QR code alone)
- Removed `isActive` filter from findAllTreasureHunts

### 7. **Enhanced POI System**

**Files Modified:**

- `src/modules/poi/poi.controller.ts` - Added GET /api/v1/poi route
- `src/modules/poi/poi.service.ts` - Added findAll() method

**New Endpoints:**

- `GET /api/v1/poi` - List all POIs

---

## Database Changes

### User Table

Added new column:

```sql
ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user';
```

### New Tables

Created tables for badge system:

- `badges` - Badge definitions
- `user_badges` - User-badge relationships

---

## Scripts Added

### Database Sync Script

**File:** `src/scripts/sync-db.ts`

```bash
npm run db:sync
```

Syncs the User model schema with the database (adds missing columns).

### Admin Creation Script

**File:** `src/scripts/create-admin.ts`

```bash
npm run admin:create
```

Creates an admin user:

- Email: `admin@historando.com`
- Password: `adminpassword123`
- Username: `admin`

---

## Test Fixes

### E2E Test Updates

All E2E test files updated to use proper Sequelize instance management:

**Files Modified:**

- `test/activity.e2e-spec.ts`
- `test/challenge.e2e-spec.ts`
- `test/historical.e2e-spec.ts`
- `test/media.e2e-spec.ts`
- `test/parcours-full.e2e-spec.ts`
- `test/poi.e2e-spec.ts`
- `test/quiz.e2e-spec.ts`
- `test/reward.e2e-spec.ts`
- `test/treasure-hunt.e2e-spec.ts`
- `test/users.e2e-spec.ts`

**Changes:**

- Removed standalone `setupTestDatabase()` and `closeDatabase()` calls
- Use Sequelize instance from NestJS app
- Added `setSequelizeInstance()` helper function

### Unit Test Updates

**Files Modified:**

- `src/modules/users/users.controller.spec.ts` - Added role to mock JWT payload

---

## Test Results

### Unit Tests ✅

```
Test Suites: 29 passed, 29 total
Tests:       93 passed, 93 total
```

### E2E Tests ✅

```
Test Suites: 13 passed, 13 total
Tests:       147 passed, 147 total
```

### Build ✅

```
webpack 5.97.1 compiled successfully
```

---

## Breaking Changes

⚠️ **Authentication Response Updated**
The auth response now includes the `role` field:

**Before:**

```json
{
  "access_token": "...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "user"
  }
}
```

**After:**

```json
{
  "access_token": "...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "user",
    "role": "user"
  }
}
```

⚠️ **JWT Payload Updated**
The JWT now includes the `role` claim:

```typescript
interface JwtPayload {
  sub: number;
  email: string;
  username: string;
  role: 'user' | 'admin'; // NEW
}
```

---

## Migration Steps

### For Existing Database

1. **Sync the database schema:**

```bash
npm run db:sync
```

2. **Create an admin user:**

```bash
npm run admin:create
```

3. **Run tests to verify:**

```bash
npm test
npm run test:e2e
```

### For New Database

Database schema will be created automatically on first run.

---

## Environment Variables

No new environment variables required. All changes are backward compatible.

---

## API Documentation

Swagger documentation has been updated automatically. Access at:

```
http://localhost:3000/api/docs
```

New admin routes are marked with `@Roles('admin')` decorator.

---

## Security Considerations

1. **Admin Routes Protected:** All admin endpoints require both authentication AND admin role
2. **Global Guards:** `JwtAuthGuard` and `RolesGuard` are now global (applied to all routes by default)
3. **Public Routes:** Use `@Public()` decorator to bypass authentication
4. **Role Verification:** `RolesGuard` checks user role from JWT payload

---

## Next Steps

### Recommended Actions:

1. **Update Frontend:**
   - Handle `role` field in auth response
   - Implement role-based UI components
   - Add admin panel routes

2. **Test Admin Features:**
   - Login as admin: `admin@historando.com` / `adminpassword123`
   - Test admin-only endpoints
   - Verify role-based access control

3. **Badge System Setup:**
   - Create initial badges via admin panel
   - Define badge requirements
   - Test badge awarding logic

4. **Production Deployment:**
   - Run `npm run db:sync` on production database
   - Create admin user on production
   - Test all new endpoints

---

## Files Changed Summary

**New Files (21):**

- Admin module (3 files)
- Badge system (7 files)
- Common guards/decorators (2 files)
- Scripts (2 files)
- Test helpers (1 file)
- Other (6 files)

**Modified Files (25):**

- Auth system (3 files)
- User management (4 files)
- Challenge system (3 files)
- Treasure hunt (2 files)
- POI system (2 files)
- E2E tests (10 files)
- Config files (1 file)

---

## Support

For issues or questions:

1. Check test output: `npm test` and `npm run test:e2e`
2. Review error logs
3. Verify database schema is synced
4. Ensure admin user exists

---

_Last Updated: December 2, 2025_
