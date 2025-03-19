#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SERVER_IP="37.27.247.208"
SERVER_USER="root"
SERVER_PASSWORD="gkjaRhMActfMatPW7nvd"
DEPLOY_DIR="/var/www"

echo -e "${GREEN}SEI Institute Deployment Script${NC}"
echo "===============================
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

echo -e "${YELLOW}Step 1: Setting up SSH connection${NC}"
# Create SSH config if it doesn't exist
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

echo -e "\n${YELLOW}Step 2: Uploading configuration files${NC}"
# Create directories on server
echo "Creating directory structure..."
ssh sei-server "mkdir -p $DEPLOY_DIR/{backend,frontend,nginx/{conf.d,ssl,logs}}"
check_status

# Upload configuration files
echo "Uploading server setup script..."
scp server-setup.sh sei-server:$DEPLOY_DIR/
check_status

echo "Uploading Docker Compose configuration..."
scp docker-compose.yml sei-server:$DEPLOY_DIR/
check_status

echo "Uploading backend Dockerfile..."
scp backend-dockerfile sei-server:$DEPLOY_DIR/backend/Dockerfile
check_status

echo "Uploading frontend Dockerfile..."
scp frontend-dockerfile sei-server:$DEPLOY_DIR/frontend/Dockerfile
check_status

echo "Uploading Nginx configuration..."
scp nginx-config.conf sei-server:$DEPLOY_DIR/nginx/conf.d/default.conf
check_status

echo -e "\n${YELLOW}Step 3: Setting up server${NC}"
echo "Running server setup script..."
ssh sei-server "chmod +x $DEPLOY_DIR/server-setup.sh && $DEPLOY_DIR/server-setup.sh"
check_status

echo -e "\n${YELLOW}Step 4: Setting up backend repository${NC}"
read -p "Enter your backend repository URL (or press Enter to skip): " BACKEND_REPO
if [ ! -z "$BACKEND_REPO" ]; then
  echo "Cloning backend repository..."
  ssh sei-server "cd $DEPLOY_DIR/backend && git clone $BACKEND_REPO ."
  check_status
else
  echo "Skipping backend repository setup..."
  echo "You'll need to upload your backend code manually."
fi

echo -e "\n${YELLOW}Step 5: Setting up frontend repository${NC}"
read -p "Enter your frontend repository URL (or press Enter to skip): " FRONTEND_REPO
if [ ! -z "$FRONTEND_REPO" ]; then
  echo "Cloning frontend repository..."
  ssh sei-server "cd $DEPLOY_DIR/frontend && git clone $FRONTEND_REPO ."
  check_status
else
  echo "Skipping frontend repository setup..."
  echo "You'll need to upload your frontend code manually."
fi

echo -e "\n${YELLOW}Step 6: Creating environment files${NC}"
read -p "Enter your domain name: " DOMAIN_NAME
api_subdomain="api.$DOMAIN_NAME"

# Create backend .env file
echo "Creating backend .env file..."
cat > backend.env << EOF
PORT=9000
DATABASE_URL=postgresql://sei_user:strong_password_here@postgresql:5432/sei_db?schema=public
CLIENT_ENDPOINT=https://$DOMAIN_NAME
JWT_SECRET=sei_$(date +%s)_secret_key
ACCESS_TOKEN_EXPIRES=1d
REFRESH_TOKEN_EXPIRES=7d
NODE_ENV=production
HUGGING_FACE_KEY=$(grep HUGGING_FACE_KEY .env | cut -d '=' -f2)
EOF
scp backend.env sei-server:$DEPLOY_DIR/backend/.env
check_status

# Create frontend .env file
echo "Creating frontend .env file..."
cat > frontend.env << EOF
NEXT_PUBLIC_API_URL=https://$api_subdomain
EOF
scp frontend.env sei-server:$DEPLOY_DIR/frontend/.env.local
check_status

# Update domain names in Nginx config
echo "Updating domain names in Nginx configuration..."
ssh sei-server "sed -i 's/your-domain.com/$DOMAIN_NAME/g' $DEPLOY_DIR/nginx/conf.d/default.conf"
ssh sei-server "sed -i 's/api.your-domain.com/$api_subdomain/g' $DEPLOY_DIR/nginx/conf.d/default.conf"
check_status

# Update domain names in Docker Compose file
echo "Updating domain names in Docker Compose configuration..."
ssh sei-server "sed -i 's/your-domain.com/$DOMAIN_NAME/g' $DEPLOY_DIR/docker-compose.yml"
ssh sei-server "sed -i 's/api.your-domain.com/$api_subdomain/g' $DEPLOY_DIR/docker-compose.yml"
check_status

echo -e "\n${YELLOW}Step 7: Setting up SSL certificates${NC}"
echo "Installing Certbot..."
ssh sei-server "apt-get install -y certbot python3-certbot-nginx"
check_status

read -p "Do you want to set up SSL certificates now? (y/n): " SETUP_SSL
if [ "$SETUP_SSL" = "y" ]; then
  echo "Setting up SSL certificates..."
  ssh sei-server "certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME -d $api_subdomain"
  check_status
  
  echo "Copying certificates to Nginx directory..."
  ssh sei-server "mkdir -p $DEPLOY_DIR/nginx/ssl && \
                  cp /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem $DEPLOY_DIR/nginx/ssl/ && \
                  cp /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem $DEPLOY_DIR/nginx/ssl/"
  check_status
else
  echo "Skipping SSL certificate setup..."
  echo "You'll need to set up SSL certificates manually."
fi

echo -e "\n${YELLOW}Step 8: Starting the application stack${NC}"
read -p "Do you want to start the application stack now? (y/n): " START_APP
if [ "$START_APP" = "y" ]; then
  echo "Starting the application stack..."
  ssh sei-server "cd $DEPLOY_DIR && docker-compose up -d"
  check_status
  
  echo "Checking container status..."
  ssh sei-server "docker ps"
else
  echo "Skipping application startup..."
  echo "You can start the application stack later with:"
  echo "ssh sei-server 'cd $DEPLOY_DIR && docker-compose up -d'"
fi

echo -e "\n${GREEN}Deployment setup completed!${NC}"
echo "
Next steps:
1. Make sure your domain ($DOMAIN_NAME) points to your server IP ($SERVER_IP)
2. If you skipped repository setup, upload your code to the server
3. If you skipped SSL setup, set up SSL certificates
4. If you skipped application startup, start the application stack

Your application should be accessible at:
- Frontend: https://$DOMAIN_NAME
- Backend API: https://$api_subdomain

For more information, refer to the DEPLOYMENT.md file.
" 