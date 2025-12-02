# Database Migration Guide

## Running Migrations on Production

### Prerequisites

- Access to the production database
- `DATABASE_URL` environment variable configured correctly

### Step 1: Deploy the Migration Files

Ensure the new migration files are deployed to production:

- `src/database/migrations/20251202000000-add-role-to-users.js`

### Step 2: Run Migrations

#### Option A: Using the provided script (Recommended)

```bash
# From the backend directory
./scripts/run-migration-production.sh
```

#### Option B: Manual execution

```bash
# Set the NODE_ENV to production
export NODE_ENV=production

# Run migrations
npx sequelize-cli db:migrate
```

### Step 3: Verify Migration

After running the migration, verify that:

1. The `role` column exists in the `Users` table
2. The column has default value 'user'
3. Existing users have been assigned the 'user' role
4. The `passwordHash` column exists (renamed from `password` if needed)

```sql
-- Check the Users table structure
DESCRIBE Users;

-- Verify all users have a role
SELECT id, username, email, role FROM Users LIMIT 10;
```

### Step 4: Test the Application

1. Try logging in as a regular user
2. Try registering a new user
3. Verify admin functionalities work correctly

## Migration Details

### Migration: 20251202000000-add-role-to-users.js

**Changes:**

- Adds `role` ENUM column ('user', 'admin') with default 'user'
- Adds index on `role` column for performance
- Renames `password` to `passwordHash` if needed (for schema consistency)

**Rollback:**
To rollback this migration if needed:

```bash
npx sequelize-cli db:migrate:undo
```

## Troubleshooting

### Error: "Unknown column 'role' in 'field list'"

**Solution:** Run the migration to add the role column.

### Error: Migration already executed

**Solution:** The migration has already been run. Check the `SequelizeMeta` table to verify.

```sql
SELECT * FROM SequelizeMeta;
```

### Error: Cannot rename column 'password' - column doesn't exist

**Solution:** The migration handles this scenario gracefully. The column might already be named `passwordHash`.

## Important Notes

1. **Backup First**: Always backup your production database before running migrations
2. **Downtime**: This migration should complete quickly, but consider maintenance window if database is large
3. **Testing**: Test migrations on a staging environment first if possible
4. **Monitoring**: Monitor application logs after migration for any unexpected errors
