#!/bin/bash

# Create Admin Account Script
# This script creates an admin account by:
# 1. Registering a user via API
# 2. Updating the user role to 'admin' in the database

set -e

# Configuration
API_URL="${API_URL:-https://histo-rando-backend-egvh3.ondigitalocean.app/api/v1}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_NAME="${DB_NAME:-histo_rando}"

# Admin credentials
ADMIN_EMAIL="admin@histo-rando.com"
ADMIN_PASSWORD="Admin123!"
ADMIN_USERNAME="admin"
ADMIN_FIRST_NAME="Admin"
ADMIN_LAST_NAME="User"

echo "🚀 Creating admin account..."
echo ""

# Step 1: Register user via API
echo "📝 Step 1: Registering user via API..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$ADMIN_USERNAME\",
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\",
    \"firstName\": \"$ADMIN_FIRST_NAME\",
    \"lastName\": \"$ADMIN_LAST_NAME\"
  }" 2>&1)

# Check if registration was successful or user already exists
if echo "$REGISTER_RESPONSE" | grep -q "access_token"; then
  echo "✅ User registered successfully"
elif echo "$REGISTER_RESPONSE" | grep -q "already exists"; then
  echo "⚠️  User already exists, continuing..."
else
  echo "❌ Registration failed"
  echo "$REGISTER_RESPONSE"
  exit 1
fi

# Step 2: Update user role to admin
echo ""
echo "🔧 Step 2: Updating user role to admin..."

if [ -z "$DB_PASSWORD" ]; then
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" -e \
    "UPDATE users SET role = 'admin' WHERE email = '$ADMIN_EMAIL';"
else
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e \
    "UPDATE users SET role = 'admin' WHERE email = '$ADMIN_EMAIL';"
fi

echo "✅ User role updated to admin"

# Step 3: Verify the admin account
echo ""
echo "📊 Admin Account Details:"
echo "─────────────────────────────────────"

if [ -z "$DB_PASSWORD" ]; then
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" -e \
    "SELECT id, username, email, role FROM users WHERE email = '$ADMIN_EMAIL';"
else
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e \
    "SELECT id, username, email, role FROM users WHERE email = '$ADMIN_EMAIL';"
fi

echo ""
echo "🎉 Admin account created successfully!"
echo ""
echo "📝 Login Credentials:"
echo "─────────────────────────────────────"
echo "   Email:    $ADMIN_EMAIL"
echo "   Password: $ADMIN_PASSWORD"
echo "─────────────────────────────────────"
echo ""
echo "🌐 You can now login at:"
echo "   API: $API_URL/auth/login"
echo "   Admin Dashboard: $API_URL/admin/stats"
