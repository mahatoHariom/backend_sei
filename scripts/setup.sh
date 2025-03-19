#!/bin/bash

# Backend Setup Script
echo "Starting backend setup..."

# Install dependencies
npm ci

# Create production .env file
echo "Creating production environment file..."

# Escape special characters in DB_PASSWORD for use in connection string
ESCAPED_DB_PASSWORD=$(echo "$DB_PASSWORD" | sed 's/[\\&*./+!]/\\&/g')

cat > .env.production << EOL
PORT=9000
DATABASE_URL=postgresql://sei_user:${ESCAPED_DB_PASSWORD}@localhost:5432/sei_institute?schema=public
CLIENT_ENDPOINT="https://seiinstitute.com"
JWT_SECRET="${JWT_SECRET}"
ACCESS_TOKEN_EXPIRES="1d"
REFRESH_TOKEN_EXPIRES="7d"
NODE_ENV="production"
POSTGRES_HOST_AUTH_METHOD="trust"
HUGGING_FACE_KEY="${HUGGING_FACE_KEY}"
EOL

# Copy production env
echo "Copying production environment file to .env..."
cp .env.production .env

# Verify environment file was created correctly
if [ ! -s ".env" ]; then
  echo "Error: .env file is empty or wasn't created properly"
  exit 1
fi

echo "Environment file created with the following variables (sensitive data masked):"
cat .env | sed 's/\(PASSWORD\|SECRET\|KEY\)=.*/\1=********/g'

# Validate DATABASE_URL format
if ! grep -q "DATABASE_URL=postgresql://sei_user:" .env; then
  echo "Warning: DATABASE_URL might not be properly set in .env"
  echo "Current DATABASE_URL value (masked):"
  grep "DATABASE_URL" .env | sed 's/\(postgresql:\/\/sei_user:\)[^@]*\(@localhost\)/\1*******\2/g'
  
  echo "Fixing DATABASE_URL in .env file..."
  sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://sei_user:${ESCAPED_DB_PASSWORD}@localhost:5432/sei_institute?schema=public|g" .env
  echo "Updated DATABASE_URL in .env"
fi

# Build the application
npm run build

# Run database migrations
echo "Generating Prisma client..."
npx prisma generate

# Test database connection before migrations
echo "Testing database connection before migrations..."
if ! npx prisma db pull --skip-generate; then
  echo "Warning: Database connection test failed. Checking PostgreSQL status..."
  systemctl status postgresql
  echo "Current user and host information:"
  whoami
  hostname
  
  echo "Fixing database connection issues..."
  
  # Verify and update database password
  echo "Updating database user password and permissions..."
  sudo -u postgres psql -c "ALTER USER sei_user WITH PASSWORD '${DB_PASSWORD}';"
  sudo -u postgres psql -c "ALTER USER sei_user WITH LOGIN SUPERUSER CREATEDB CREATEROLE REPLICATION;"
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sei_institute TO sei_user;"
  sudo -u postgres psql -d sei_institute -c "GRANT ALL ON SCHEMA public TO sei_user;"
  sudo -u postgres psql -d sei_institute -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sei_user;"
  sudo -u postgres psql -d sei_institute -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sei_user;"
  sudo -u postgres psql -d sei_institute -c "GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO sei_user;"
  
  # Check and update PostgreSQL authentication configuration
  echo "Checking PostgreSQL authentication configuration..."
  PG_HBA_CONF=$(sudo -u postgres psql -t -c "SHOW hba_file;")
  echo "PostgreSQL hba file location: $PG_HBA_CONF"
  
  # Modify pg_hba.conf to use md5 authentication for local connections
  sudo grep -q "host.*all.*all.*md5" "$PG_HBA_CONF" || sudo sed -i '/^host/s/peer/md5/g' "$PG_HBA_CONF"
  sudo grep -q "host.*all.*all.*md5" "$PG_HBA_CONF" || sudo bash -c "echo 'host all all 127.0.0.1/32 md5' >> $PG_HBA_CONF"
  
  # Restart PostgreSQL to apply changes
  echo "Restarting PostgreSQL to apply configuration changes..."
  sudo service postgresql restart
  
  echo "Retesting database connection after fixes..."
  if ! npx prisma db pull --skip-generate; then
    echo "Error: Database connection still failing after attempted fixes."
    echo "Manual intervention required. Please check:"
    echo "1. PostgreSQL is running: systemctl status postgresql"
    echo "2. Database credentials in .env match PostgreSQL"
    echo "3. PostgreSQL authentication settings in pg_hba.conf"
    exit 1
  else
    echo "Database connection successful after fixes!"
  fi
fi

echo "Running database migrations..."
npx prisma migrate deploy

# Setup PM2
npm install pm2 -g
pm2 restart backend || pm2 start npm --name "backend" -- start
pm2 save

# Verify environment variables
echo "Verifying environment variables..."
if [ -f ".env" ]; then
  echo "Environment file exists"
  # Check critical variables
  if grep -q "DATABASE_URL" .env && grep -q "JWT_SECRET" .env && grep -q "NODE_ENV=production" .env; then
    echo "Critical environment variables are set"
  else
    echo "Error: Missing critical environment variables"
    echo "Contents of .env file (sensitive data masked):"
    cat .env | sed 's/\(PASSWORD\|SECRET\|KEY\)=.*/\1=********/g'
    exit 1
  fi
else
  echo "Error: Environment file not found"
  exit 1
fi

# Test database connection
echo "Testing database connection..."
if npx prisma db pull; then
  echo "Database connection successful"
else
  echo "Error: Database connection failed"
  echo "Please check that:"
  echo "1. PostgreSQL is running"
  echo "2. The database 'sei_institute' exists"
  echo "3. User 'sei_user' exists with correct password"
  echo "4. User 'sei_user' has proper permissions"
  exit 1
fi

echo "Backend setup completed successfully!" 