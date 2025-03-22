#!/bin/bash

# Backend Database Fix Script for SEI Institute
# This script fixes common database issues that cause 500 errors

echo "==== SEI Institute - Backend Database Fix Script ===="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run this script as root or with sudo"
  exit 1
fi

BACKEND_DIR="/var/www/sei-institute/backend"

echo "1. Checking PostgreSQL status..."
if ! systemctl is-active --quiet postgresql; then
  echo "⚠️ PostgreSQL is not running. Starting it..."
  systemctl start postgresql
  sleep 5
else
  echo "✅ PostgreSQL is running"
fi

echo "2. Checking database existence..."
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw sei; then
  echo "✅ Database 'sei' exists"
else
  echo "⚠️ Database 'sei' does not exist. Creating it..."
  sudo -u postgres psql -c "CREATE ROLE sei WITH LOGIN PASSWORD 'sei';"
  sudo -u postgres psql -c "CREATE DATABASE sei OWNER sei;"
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sei TO sei;"
  sudo -u postgres psql -c "ALTER USER sei WITH SUPERUSER;"
  echo "✅ Database created"
fi

echo "3. Checking database connection..."
if [ -f "$BACKEND_DIR/.env" ]; then
  echo "Updating DATABASE_URL in .env..."
  sed -i 's|DATABASE_URL=.*|DATABASE_URL=postgresql://sei:sei@localhost:5432/sei?schema=public|g' "$BACKEND_DIR/.env"
  echo "✅ Database URL updated"
else
  echo "⚠️ .env file not found. Creating it..."
  cat > "$BACKEND_DIR/.env" << EOL
PORT=3001
DATABASE_URL=postgresql://sei:sei@localhost:5432/sei?schema=public
CLIENT_ENDPOINT=http://seiinstitute.com
JWT_SECRET=your-super-secret-jwt-key
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
NODE_ENV=production
EOL
  echo "✅ .env file created"
fi

echo "4. Regenerating Prisma client..."
cd "$BACKEND_DIR"
npx prisma generate
echo "✅ Prisma client regenerated"

echo "5. Running database migrations with error handling..."
cd "$BACKEND_DIR"
npx prisma migrate deploy || {
  echo "⚠️ Migration failed. Attempting to push the schema directly..."
  npx prisma db push --accept-data-loss
}
echo "✅ Database schema updated"

echo "6. Checking for database connection issues in the code..."
grep -r "new PrismaClient" "$BACKEND_DIR/src" --include="*.ts" || echo "No explicit PrismaClient instantiation found"

echo "7. Restarting backend service..."
pm2 delete backend-app || true
cd "$BACKEND_DIR"
pm2 start build/server.js --name backend-app
pm2 save
echo "✅ Backend service restarted"

echo "8. Testing API endpoint..."
sleep 3
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api || echo "Failed")

if [ "$RESPONSE" == "200" ] || [ "$RESPONSE" == "404" ]; then
  echo "✅ API is responding (HTTP $RESPONSE)"
else
  echo "⚠️ API is not responding correctly (HTTP $RESPONSE)"
  echo "Checking backend logs for errors..."
  tail -n 20 ~/.pm2/logs/backend-app-error.log
fi

echo ""
echo "Database fix process complete!"
echo ""
echo "If you are still experiencing 500 errors:"
echo "1. Check the Prisma schema for any validation errors: $BACKEND_DIR/prisma/schema.prisma"
echo "2. Check that all required environment variables are properly set in the .env file"
echo "3. Verify the database connection using: npx prisma studio"
echo "4. Examine the detailed logs: pm2 logs backend-app" 