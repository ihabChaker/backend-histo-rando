# Scripts Directory

This directory contains utility scripts for managing the HistoRando backend.

## 📜 Available Scripts

### 1. Create Admin Account

Creates an admin user account for accessing the admin dashboard.

#### 🌐 Production Environment (Recommended)

```bash
cd backend
node scripts/create-admin-production.js
```

This creates a user account on production. Then promote to admin:

**Option 1: DigitalOcean Console** (Easiest)
1. Go to DigitalOcean → Databases → histo-rando-db
2. Click "Users & Databases" → "Console"
3. Run: `USE histo_rando;`
4. Run: `UPDATE users SET role = 'admin' WHERE email = 'admin@histo-rando.com';`
5. Verify: `SELECT id, username, email, role FROM users WHERE email = 'admin@histo-rando.com';`

**Option 2: Use SQL File**
```bash
# View the SQL commands
cat scripts/promote-to-admin.sql

# Then copy and run in DigitalOcean database console
```

**Option 3: MySQL CLI** (If you have direct DB access)
```bash
mysql -h <DB_HOST> -P <DB_PORT> -u <DB_USER> -p<DB_PASSWORD> histo_rando < scripts/promote-to-admin.sql
```

---

#### 💻 Local Development

For local development, you can use any of these methods:

#### Using Node.js (Recommended)

```bash
# Install dependencies first (if not already installed)
npm install

# Run the script
node scripts/create-admin.js
```

**Features:**
- ✅ Registers user via API
- ✅ Updates role to admin in database
- ✅ Verifies admin access
- ✅ Handles existing users
- ✅ Tests admin login

#### Using Bash

```bash
# Make the script executable
chmod +x scripts/create-admin.sh

# Run the script
./scripts/create-admin.sh
```

**Requirements:**
- MySQL client installed
- Backend API running

#### Using SQL Directly

If you prefer to create the admin manually:

1. First, register a user via the API:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@histo-rando.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

2. Then, update the user role in the database:
```sql
USE histo_rando;
UPDATE users SET role = 'admin' WHERE email = 'admin@histo-rando.com';
```

3. Verify the admin account:
```sql
SELECT id, username, email, role FROM users WHERE role = 'admin';
```

## 🔑 Default Admin Credentials

After running any of the scripts above:

- **Email:** admin@histo-rando.com
- **Password:** Admin123!
- **Role:** admin

**⚠️ Important:** Change these credentials after first login in production!

## 🌐 Environment Variables

The scripts use the following environment variables (with defaults):

```bash
# API Configuration
API_URL=http://localhost:3000/api/v1

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=histo_rando
```

You can override these by:

1. Setting environment variables:
```bash
export DB_PASSWORD=yourpassword
node scripts/create-admin.js
```

2. Or using a `.env` file (for Node.js script)

## 📝 Usage Examples

### Create admin with custom database password

```bash
# Bash script
DB_PASSWORD=mypassword ./scripts/create-admin.sh

# Node.js script (set in .env)
echo "DB_PASSWORD=mypassword" >> .env
node scripts/create-admin.js
```

### Create admin on remote server

```bash
# Bash script
API_URL=https://api.histo-rando.com/api/v1 \
DB_HOST=db.histo-rando.com \
DB_PASSWORD=mypassword \
./scripts/create-admin.sh
```

## 🧪 Testing Admin Access

After creating the admin account, test it:

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@histo-rando.com",
    "password": "Admin123!"
  }'

# Use the token to access admin endpoints
curl -X GET http://localhost:3000/api/v1/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔧 Troubleshooting

### "Cannot connect to API server"
- Make sure the backend is running: `npm run start:dev`
- Check the API_URL is correct

### "Access denied for user"
- Check your database credentials
- Make sure MySQL is running
- Verify DB_PASSWORD is correct

### "User already exists"
- The script will automatically update the existing user's role to admin
- If you want to reset the password, do it via the database:
```sql
-- First, get a bcrypt hash of your new password using an online tool
UPDATE users SET passwordHash = 'YOUR_BCRYPT_HASH' WHERE email = 'admin@histo-rando.com';
```

## 📚 Related Documentation

- [Admin Dashboard Documentation](../ADMIN_DASHBOARD_DOCUMENTATION.md)
- [Admin Quick Reference](../ADMIN_QUICK_REFERENCE.md)
- [API Documentation](../README.md)
