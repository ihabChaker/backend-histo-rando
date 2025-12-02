# Admin Promotion Endpoint

## Overview

A secure public endpoint that allows promoting any user to admin role using a secret key.

## Endpoint

**POST** `/api/v1/auth/promote-to-admin`

## Security

- Public endpoint (no JWT required)
- Protected by a secret key stored in environment variable `ADMIN_PROMOTION_SECRET`
- The secret key is generated automatically and stored in `.env` file

## Usage

### 1. Get Your Secret Key

Check your `.env` file for `ADMIN_PROMOTION_SECRET`:

```bash
grep ADMIN_PROMOTION_SECRET .env
```

### 2. Register a User (if not already done)

```bash
curl -X POST https://histo-rando-backend-egvh3.ondigitalocean.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "username": "admin",
    "password": "YourSecurePassword123!",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

### 3. Promote User to Admin

```bash
curl -X POST https://histo-rando-backend-egvh3.ondigitalocean.app/api/v1/auth/promote-to-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "secretKey": "your-secret-key-from-env"
  }'
```

**Response (Success):**

```json
{
  "message": "User successfully promoted to admin",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "username": "admin",
    "role": "admin"
  }
}
```

### 4. Verify Admin Access

Login and test admin endpoints:

```bash
# Login
curl -X POST https://histo-rando-backend-egvh3.ondigitalocean.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "YourSecurePassword123!"
  }'

# Use the token from login response
curl -X GET https://histo-rando-backend-egvh3.ondigitalocean.app/api/v1/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Production Setup

### Set the Secret Key in DigitalOcean

1. Go to your DigitalOcean App Platform
2. Navigate to your app → Settings → App-Level Environment Variables
3. Add a new environment variable:
   - **Key**: `ADMIN_PROMOTION_SECRET`
   - **Value**: Generate a strong secret with:
     ```bash
     openssl rand -hex 32
     ```
4. Save and redeploy

### Important Security Notes

- ⚠️ **Never commit** the `.env` file to git
- ⚠️ **Never share** the secret key publicly
- ⚠️ Change the secret key regularly in production
- ⚠️ Use different secret keys for different environments

## Error Responses

### Invalid Secret Key

```json
{
  "statusCode": 403,
  "message": "Invalid secret key",
  "error": "Forbidden"
}
```

### User Not Found

```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

### User Already Admin

```json
{
  "message": "User is already an admin",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "username": "admin",
    "role": "admin"
  }
}
```

## Local Testing

```bash
# 1. Start the server
npm run start:dev

# 2. Get your secret key
SECRET_KEY=$(grep ADMIN_PROMOTION_SECRET .env | cut -d '=' -f2)

# 3. Register a test user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "username": "testuser", "password": "Test123!"}'

# 4. Promote to admin
curl -X POST http://localhost:3000/api/v1/auth/promote-to-admin \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"test@example.com\", \"secretKey\": \"$SECRET_KEY\"}"
```

## Swagger Documentation

Access the endpoint documentation at:

- **Local**: http://localhost:3000/api/docs
- **Production**: https://histo-rando-backend-egvh3.ondigitalocean.app/api/docs

Look for the `auth` section and find `POST /auth/promote-to-admin`.
