#!/bin/bash
# Backend Server Setup Script for SEI Institute
# Run this script directly on the server to set up the backend environment

set -e

echo "===== SEI Institute Backend Server Setup ====="

# Update system
apt-get update
apt-get upgrade -y

# Install required packages
apt-get install -y curl wget gnupg2 lsb-release apt-transport-https ca-certificates software-properties-common unzip git

# Install Node.js 20.x
echo "Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verify Node.js installation
echo "Node.js version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Node path: $(which node)"
echo "NPM path: $(which npm)"

# Fix PATH in system profile
echo 'export PATH=$PATH:/usr/bin:/usr/local/bin' >> /etc/profile
source /etc/profile

# Create directory structure for backend
mkdir -p /opt/sei-institute/backend

# Create symbolic links to ensure Node.js is in standard paths
if [ ! -e /usr/bin/node ] && [ -e $(which node) ]; then
  ln -sf $(which node) /usr/bin/node
fi

if [ ! -e /usr/bin/npm ] && [ -e $(which npm) ]; then
  ln -sf $(which npm) /usr/bin/npm
fi

# Create backend service file
cat > /etc/systemd/system/backend.service << 'EOL'
[Unit]
Description=SEI Institute Backend Service
After=network.target postgresql.service

[Service]
User=root
WorkingDirectory=/opt/sei-institute/backend
ExecStart=/usr/bin/node /opt/sei-institute/backend/build/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PATH=/usr/bin:/usr/local/bin
StandardOutput=journal
StandardError=journal
SyslogIdentifier=backend

[Install]
WantedBy=multi-user.target
EOL

# Reload systemd
systemctl daemon-reload

# Install PostgreSQL
echo "Setting up PostgreSQL..."
apt-get install -y postgresql postgresql-contrib

# Start PostgreSQL service
systemctl start postgresql
systemctl enable postgresql

# Create database and user for SEI Institute
sudo -u postgres psql -c "CREATE DATABASE sei_institute;" || echo "Database may already exist"
sudo -u postgres psql -c "CREATE USER sei_user WITH ENCRYPTED PASSWORD 'sei';" || echo "User may already exist"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sei_institute TO sei_user;" || echo "Privileges may already be granted"

# Configure PostgreSQL to allow remote connections
echo "Configuring PostgreSQL for remote connections..."
grep -q "host.*sei_institute.*sei_user.*0.0.0.0/0.*md5" /etc/postgresql/*/main/pg_hba.conf || echo "host    sei_institute    sei_user    0.0.0.0/0    md5" >> /etc/postgresql/*/main/pg_hba.conf
grep -q "listen_addresses.*'*'" /etc/postgresql/*/main/postgresql.conf || echo "listen_addresses = '*'" >> /etc/postgresql/*/main/postgresql.conf

# Restart PostgreSQL to apply changes
systemctl restart postgresql

echo "===== Backend Setup Complete ====="
echo "Node.js is installed at: $(which node)"
echo "NPM is installed at: $(which npm)"
echo "PostgreSQL is configured with:"
echo " - Database: sei_institute"
echo " - User: sei_user"
echo " - Password: sei"
echo " - Connection string: postgresql://sei_user:sei@localhost:5432/sei_institute?schema=public"
echo "System service is created for backend" 