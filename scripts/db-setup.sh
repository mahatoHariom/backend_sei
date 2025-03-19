#!/bin/bash

# Database Setup Script
echo "Setting up PostgreSQL database..."

# Check if PostgreSQL is installed and running
if ! systemctl is-active --quiet postgresql; then
  echo "PostgreSQL is not running. Installing and starting..."
  apt update
  apt install -y postgresql postgresql-contrib
  systemctl start postgresql
  systemctl enable postgresql
fi

# Create database and user
sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname = 'sei_institute'" | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE sei_institute;"
sudo -u postgres psql -c "SELECT 1 FROM pg_roles WHERE rolname = 'sei_user'" | grep -q 1 || sudo -u postgres psql -c "CREATE USER sei_user WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sei_institute TO sei_user;"
sudo -u postgres psql -d sei_institute -c "GRANT ALL ON SCHEMA public TO sei_user;"

echo "Database setup completed successfully!" 