#!/bin/bash

# HistoRando E2E Test Database Setup Script
# This script sets up a PostgreSQL database for E2E tests using Docker

set -e

echo "🐳 Setting up PostgreSQL Test Database..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Configuration
CONTAINER_NAME="histo-rando-test-db"
POSTGRES_PASSWORD="testpassword"
POSTGRES_DB="histo_rando_test"
POSTGRES_PORT="5432"

# Check if container already exists
if docker ps -a | grep -q $CONTAINER_NAME; then
    echo "📦 Removing existing container..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
fi

# Start PostgreSQL container
echo "🚀 Starting PostgreSQL container..."
docker run -d \
  --name $CONTAINER_NAME \
  -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
  -e POSTGRES_DB=$POSTGRES_DB \
  -p $POSTGRES_PORT:5432 \
  postgres:14

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Test connection
echo "🔌 Testing database connection..."
docker exec $CONTAINER_NAME psql -U postgres -d $POSTGRES_DB -c "SELECT version();" > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL test database is ready!"
    echo ""
    echo "📝 Database Connection Info:"
    echo "   Host: localhost"
    echo "   Port: $POSTGRES_PORT"
    echo "   Database: $POSTGRES_DB"
    echo "   User: postgres"
    echo "   Password: $POSTGRES_PASSWORD"
    echo ""
    echo "🧪 Run E2E tests with:"
    echo "   npm run test:e2e"
    echo ""
    echo "🛑 Stop database when done:"
    echo "   docker stop $CONTAINER_NAME"
    echo "   docker rm $CONTAINER_NAME"
else
    echo "❌ Failed to connect to database"
    exit 1
fi

# Update .env.test file
ENV_TEST_FILE=".env.test"
if [ -f "$ENV_TEST_FILE" ]; then
    echo "📝 Updating $ENV_TEST_FILE with correct credentials..."
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$POSTGRES_PASSWORD/" "$ENV_TEST_FILE"
    echo "✅ Updated $ENV_TEST_FILE"
fi
