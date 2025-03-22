#!/bin/bash

# Backend setup script for SEI Institute
# This script creates the necessary directories and permissions for the backend

echo "==== SEI Institute - Backend Setup Script ===="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run this script as root or with sudo"
  exit 1
fi

# Variables
BACKEND_DIR="/var/www/sei-institute/backend"

# Create necessary directories
echo "Creating backend directories..."
mkdir -p "$BACKEND_DIR"
mkdir -p "$BACKEND_DIR/uploads/images"
chmod -R 755 "$BACKEND_DIR"

# Setup uploads directory with proper permissions
echo "Setting up uploads directory with proper permissions..."
chmod -R 777 "$BACKEND_DIR/uploads"

# Configure PostgreSQL
echo "Configuring PostgreSQL..."
systemctl start postgresql

# Check if database exists, if not create it
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw sei; then
  echo "Creating database..."
  sudo -u postgres psql -c "CREATE ROLE sei WITH LOGIN PASSWORD 'sei';"
  sudo -u postgres psql -c "CREATE DATABASE sei_institute OWNER sei;"
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sei_institute TO sei;"
  sudo -u postgres psql -c "ALTER USER sei WITH SUPERUSER;"
else
  echo "Database already exists, granting permissions..."
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sei_institute TO sei;"
fi

echo "Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Ensure you've updated your .env file with the correct DATABASE_URL"
echo "2. Run prisma migrations with: npx prisma migrate deploy"
echo "3. Start your application with: pm2 start build/server.js --name backend-app" 