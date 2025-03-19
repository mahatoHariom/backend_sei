#!/bin/bash

# Update system packages
apt-get update
apt-get upgrade -y

# Install essential tools
apt-get install -y git curl wget nano build-essential

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Install Nginx
apt-get install -y nginx

# Install Docker
apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io
systemctl enable docker
systemctl start docker

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create deployment user
adduser --disabled-password --gecos "" deploy
usermod -aG docker deploy
usermod -aG sudo deploy

# Setup SSH for deploy user
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/ || echo "No SSH keys found for root user"
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# Create directory structure
mkdir -p /var/www/backend
mkdir -p /var/www/frontend
chown -R deploy:deploy /var/www

# Setup PostgreSQL
sudo -u postgres psql -c "CREATE USER sei_user WITH PASSWORD 'strong_password_here';"
sudo -u postgres psql -c "CREATE DATABASE sei_db OWNER sei_user;"

echo "Server setup completed!" 