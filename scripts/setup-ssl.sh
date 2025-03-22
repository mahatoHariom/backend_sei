#!/bin/bash

# Script for setting up SSL/TLS and CORS for SEI Institute backend
# This is a one-time setup script that should be run during initial deployment

set -e

echo "Setting up SSL/TLS and CORS configuration for SEI Institute Backend..."

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root" >&2
    exit 1
fi

# Ensure nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    apt update
    apt install -y nginx
fi

# Install certbot for Let's Encrypt SSL certificates
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    apt install -y certbot python3-certbot-nginx
fi

# Create nginx configuration for API
cat > /etc/nginx/sites-available/api.seiinstitute.com.conf <<EOL
server {
    listen 80;
    server_name api.seiinstitute.com;
    
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name api.seiinstitute.com;
    
    ssl_certificate /etc/letsencrypt/live/api.seiinstitute.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.seiinstitute.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    location / {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Create nginx configuration for frontend
cat > /etc/nginx/sites-available/seiinstitute.com.conf <<EOL
server {
    listen 80;
    server_name seiinstitute.com www.seiinstitute.com;
    
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name seiinstitute.com www.seiinstitute.com;
    
    ssl_certificate /etc/letsencrypt/live/seiinstitute.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seiinstitute.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Enable the sites
ln -sf /etc/nginx/sites-available/api.seiinstitute.com.conf /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/seiinstitute.com.conf /etc/nginx/sites-enabled/

# Remove default nginx site if it exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Test nginx configuration
nginx -t

# Restart nginx
systemctl restart nginx

# Obtain SSL certificates for both domains
certbot --nginx -d api.seiinstitute.com --agree-tos --email admin@seiinstitute.com --non-interactive
certbot --nginx -d seiinstitute.com -d www.seiinstitute.com --agree-tos --email admin@seiinstitute.com --non-interactive

echo "SSL/TLS and CORS setup completed successfully!"
echo "Certificates will auto-renew via the certbot timer"

# Add a cron job to auto-renew certificates
if ! crontab -l | grep -q "certbot renew"; then
    (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet") | crontab -
    echo "Added cron job for certificate renewal"
fi

echo "Setup complete!" 