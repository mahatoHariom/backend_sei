# SEI Institute Deployment Guide

This document provides instructions for setting up and deploying the SEI Institute application on your server.

## Server Information

- IPv4: 37.27.247.208
- IPv6: 2a01:4f9:c012:3cd4::/64
- User: root
- Password: gkjaRhMActfMatPW7nvd

## Application Architecture

The application consists of:
- Backend API (Node.js with Fastify)
- Frontend (Next.js with App Router)
- PostgreSQL database
- Redis for caching
- Nginx for reverse proxy

## Initial Server Setup

1. Connect to your server via SSH:
   ```bash
   ssh root@37.27.247.208
   ```

2. Upload the server setup script to your server:
   ```bash
   scp server-setup.sh root@37.27.247.208:/root/
   ```

3. Make the script executable and run it:
   ```bash
   chmod +x server-setup.sh
   ./server-setup.sh
   ```

## Domain Configuration

1. Register your domain (if not already registered)
2. Point your domain's A record to your server IP: 37.27.247.208
3. Create a subdomain for your API (api.yourdomain.com) pointing to the same IP

## SSL Certificate Setup

1. Install Certbot:
   ```bash
   apt-get install -y certbot python3-certbot-nginx
   ```

2. Generate SSL certificates:
   ```bash
   certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
   ```

3. Copy certificates to Nginx directory:
   ```bash
   mkdir -p /var/www/nginx/ssl
   cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /var/www/nginx/ssl/
   cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /var/www/nginx/ssl/
   ```

## Application Deployment

### Manual Deployment

1. Create directory structure:
   ```bash
   mkdir -p /var/www/{backend,frontend,nginx/{conf.d,ssl,logs}}
   ```

2. Upload configuration files:
   ```bash
   scp docker-compose.yml root@37.27.247.208:/var/www/
   scp backend-dockerfile root@37.27.247.208:/var/www/backend/Dockerfile
   scp frontend-dockerfile root@37.27.247.208:/var/www/frontend/Dockerfile
   scp nginx-config.conf root@37.27.247.208:/var/www/nginx/conf.d/default.conf
   ```

3. Edit configuration files to replace placeholder domains with your actual domain.

4. Clone your repositories:
   ```bash
   cd /var/www/backend
   git clone https://github.com/yourusername/backend-repo.git .
   
   cd /var/www/frontend
   git clone https://github.com/yourusername/frontend-repo.git .
   ```

5. Create environment files:
   - Backend (.env):
     ```
     PORT=9000
     DATABASE_URL=postgresql://sei_user:strong_password_here@postgresql:5432/sei_db?schema=public
     CLIENT_ENDPOINT=https://yourdomain.com
     JWT_SECRET=your_secure_jwt_secret
     ACCESS_TOKEN_EXPIRES=1d
     REFRESH_TOKEN_EXPIRES=7d
     NODE_ENV=production
     HUGGING_FACE_KEY=your_hugging_face_key
     ```

   - Frontend (.env.local):
     ```
     NEXT_PUBLIC_API_URL=https://api.yourdomain.com
     ```

6. Start the application stack:
   ```bash
   cd /var/www
   docker-compose up -d
   ```

### CI/CD Setup

1. In your GitHub repository, add the following secrets:
   - `SSH_PRIVATE_KEY`: Your private SSH key
   - `SSH_KNOWN_HOSTS`: Output of `ssh-keyscan 37.27.247.208`

2. Add the GitHub Actions workflow file to your repository:
   ```bash
   mkdir -p .github/workflows/
   cp github-workflow.yml .github/workflows/deploy.yml
   ```

3. Push to the main branch to trigger deployment:
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

## Monitoring and Maintenance

### Logs
- Access application logs:
  ```bash
  docker logs sei_backend
  docker logs sei_frontend
  ```

### Backups
- Database backup:
  ```bash
  docker exec sei_postgres pg_dump -U sei_user sei_db > backup.sql
  ```

### Updates
- Update application:
  ```bash
  cd /var/www
  docker-compose down
  git -C /var/www/backend pull
  git -C /var/www/frontend pull
  docker-compose up -d --build
  ```

## Troubleshooting

- If you can't access the application, check if services are running:
  ```bash
  docker ps
  ```

- Check Nginx configuration:
  ```bash
  docker exec sei_nginx nginx -t
  ```

- Check database connectivity:
  ```bash
  docker exec -it sei_backend npx prisma migrate status
  ```

- Restart specific service:
  ```bash
  docker restart sei_backend
  ```

## Security Recommendations

1. Change the default root password
2. Disable root SSH login and use SSH keys
3. Set up a firewall with UFW
4. Regularly update your server with `apt update && apt upgrade`
5. Set up automatic backups
6. Monitor logs for suspicious activity

## Additional Resources

- Docker: https://docs.docker.com/
- Next.js: https://nextjs.org/docs
- Fastify: https://www.fastify.io/docs/latest/
- Prisma: https://www.prisma.io/docs/
- Nginx: https://nginx.org/en/docs/ 