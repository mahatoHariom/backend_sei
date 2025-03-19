#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SERVER_IP="37.27.247.208"
SERVER_USER="root"
DEPLOY_DIR="/var/www"

echo -e "${GREEN}SEI Institute Code Upload Script${NC}"
echo "===================================
"

# Function to check if command executed successfully
check_status() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Success${NC}"
  else
    echo -e "${RED}✗ Failed${NC}"
    exit 1
  fi
}

# Make sure SSH config exists
mkdir -p ~/.ssh
if ! grep -q "Host sei-server" ~/.ssh/config 2>/dev/null; then
  echo "
Host sei-server
  HostName $SERVER_IP
  User $SERVER_USER
  StrictHostKeyChecking no
" >> ~/.ssh/config
  echo -e "SSH config created"
fi

# Test SSH connection
echo "Testing SSH connection..."
ssh -q sei-server exit
check_status

echo -e "\n${YELLOW}Step 1: Uploading backend code${NC}"
read -p "Enter the path to your local backend code directory: " BACKEND_PATH
if [ -d "$BACKEND_PATH" ]; then
  echo "Uploading backend code to server..."
  rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.env' "$BACKEND_PATH/" sei-server:$DEPLOY_DIR/backend/
  check_status
else
  echo -e "${RED}Directory not found: $BACKEND_PATH${NC}"
  exit 1
fi

echo -e "\n${YELLOW}Step 2: Uploading frontend code${NC}"
read -p "Enter the path to your local frontend code directory: " FRONTEND_PATH
if [ -d "$FRONTEND_PATH" ]; then
  echo "Uploading frontend code to server..."
  rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.next' --exclude '.env.local' "$FRONTEND_PATH/" sei-server:$DEPLOY_DIR/frontend/
  check_status
else
  echo -e "${RED}Directory not found: $FRONTEND_PATH${NC}"
  exit 1
fi

echo -e "\n${YELLOW}Step 3: Installing dependencies and building code${NC}"
read -p "Do you want to install dependencies and build code on the server? (y/n): " BUILD_CODE
if [ "$BUILD_CODE" = "y" ]; then
  echo "Installing backend dependencies and building..."
  ssh sei-server "cd $DEPLOY_DIR/backend && npm ci && npm run build"
  check_status
  
  echo "Installing frontend dependencies and building..."
  ssh sei-server "cd $DEPLOY_DIR/frontend && npm ci && npm run build"
  check_status
fi

echo -e "\n${YELLOW}Step 4: Starting the application stack${NC}"
read -p "Do you want to start/restart the application stack? (y/n): " START_APP
if [ "$START_APP" = "y" ]; then
  echo "Starting/restarting the application stack..."
  ssh sei-server "cd $DEPLOY_DIR && docker-compose down && docker-compose up -d"
  check_status
  
  echo "Checking container status..."
  ssh sei-server "docker ps"
fi

echo -e "\n${GREEN}Code upload completed!${NC}"
echo "
Your code has been uploaded to the server.
You can access your application at:
- Frontend: http://$SERVER_IP:3000 (or your domain if configured)
- Backend API: http://$SERVER_IP:9000 (or your API subdomain if configured)
" 