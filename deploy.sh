#!/bin/bash

# Deployment script for SEI Institute backend
set -e

echo "=== Starting backend deployment ==="

# Load environment variables from .env.production
if [ -f .env.production ]; then
  echo "Loading environment variables from .env.production..."
  export $(grep -v '^#' .env.production | xargs)
fi

# Build the Docker image
echo "Building Docker image..."
docker build -t sei-backend .

# Stop and remove existing container if it exists
echo "Stopping existing container if it exists..."
docker stop sei-backend 2>/dev/null || true
docker rm sei-backend 2>/dev/null || true

# Create uploads directory if it doesn't exist
mkdir -p ./uploads

# Run the new container
echo "Starting new container..."
docker run -d \
  --name sei-backend \
  -p 9000:9000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="$DATABASE_URL" \
  -e JWT_SECRET="$JWT_SECRET" \
  -e PORT=9000 \
  -v $(pwd)/uploads:/app/uploads \
  --restart always \
  sei-backend

echo "=== Backend deployment completed successfully ===" 