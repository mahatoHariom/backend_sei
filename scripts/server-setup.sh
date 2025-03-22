#!/bin/bash
# SEI Institute Server Setup Script
# This script should be run on the server to set up all required components

set -e

# Update system packages
apt-get update
apt-get upgrade -y

# Install necessary packages
apt-get install -y curl wget gnupg2 lsb-release apt-transport-https ca-certificates software-properties-common unzip git

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Start PostgreSQL service
systemctl start postgresql
systemctl enable postgresql

# Create database and user for SEI Institute
sudo -u postgres psql -c "CREATE DATABASE sei_institute;"
sudo -u postgres psql -c "CREATE USER sei_user WITH ENCRYPTED PASSWORD 'sei';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sei_institute TO sei_user;"

# Configure PostgreSQL to allow connections from GitHub Actions
echo "host    sei_institute    sei_user    0.0.0.0/0    md5" >> /etc/postgresql/*/main/pg_hba.conf
echo "listen_addresses = '*'" >> /etc/postgresql/*/main/postgresql.conf

# Restart PostgreSQL to apply changes
systemctl restart postgresql

# Install Nginx
apt-get install -y nginx

# Enable and start Nginx
systemctl enable nginx
systemctl start nginx

# Install Certbot for SSL
apt-get install -y certbot python3-certbot-nginx

# Create directory structure
mkdir -p /opt/sei-institute/frontend
mkdir -p /opt/sei-institute/backend

# Set permissions
chown -R root:root /opt/sei-institute

echo "Server setup completed successfully!"
echo "PostgreSQL is configured with:"
echo " - Database: sei_institute"
echo " - User: sei_user"
echo " - Password: sei"
echo " - Connection string: postgresql://sei_user:sei@37.27.247.208:5432/sei_institute?schema=public" 