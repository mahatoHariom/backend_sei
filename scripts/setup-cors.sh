#!/bin/bash

# Script to configure CORS for the SEI Institute backend
# This should be run once during the initial server setup

set -e

echo "Setting up CORS configuration for the backend..."

# Create a CORS configuration file
mkdir -p /var/www/sei-institute/config

cat > /var/www/sei-institute/config/cors.json <<EOL
{
  "allowedOrigins": [
    "https://seiinstitute.com",
    "https://www.seiinstitute.com",
    "http://localhost:3000"
  ],
  "allowedMethods": [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "OPTIONS"
  ],
  "allowedHeaders": [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With"
  ],
  "credentials": true
}
EOL

echo "CORS configuration has been set up at /var/www/sei-institute/config/cors.json"
echo "The backend application will use this configuration at startup." 