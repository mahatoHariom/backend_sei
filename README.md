# SEI Institute Backend

This is the backend API for SEI Institute built with Fastify and Prisma.

## Environment Setup

The environment variables are managed through the `/sei/.env` file and set by GitHub Actions during deployment:

```
# Database Configuration
POSTGRES_USER=sei_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=sei_institute
DATABASE_URL=postgresql://sei_user:your_db_password@db:5432/sei_institute

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key

# Application Ports
BACKEND_PORT=9000
FRONTEND_PORT=3000
```

These variables should be set as GitHub Secrets in your repository.

## Deployment

The backend is deployed as part of the integrated CI/CD pipeline with GitHub Actions. See the client README.md for complete deployment instructions.

### Directory Structure

The backend code is deployed to the `/sei/backend` directory on the server.

### Database Management

The PostgreSQL database is containerized and persistent data is stored in `/sei/data/postgres`.

#### Running Migrations

To run database migrations:

```bash
cd /sei
docker-compose exec backend npx prisma migrate deploy
```

#### Database Backup

Database backups are automatically created during cleanup operations and stored in `/backup`.

To manually create a backup:

```bash
cd /sei
docker-compose exec db pg_dump -U sei_user sei_institute > /sei/backup_$(date +%Y%m%d%H%M%S).sql
```

#### Database Restore

To restore from a backup:

```bash
cd /sei
cat /sei/backup_file.sql | docker-compose exec -T db psql -U sei_user sei_institute
```

## API Documentation

The API documentation is available at:

```
https://api.seiinstitute.com/docs
```

## CI/CD Configuration

### Required GitHub Secrets

The following secrets must be configured in your GitHub repository:

| Secret Name         | Description          | Example Value        |
| ------------------- | -------------------- | -------------------- |
| `SERVER_IP`         | Server IP address    | 37.27.247.208        |
| `SERVER_PASSWORD`   | Server root password | gkjaRhMActfMatPW7nvd |
| `POSTGRES_USER`     | Database username    | sei_user             |
| `POSTGRES_PASSWORD` | Database password    | SecurePassword123!   |
| `POSTGRES_DB`       | Database name        | sei_institute        |
| `JWT_SECRET`        | JWT secret key       | YourSecureJwtKey123! |

### CI/CD Process

The CI/CD pipeline uses GitHub Actions to:

1. Build and test the application
2. Deploy changes to the server using password authentication
3. Update environment variables on the server
4. Run database migrations
5. Restart services

## Monitoring & Logs

Logs are available through Docker Compose:

```bash
cd /sei
docker-compose logs -f backend
```

Container logs are also available in the `/sei/logs` directory.

## Troubleshooting

### Common Issues

- **Database connection errors**:

  ```bash
  cd /sei
  docker-compose restart db
  docker-compose restart backend
  ```

- **Container not starting**:

  ```bash
  cd /sei
  docker-compose logs backend
  ```

- **Reset the container**:
  ```bash
  cd /sei
  docker-compose down backend
  docker-compose up -d backend
  ```

### Advanced Debugging

To access the backend container shell:

```bash
cd /sei
docker-compose exec backend sh
```
