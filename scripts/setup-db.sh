#!/bin/bash

# Database configuration
DB_NAME="sei_institute"
DB_USER="sei_user"
DB_PASSWORD="your_secure_password"  # Replace with your actual password

# Update package repositories
apt update

# Install PostgreSQL if not installed
if ! command -v psql &> /dev/null; then
    echo "Installing PostgreSQL..."
    apt install -y postgresql postgresql-contrib
fi

# Start PostgreSQL service
systemctl start postgresql
systemctl enable postgresql

# Create database and user
echo "Creating database and user..."
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" || echo "Database already exists"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" || echo "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER USER $DB_USER WITH SUPERUSER;" # Needed for some Prisma operations

# Update .env file with database connection string
if [ -f "/var/www/sei-institute/backend/.env" ]; then
    echo "Updating .env file..."
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@37.27.247.208:5432:5432/$DB_NAME|g" /var/www/sei-institute/backend/.env
fi

echo "Database setup complete!" 