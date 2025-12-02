# Route Ordering Fix - PUT /users/me Returns 403

## Issue Summary

After adding admin endpoints to `users.controller.ts`, the `PUT /users/me` endpoint started returning `403 Forbidden` for regular users, while `PATCH /users/me` and `GET /users/me` worked correctly.

## Root Cause

**Route ordering conflict in NestJS routing**

When admin endpoints were added, the route registration order became:

```typescript
@Put(':id')      // Line 38 - Admin route with :id parameter
@Roles('admin')
// ...

@Put('me')       // Line 108 - User route with specific 'me' path
// No @Roles decorator (accessible to all authenticated users)
```

### Why This Caused the Problem

1. NestJS evaluates routes in the order they appear in the controller
2. When a PUT request came to `/users/me`, NestJS matched it to `@Put(':id')` first
3. The router treated `'me'` as a value for the `:id` parameter
4. Since `@Put(':id')` had `@Roles('admin')`, regular users got `403 Forbidden`
5. `PATCH /users/me` worked because it came before `@Patch(':id')` (or no :id PATCH existed)
6. `GET /users/me` worked because it was defined before `@Get(':id')`

## Solution

**Move specific routes before parameterized routes**

NestJS routing rule: Specific path segments must be defined before parameterized routes (`:'param'`).

### Changes Made

Reordered routes in `src/modules/users/users.controller.ts`:

```typescript
// ✅ CORRECT ORDER:
@Get()                  // Admin - list all users
@Roles('admin')

// User-specific routes FIRST (before :id)
@Get('me')             // User route - specific path
@Get('me/stats')       // User route - specific path
@Put('me')             // User route - specific path
@Patch('me')           // User route - specific path

// Admin parameterized routes LAST (after specific paths)
@Put(':id')            // Admin route - parameterized
@Roles('admin')
@Delete(':id')         // Admin route - parameterized
@Roles('admin')
@Get(':id')            // Public route - parameterized
```

## Testing

### Local Tests

```bash
# All E2E tests pass
npm run test:e2e
# Result: 14 test suites, 172 tests passed
```

### Deployed Tests

```bash
# Test against production API
SKIP_DEPLOYED_TESTS=false npm run test:e2e -- test/deployed.e2e-spec.ts
# Result: 13/13 tests passed (including PUT /users/me)
```

### Manual Verification

```bash
# Register user and test PUT endpoint
curl -X POST https://histo-rando-backend-egvh3.ondigitalocean.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "username": "test", "password": "TestPassword123!"}'

# Update profile with PUT
curl -X PUT https://histo-rando-backend-egvh3.ondigitalocean.app/api/v1/users/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John", "lastName": "Doe"}'

# ✅ Returns 200 OK with updated profile
```

## Commit Details

- **Main Branch**: `aac861b` - "fix: reorder routes - specific '/me' routes must come before parameterized ':id' routes"
- **Deploy Branch**: `7e36611` - Merged to deploy and deployed to DigitalOcean
- **Deployment**: Auto-deployed via DigitalOcean App Platform

## Key Takeaways

1. **Route Order Matters**: In NestJS, route matching is first-come-first-served
2. **Specific Before Parameters**: Always define specific paths (`/me`, `/stats`) before parameterized paths (`:id`)
3. **Testing Caught It**: E2E tests against deployed API detected the issue
4. **Same Logic, Different Methods**: PUT vs PATCH behaved differently due to route order

## Prevention

- When adding parameterized routes (`:id`, `:slug`, etc.), always place them **after** all specific routes
- Group routes logically with comments
- Run E2E tests against deployed environment to catch routing issues early

## Related Files

- `src/modules/users/users.controller.ts` - Fixed route ordering
- `test/deployed.e2e-spec.ts` - Tests that caught the issue
- `test/users.e2e-spec.ts` - Local tests for user endpoints

---

**Status**: ✅ FIXED
**Date**: 2025-12-02
**All Tests**: PASSING (172/172 local E2E, 13/13 deployed)
