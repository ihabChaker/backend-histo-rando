#!/bin/bash

# Quick Admin Promotion Script
# Usage: ./promote-admin.sh user@example.com

if [ -z "$1" ]; then
    echo "❌ Usage: ./promote-admin.sh <email>"
    echo "Example: ./promote-admin.sh admin@example.com"
    exit 1
fi

EMAIL="$1"
API_URL="${2:-https://histo-rando-backend-egvh3.ondigitalocean.app/api/v1}"

# Get secret key from .env
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    exit 1
fi

SECRET_KEY=$(grep ADMIN_PROMOTION_SECRET .env | cut -d '=' -f2)

if [ -z "$SECRET_KEY" ]; then
    echo "❌ ADMIN_PROMOTION_SECRET not found in .env"
    exit 1
fi

echo "🚀 Promoting $EMAIL to admin..."
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/promote-to-admin" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"secretKey\": \"$SECRET_KEY\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Success!"
    echo "$BODY" | jq .
else
    echo "❌ Failed (HTTP $HTTP_CODE)"
    echo "$BODY" | jq .
fi
