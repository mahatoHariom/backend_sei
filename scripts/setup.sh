#!/bin/bash

# Backend Setup Script
echo "Starting backend setup..."

# Install dependencies
npm ci

# Create production .env file
echo "Creating production environment file..."
cat > .env.production << EOL
PORT=9000
DATABASE_URL=postgresql://sei_user:${DB_PASSWORD}@localhost:5432/sei_institute
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

# Check if the DATABASE_URL is properly formatted
if ! grep -q "DATABASE_URL=postgresql://sei_user:" .env; then
  echo "Warning: DATABASE_URL might not be properly set in .env"
  echo "Fixing DATABASE_URL in .env file..."
  sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://sei_user:${DB_PASSWORD}@localhost:5432/sei_institute|g" .env
  echo "Updated DATABASE_URL in .env"
fi

# Build the application
npm run build

# Run database migrations
echo "Generating Prisma client..."
npx prisma generate

echo "Testing database connection before migrations..."
if ! npx prisma db pull --skip-generate; then
  echo "Warning: Database connection test failed. Checking PostgreSQL status..."
  systemctl status postgresql
  echo "Current user and host information:"
  whoami
  hostname
  echo "Database user information:"
  sudo -u postgres psql -c "\du" | grep sei_user
  echo "Attempting to connect to database directly..."
  PGPASSWORD="${DB_PASSWORD}" psql -h localhost -U sei_user -d sei_institute -c "\conninfo" || echo "Direct connection failed"
  
  echo "Fixing database connection issue..."
  sudo -u postgres psql -c "ALTER USER sei_user WITH PASSWORD '${DB_PASSWORD}';"
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sei_institute TO sei_user;"
  sudo -u postgres psql -d sei_institute -c "GRANT ALL ON SCHEMA public TO sei_user;"
  echo "Database permissions updated."
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