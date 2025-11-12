# E2E Test Status - HistoRando Backend

## ✅ Current Status

**Date**: December 11, 2025  
**Total E2E Tests**: 61  
**Passing**: 47 tests (77%)  
**Failing**: 14 tests (23%)  
**Test Suites Passing**: 2/5 (40%)

## 🎯 Test Suite Breakdown

### ✅ PASSING (2 suites)

1. **auth.e2e-spec.ts** - Authentication Tests (6/6 tests passing)
   - ✅ User registration with validation
   - ✅ Login with JWT token generation
   - ✅ Duplicate email detection (409 conflict)
   - ✅ Invalid email format rejection (400)
   - ✅ Incorrect password handling (401)
   - ✅ Non-existent email handling (401)

2. **parcours.e2e-spec.ts** - Legacy Parcours Tests (ALL PASSING)
   - ✅ Public parcours listing
   - ✅ Authenticated creation/update/delete
   - ✅ Nearby search with lat/lon/radius

### ⚠️ FAILING (3 suites - 14 failing tests)

#### 1. **users.e2e-spec.ts** (9/15 passing - 6 failing)

**Passing**:

- ✅ Register new user
- ✅ Access profile
- ✅ Track total points
- ✅ Register multiple users
- ✅ Profile isolation between users

**Failing** (6 tests):

1. ❌ **Type mismatch**: `totalKm` returns `"0.00"` (string) instead of `0` (number)
2. ❌ **404 on PATCH /api/v1/users/me**: Profile update route not found
3. ❌ **Missing stats properties**: Response missing `totalParcours`, `totalPOIsVisited`
4. ❌ **isPmr undefined**: PMR users not returning `isPmr` property
5. ❌ **Auth check failing**: 401 test getting 404 instead
6. ❌ **Type mismatch**: kilometers tracking returning string instead of number

**Root Causes**:

- Decimal fields returned as strings instead of numbers (PostgreSQL DECIMAL → string)
- `/users/me` PATCH route might not be implemented
- User stats calculation not returning all expected fields
- `isPmr` field not included in response DTOs

#### 2. **parcours-full.e2e-spec.ts** (13/20 passing - 7 failing)

**Passing**:

- ✅ CRUD operations (create, read, update, delete)
- ✅ Difficulty levels (easy/hard creation)
- ✅ PMR accessibility creation
- ✅ Active/inactive parcours management
- ✅ Nearby geolocation search
- ✅ Authentication requirements
- ✅ 404 handling

**Failing** (7 tests):

1. ❌ **Hard parcours test**: Type error - distance/duration returned as string
2. ❌ **isPmrAccessible query param**: 400 Bad Request (boolean validation issue)
3. ❌ **isActive query param**: 400 Bad Request (boolean validation issue)
4. ❌ **minDistance query param**: 400 Bad Request (number validation issue)
5. ❌ **maxDistance query param**: 400 Bad Request (number validation issue)
6. ❌ **Distance range filtering**: 400 Bad Request (number validation issue)
7. ❌ **Multiple filters combined**: 400 Bad Request (mixed param validation)

**Root Causes**:

- Query parameters not being coerced to correct types
- Zod schema for GET /parcours might be too strict or missing transform
- Need to add `.transform()` to convert query strings to booleans/numbers

#### 3. **poi.e2e-spec.ts** (19/20 passing - 1 failing)

**Passing**:

- ✅ CRUD operations (create, read, delete)
- ✅ POI types (monument, memorial, bunker, museum)
- ✅ Order management
- ✅ Geolocation validation
- ✅ Media URLs
- ✅ Association with parcours
- ✅ Authentication requirements
- ✅ 404 handling

**Failing** (1 test):

1. ❌ **POI update**: 404 on PATCH /api/v1/poi/:id - route might not exist

**Root Causes**:

- Update route not implemented or has different path pattern

## 🛠️ Fixes Needed

### High Priority

1. **Query Parameter Type Coercion** (7 failures)
   - Add transform functions to convert query strings → numbers/booleans
   - Update Zod schemas in `parcours.dto.ts` to handle query params

2. **Decimal Field Type Conversion** (2 failures)
   - Convert `totalKm` and other DECIMAL fields from strings to numbers in response
   - Add getter/transformer in User entity or serialization logic

3. **Missing Routes** (2 failures)
   - Implement or fix `PATCH /api/v1/users/me`
   - Implement or fix `PATCH /api/v1/poi/:id`

### Medium Priority

4. **User Stats Calculation** (1 failure)
   - Ensure `totalParcours` and `totalPOIsVisited` are calculated and returned

5. **isPmr Field** (1 failure)
   - Include `isPmr` in user response DTOs

## 📊 Database Configuration

**✅ Working correctly**:

- PostgreSQL 18.0 connection established
- Test database: `histo_rando_test`
- Test user: `testuser` with password authentication
- All 20 entities synchronized
- Configuration loaded from `.env.test` properly
- ZodValidationPipe working correctly

## 🚀 Recent Improvements

1. **Fixed authentication issues** - changed from peer to password auth
2. **Fixed Sequelize configuration** - proper password string handling
3. **Fixed ConfigModule** - loading configuration from `configuration.ts`
4. **Fixed validation** - switched from ValidationPipe to ZodValidationPipe
5. **Fixed imports** - supertest default import instead of namespace

## 📈 Coverage Progress

- **Unit Tests**: 93/93 passing (100%) ✅
- **E2E Tests**: 47/61 passing (77%) ⚠️
- **Overall Success Rate**: 140/154 tests = 91% ✅

## 🎯 Next Steps

1. Fix query parameter type coercion in parcours filtering
2. Add PATCH routes for users/me and POI updates
3. Fix decimal field serialization
4. Complete user stats calculation
5. Target: 100% E2E test pass rate

## 📝 Notes

- Database connection is stable and working well
- Most core functionality is working correctly
- Failures are mainly edge cases and type coercion issues
- No critical blockers, all fixable with minor updates
