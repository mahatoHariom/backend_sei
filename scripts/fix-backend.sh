#!/bin/bash

# Backend troubleshooting script for SEI Institute
# This script fixes common backend issues

echo "==== SEI Institute - Backend Troubleshooting Script ===="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run this script as root or with sudo"
  exit 1
fi

# Variables
BACKEND_DIR="/var/www/sei-institute/backend"

echo "1. Checking if backend directory exists..."
if [ -d "$BACKEND_DIR" ]; then
  echo "✅ Backend directory exists"
else
  echo "❌ Backend directory does not exist. Creating it..."
  mkdir -p "$BACKEND_DIR"
  mkdir -p "$BACKEND_DIR/uploads/images"
  chmod -R 755 "$BACKEND_DIR"
  echo "✅ Created backend directory structure"
fi

echo "2. Checking uploads directory..."
if [ -d "$BACKEND_DIR/uploads" ]; then
  echo "✅ Uploads directory exists"
else
  echo "❌ Uploads directory does not exist. Creating it..."
  mkdir -p "$BACKEND_DIR/uploads/images"
  echo "✅ Created uploads directory"
fi

echo "3. Setting proper permissions..."
chmod -R 777 "$BACKEND_DIR/uploads"
echo "✅ Set permissions on uploads directory"

echo "4. Checking for port conflicts..."
PORT_CONFLICT=false

# Check if port 3001 is in use
if lsof -i :3001 | grep LISTEN; then
  echo "❌ Port 3001 is already in use."
  PORT_CONFLICT=true
  
  # Get the process using port 3001
  PID=$(lsof -i :3001 -t)
  if [ -n "$PID" ]; then
    echo "Killing process $PID using port 3001..."
    kill -9 $PID
    echo "✅ Killed process using port 3001"
  fi
else
  echo "✅ Port 3001 is available"
fi

# Check if port 9000 is in use (often used for file uploads)
if lsof -i :9000 | grep LISTEN; then
  echo "❌ Port 9000 is already in use."
  
  # Get the process using port 9000
  PID=$(lsof -i :9000 -t)
  if [ -n "$PID" ]; then
    echo "Killing process $PID using port 9000..."
    kill -9 $PID
    echo "✅ Killed process using port 9000"
  fi
else
  echo "✅ Port 9000 is available"
fi

echo "5. Checking PM2 processes..."
if pm2 list | grep backend-app; then
  echo "Backend app is running in PM2. Restarting it..."
  pm2 restart backend-app
  echo "✅ Restarted backend app"
else
  echo "Backend app is not running in PM2."
  
  # Check if the server.js file exists
  if [ -f "$BACKEND_DIR/build/server.js" ]; then
    echo "Starting backend app with PM2..."
    cd "$BACKEND_DIR"
    pm2 start build/server.js --name backend-app
    pm2 save
    echo "✅ Started backend app with PM2"
  else
    echo "❌ server.js not found. Make sure your application is deployed correctly."
  fi
fi

echo "6. Checking for .env file..."
if [ -f "$BACKEND_DIR/.env" ]; then
  echo "✅ .env file exists"
else
  echo "❌ .env file does not exist. Creating a basic one..."
  cat > "$BACKEND_DIR/.env" << EOL
PORT=3001
DATABASE_URL=postgresql://sei:sei@localhost:5432/sei
NODE_ENV=production
EOL
  echo "✅ Created basic .env file"
fi

echo "7. Checking database connection..."
if systemctl is-active --quiet postgresql; then
  echo "✅ PostgreSQL is running"
else
  echo "❌ PostgreSQL is not running. Starting it..."
  systemctl start postgresql
  echo "✅ Started PostgreSQL"
fi

# Check if database exists
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw sei; then
  echo "✅ Database 'sei' exists"
else
  echo "❌ Database 'sei' does not exist. Creating it..."
  sudo -u postgres psql -c "CREATE ROLE sei WITH LOGIN PASSWORD 'sei';"
  sudo -u postgres psql -c "CREATE DATABASE sei OWNER sei;"
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sei TO sei;"
  echo "✅ Created database"
fi

echo "8. Running Prisma migrations if needed..."
if [ -d "$BACKEND_DIR/prisma" ]; then
  cd "$BACKEND_DIR"
  echo "Running Prisma migrations..."
  npx prisma migrate deploy
  echo "✅ Ran Prisma migrations"
else
  echo "❌ Prisma directory not found. Skipping migrations."
fi

echo "9. Restarting backend service..."
cd "$BACKEND_DIR"
pm2 restart backend-app || pm2 start build/server.js --name backend-app
pm2 save
echo "✅ Restarted backend service"

echo "10. Restarting Nginx..."
systemctl restart nginx
echo "✅ Restarted Nginx"

echo ""
echo "Backend troubleshooting complete!"
echo ""
echo "To check if the backend is working properly:"
echo "1. Check the logs: pm2 logs backend-app"
echo "2. Test an API endpoint: curl -I http://localhost:3001/health"
echo "3. If you continue to have issues, try running the reset-server.sh script to completely reset your server." 