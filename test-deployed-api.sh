#!/bin/bash

API_URL="https://histo-rando-backend-egvh3.ondigitalocean.app"

echo "========================================="
echo "Testing Deployed API: $API_URL"
echo "========================================="
echo ""

# Test 1: Health Endpoints
echo "✓ Testing Health Endpoints..."
curl -s "$API_URL/api/v1/health" | jq . || echo "Health check failed"
echo ""

curl -s "$API_URL/api/v1/health/ready" | jq . || echo "Ready check failed"
echo ""

curl -s "$API_URL/api/v1/health/live" | jq . || echo "Live check failed"
echo ""

# Test 2: Swagger Documentation
echo "✓ Testing Swagger Docs..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/docs")
echo "Swagger docs HTTP status: $HTTP_CODE"
echo ""

# Test 3: Auth - Register New User
echo "✓ Testing Auth - Register..."
RANDOM_EMAIL="test$(date +%s)@example.com"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"Test123!\",\"username\":\"testuser$(date +%s)\"}")
echo "$REGISTER_RESPONSE" | jq . || echo "$REGISTER_RESPONSE"
echo ""

# Test 4: Auth - Login
echo "✓ Testing Auth - Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"Test123!\"}")
echo "$LOGIN_RESPONSE" | jq . || echo "$LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token // empty')
echo "Token extracted: ${TOKEN:0:50}..."
echo ""

if [ -n "$TOKEN" ]; then
  # Test 5: Get User Profile
  echo "✓ Testing Get User Profile..."
  curl -s "$API_URL/api/v1/users/me" \
    -H "Authorization: Bearer $TOKEN" | jq . || echo "Get profile failed"
  echo ""
  
  # Test 6: Get Parcours List
  echo "✓ Testing Get Parcours List..."
  curl -s "$API_URL/api/v1/parcours" \
    -H "Authorization: Bearer $TOKEN" | jq . || echo "Get parcours failed"
  echo ""
else
  echo "⚠️  No token - skipping authenticated tests"
  echo ""
fi

echo "========================================="
echo "✅ API Tests Complete!"
echo "========================================="
