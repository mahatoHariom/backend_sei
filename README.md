<div align="center">
  <img src=".github/images/logo.svg" height="72"/>
</div>

## 📖 About

Job Portal APi developed using SOLID, TDD, Design Patterns, and other concepts.

This API was developed By Hariom Mahato

## 🔩 Technologies

These were the main technologies used to develop this API:

- [Fastify](https://fastify.dev/)
- [Prisma](https://www.prisma.io/)
- [Docker](https://www.docker.com/)
- [Zod](https://zod.dev/)
- [Day.js](https://day.js.org/)
- [Vitest](https://vitest.dev/)

# SEI Institute Deployment

This repository contains scripts and configuration files to deploy the SEI Institute application on a VPS.

## Server Information

- IPv4: 37.27.247.208
- IPv6: 2a01:4f9:c012:3cd4::/64
- Username: root
- Password: gkjaRhMActfMatPW7nvd

## Files Overview

- `server-setup.sh`: Script to set up the server with necessary dependencies
- `docker-compose.yml`: Docker Compose configuration for running the application stack
- `backend-dockerfile`: Dockerfile for building the backend application
- `frontend-dockerfile`: Dockerfile for building the frontend application
- `nginx-config.conf`: Nginx configuration for routing traffic
- `github-workflow.yml`: GitHub Actions workflow for CI/CD
- `deploy.sh`: Script to automate deployment setup
- `DEPLOYMENT.md`: Comprehensive deployment guide

## Quick Start Deployment

1. Make sure the files are in the same directory on your local machine.

2. Make the deployment script executable:

   ```bash
   chmod +x deploy.sh
   ```

3. Run the deployment script:

   ```bash
   ./deploy.sh
   ```

4. Follow the interactive prompts in the script.

## Manual Deployment

See `DEPLOYMENT.md` for detailed manual deployment instructions.

## Application Architecture

The application consists of:

- Backend API (Node.js with Fastify)
- Frontend (Next.js with App Router)
- PostgreSQL database
- Redis for caching
- Nginx for reverse proxy

## CI/CD Pipeline

The included GitHub Actions workflow will:

1. Build and test the application when code is pushed to the main branch
2. Deploy the updated code to the server
3. Restart the Docker containers

## Directory Structure on Server

```
/var/www/
├── backend/              # Backend application code
├── frontend/             # Frontend application code
├── nginx/
│   ├── conf.d/           # Nginx configuration
│   ├── ssl/              # SSL certificates
│   └── logs/             # Nginx logs
└── docker-compose.yml    # Docker Compose configuration
```
