#!/bin/bash
# Nginx configuration script for SEI Institute

set -e

# Get domain names
read -p "Enter your frontend domain (e.g., sei-institute.com): " FRONTEND_DOMAIN
read -p "Enter your API domain (e.g., api.sei-institute.com): " API_DOMAIN
read -p "Enter your email for SSL certificates: " EMAIL

# Create Nginx configuration for frontend
cat > /etc/nginx/sites-available/frontend << EOL
server {
    listen 80;
    listen [::]:80;
    server_name ${FRONTEND_DOMAIN} www.${FRONTEND_DOMAIN};

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Create Nginx configuration for backend
cat > /etc/nginx/sites-available/backend << EOL
server {
    listen 80;
    listen [::]:80;
    server_name ${API_DOMAIN};

    location / {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Enable sites
ln -sf /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/backend /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

# Get SSL certificates with Let's Encrypt
certbot --nginx -d ${FRONTEND_DOMAIN} -d www.${FRONTEND_DOMAIN} -d ${API_DOMAIN} --non-interactive --agree-tos --email ${EMAIL}

echo "Nginx configuration completed with SSL certificates!" 