#!/bin/bash

# Run migrations on production database
# This script should be run after deploying the new migration file

echo "🔄 Running database migrations on production..."

# Run the migrations using sequelize-cli
npx sequelize-cli db:migrate --env production

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully!"
else
    echo "❌ Migration failed!"
    exit 1
fi
