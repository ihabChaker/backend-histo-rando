# Production Deployment Checklist

## Pre-Deployment

- [x] All linting errors fixed
- [x] All unit tests passing (29 suites, 93 tests)
- [x] All E2E tests passing (14 suites, 172 tests)
- [x] Build successful
- [x] Migration file created and tested

## Deployment Steps

### 1. Push Code to Repository

```bash
git add .
git commit -m "fix: add role column migration and fix schema issues"
git push origin main
```

### 2. Wait for CI/CD to Deploy

Monitor the deployment pipeline to ensure:

- Build completes successfully
- Code is deployed to production

### 3. Run Database Migration on Production

After code is deployed, run the migration:

**Option A: Via Heroku CLI (if using Heroku)**

```bash
heroku run npm run migration:run -a your-app-name
```

**Option B: Via DigitalOcean Console or SSH**

```bash
# SSH into your app
cd /workspace
npm run migration:run
```

**Option C: Via DigitalOcean App Platform (Recommended)**

Add a migration job in your app spec:

```yaml
jobs:
  - name: db-migrate
    kind: PRE_DEPLOY
    run_command: npm run migration:run
```

### 4. Verify Migration Success

Check the application logs:

```bash
# Look for migration success messages
heroku logs --tail -a your-app-name
# or
doctl apps logs your-app-id --follow
```

Expected output:

```
Adding role column to Users table...
✅ Role column added successfully
```

### 5. Test Application Endpoints

Test critical endpoints:

1. **User Registration**

   ```bash
   curl -X POST https://your-app.com/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "test@example.com",
       "password": "SecurePassword123!"
     }'
   ```

2. **User Login**

   ```bash
   curl -X POST https://your-app.com/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "SecurePassword123!"
     }'
   ```

3. **Admin Login** (if admin user exists)

### 6. Monitor Application

Monitor for 15-30 minutes after deployment:

- Check error logs
- Monitor database connections
- Verify user registrations work
- Test mobile app login

## Rollback Plan (if needed)

If issues occur:

```bash
# Rollback migration
heroku run npm run migration:revert -a your-app-name
# or
npm run migration:revert

# Rollback code deployment (platform-specific)
heroku rollback -a your-app-name
# or
doctl apps deployment rollback your-app-id
```

## Changes in This Deployment

### Schema Changes

- Added `role` column to `Users` table (ENUM: 'user', 'admin', default: 'user')
- Added index on `role` column
- Renamed `password` to `passwordHash` (if applicable)

### Code Changes

- Fixed linting errors in admin and badge modules
- Fixed admin service to use correct entity field names
- Added role validation in admin controller
- Fixed admin E2E tests (re-authentication after role change)

### New Files

- `src/database/migrations/20251202000000-add-role-to-users.js`
- `scripts/run-migration-production.sh`
- `MIGRATION_GUIDE.md`
- `DEPLOYMENT_CHECKLIST.md` (this file)

## Post-Deployment Verification

- [ ] User registration works
- [ ] User login works
- [ ] Admin endpoints accessible (with admin token)
- [ ] Regular users cannot access admin endpoints
- [ ] Mobile app login successful
- [ ] No error spikes in logs
- [ ] Database connections stable

## Contact & Support

If you encounter issues:

1. Check application logs
2. Check database migration status: `SELECT * FROM SequelizeMeta;`
3. Verify database schema: `DESCRIBE Users;`
4. Review `MIGRATION_GUIDE.md` for troubleshooting

## Notes

- Migration is idempotent (safe to run multiple times)
- Existing users will automatically get `role = 'user'`
- Admin users must be promoted manually (see `scripts/create-admin.ts`)
