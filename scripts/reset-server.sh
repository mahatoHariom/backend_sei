#!/bin/bash

# Complete Server Reset Script for SEI Institute
# This script will completely clear your server and prepare for fresh deployment
# WARNING: This will delete all existing data!

echo "==== SEI Institute - Complete Server Reset Script ===="
echo "WARNING: This will delete ALL existing deployment data!"
echo "Press CTRL+C now to cancel or Enter to continue..."
read

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run this script as root or with sudo"
  exit 1
fi

# Step 1: Stop all running services
echo "1. Stopping all services..."
pm2 stop all
systemctl stop nginx
systemctl stop postgresql

# Step 2: Kill any processes using our ports
echo "2. Killing any processes using our ports..."
for PORT in 3000 3001 9000
do
  if lsof -i :$PORT -t &>/dev/null; then
    echo "  - Killing processes on port $PORT"
    kill -9 $(lsof -i :$PORT -t) || true
  fi
done

# Step 3: Completely remove the app directory
echo "3. Removing application directories..."
rm -rf /var/www/sei-institute

# Step 4: Create fresh directory structure
echo "4. Creating fresh directory structure..."
mkdir -p /var/www/sei-institute/{client,backend,backups}
mkdir -p /var/www/sei-institute/backend/uploads/images
chmod -R 755 /var/www/sei-institute

# Step 5: Reset PostgreSQL database
echo "5. Resetting PostgreSQL database..."
systemctl start postgresql
sleep 3

# Drop and recreate database
sudo -u postgres psql -c "DROP DATABASE IF EXISTS sei;"
sudo -u postgres psql -c "DROP ROLE IF EXISTS sei;"
sudo -u postgres psql -c "CREATE ROLE sei WITH LOGIN PASSWORD 'sei';"
sudo -u postgres psql -c "CREATE DATABASE sei OWNER sei;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sei TO sei;"
sudo -u postgres psql -c "ALTER USER sei WITH SUPERUSER;"

# Step 6: Reset PM2
echo "6. Resetting PM2..."
pm2 delete all
pm2 save --force
pm2 flush

# Step 7: Restart services
echo "7. Restarting services..."
systemctl restart postgresql
systemctl restart nginx

# Step 8: Verify everything is clean
echo "8. Verifying clean state..."
echo "  - App directory:"
ls -la /var/www/sei-institute
echo "  - Database:"
sudo -u postgres psql -c "\\l" | grep sei
echo "  - PM2 processes:"
pm2 list
echo "  - Nginx status:"
systemctl status nginx | grep Active
echo "  - PostgreSQL status:"
systemctl status postgresql | grep Active

echo "====================================================="
echo "SERVER RESET COMPLETE!"
echo "Your server is now ready for a fresh deployment."
echo ""
echo "Next steps:"
echo "1. Log into your GitHub repository"
echo "2. Set up the following secrets in GitHub repository settings:"
echo "   SERVER_IP: 37.27.247.208"
echo "   SERVER_USER: root"
echo "   SERVER_PASSWORD: gkjaRhMActfMatPW7nvd"
echo "   DB_HOST: localhost"
echo "   DB_PORT: 5432"
echo "   DB_NAME: sei"
echo "   DB_USER: sei"
echo "   DB_PASSWORD: sei"
echo "3. Push your code to the GitHub repository to trigger deployment"
echo "=====================================================" 