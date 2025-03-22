#!/bin/bash

# Server setup script for backend
# Run this script when setting up a new server

# Update and install required packages
apt-get update
apt-get upgrade -y
apt-get install -y curl build-essential

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Create directory structure
mkdir -p /var/www/sei-institute/backend

# Set permissions
chown -R $USER:$USER /var/www/sei-institute

# Note about environment variables
echo "Environment variables will be set by the CI/CD pipeline using GitHub secrets."
echo "If you need to set them manually for testing, create an .env file in the backend directory."

# Setup PM2 to manage the application
pm2 startup
pm2 save

echo "Backend server setup completed!"
echo "The CI/CD pipeline will deploy your application when you push to the main branch."
echo "Make sure your GitHub Actions secrets are configured correctly." 