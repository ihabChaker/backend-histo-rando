# PostgreSQL Database Setup for E2E Tests

## Option 1: Using Docker (Recommended)

The easiest way to run E2E tests is using Docker PostgreSQL:

```bash
# Start PostgreSQL in Docker
docker run -d \
  --name histo-rando-test-db \
  -e POSTGRES_PASSWORD=testpassword \
  -e POSTGRES_DB=histo_rando_test \
  -p 5432:5432 \
  postgres:14

# Wait for PostgreSQL to be ready
sleep 5

# Update .env.test with:
# DB_PASSWORD=testpassword
```

Then run tests:

```bash
npm run test:e2e
```

Stop and remove when done:

```bash
docker stop histo-rando-test-db
docker rm histo-rando-test-db
```

## Option 2: Local PostgreSQL Setup

### 1. Create PostgreSQL User and Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Inside psql:
CREATE USER testuser WITH PASSWORD 'testpassword';
CREATE DATABASE histo_rando_test OWNER testuser;
GRANT ALL PRIVILEGES ON DATABASE histo_rando_test TO testuser;
\\q
```

### 2. Update .env.test

```env
TEST_DB_NAME=histo_rando_test
DB_HOST=localhost
DB_PORT=5432
DB_USER=testuser
DB_PASSWORD=testpassword
```

### 3. Configure PostgreSQL Authentication

Edit `/etc/postgresql/14/main/pg_hba.conf` (path may vary):

```
# Add this line for local password auth:
local   all             testuser                                md5
host    all             testuser        127.0.0.1/32            md5
host    all             testuser        ::1/128                 md5
```

Reload PostgreSQL:

```bash
sudo systemctl reload postgresql
```

## Option 3: Use Existing PostgreSQL User

If you have an existing PostgreSQL setup with a different user:

```bash
# Find your PostgreSQL user
sudo -u postgres psql -c "\\du"

# Create test database
sudo -u postgres psql -c "CREATE DATABASE histo_rando_test;"
```

Update `.env.test` with your actual credentials.

## Option 4: Skip Real Database E2E Tests

If you can't set up PostgreSQL, you can:

1. **Run unit tests only** (93 tests with 89% coverage):

   ```bash
   npm test -- --coverage
   ```

2. **Use mock-based E2E tests** (without real database)

## Verify Setup

Test your connection:

```bash
# Using Docker/remote
PGPASSWORD=testpassword psql -h localhost -U testuser -d histo_rando_test -c "SELECT version();"

# Using local peer auth
psql -d histo_rando_test -c "SELECT version();"
```

## Current Issue

The tests are configured to use:

- **User**: postgres
- **Password**: postgres
- **Database**: histo_rando_test

But your PostgreSQL is configured for peer authentication (Unix socket) instead of password authentication.

**Choose one of the options above to proceed with E2E tests.**
