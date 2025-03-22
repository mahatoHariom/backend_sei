# Backend Deployment Guide

This guide explains how to set up and use the GitHub Actions CI/CD workflow for deploying the backend application.

## Prerequisites

- GitHub repository with your backend codebase
- Access to the target server (IP: 37.27.247.208)
- GitHub repository permissions to add secrets and run workflows

## Step 1: Set Up Server Authentication

The CI/CD workflow uses password authentication to connect to your server. You need to add the server password as a GitHub secret:

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Name: `SERVER_PASSWORD`
5. Value: `gkjaRhMActfMatPW7nvd`
6. Click "Add secret"

## Step 2: Set Up Environment Secrets

In addition to the server password, you need to set up environment secrets for your application:

1. Follow the detailed instructions in [ENVIRONMENT_SECRETS.md](./.github/ENVIRONMENT_SECRETS.md)
2. At minimum, you need to set up:
   - `BACKEND_DATABASE_URL`: The connection string for your database
   - `BACKEND_JWT_SECRET`: Secret key for JWT token generation
   - `BACKEND_API_URL`: The public URL where the API will be accessible
   - `FRONTEND_URL`: The URL of the frontend application (for CORS)

This step is critical for your application to function properly after deployment.

## Step 3: Prepare Your Server

On your server, create directories for deployment:

```bash
# Connect to your server
ssh root@37.27.247.208
# Password: gkjaRhMActfMatPW7nvd

# Create deployment directory
mkdir -p /opt/sei-institute/backend

# Set proper permissions
chmod -R 755 /opt/sei-institute/backend
```

## Step 4: Triggering Deployments

The CI/CD workflow is set to automatically trigger when you push to the main branch. You can also manually trigger deployments:

1. Go to your GitHub repository
2. Navigate to Actions
3. Select the workflow
4. Click "Run workflow" > "Run workflow"

## Workflow Details

The backend workflow:

1. Checks out the code
2. Sets up Node.js
3. Installs dependencies
4. Builds the application
5. Deploys the built files to the server
6. Sets up a systemd service for running the backend

## Troubleshooting

If you encounter issues with the deployment:

1. Check the GitHub Actions logs for detailed error messages
2. Verify that the server password is correctly set up in GitHub Secrets
3. Check the service status on your server:
   ```bash
   systemctl status backend
   ```
4. View logs for more details:
   ```bash
   journalctl -u backend
   ```

## Server Configuration

After successful deployment, make sure your server has the appropriate firewall and nginx configurations to expose your service.

Example nginx configuration:

```nginx
# Backend configuration
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Replace `api.your-domain.com` with your actual API domain name.
