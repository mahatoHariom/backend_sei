# Setting Up Environment Secrets for Backend CI/CD

This guide explains how to set up the necessary GitHub Secrets for deploying your backend application using the CI/CD workflow.

## Required Secrets

### SSH Access Secret

- `SSH_PRIVATE_KEY`: The private SSH key for connecting to the deployment server

### Backend Secrets

- `BACKEND_DATABASE_URL`: The connection string for your database
- `BACKEND_JWT_SECRET`: Secret key for JWT token generation
- `BACKEND_PORT` (optional): The port on which the backend will run (defaults to 3333)
- `BACKEND_API_URL`: The public URL where the API will be accessible
- `FRONTEND_URL`: The URL of the frontend application (for CORS)

## Adding Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add each secret with its corresponding name and value
5. Click **Add secret**

## Environment Secret Examples

Here are examples of the values for each secret (replace with your actual values):

### SSH Secret

```
SSH_PRIVATE_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
...your private key content...
-----END OPENSSH PRIVATE KEY-----
```

### Backend Secrets

```
BACKEND_DATABASE_URL=postgresql://username:password@localhost:5432/database_name
BACKEND_JWT_SECRET=your_very_secure_jwt_secret_key
BACKEND_PORT=3333
BACKEND_API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

## Important Notes

1. **Never commit sensitive environment variables directly to your repository**
2. If you need to add new environment variables:
   - Add them to the appropriate GitHub Secrets
   - Update the workflow files to use the new secrets
3. For local development, continue using `.env` files in your project, but exclude them from git using `.gitignore`
4. Different environment variables might be needed depending on your specific application requirements

## Verifying Secrets are Being Used

After setting up secrets and triggering a deployment:

1. Check the GitHub Actions logs (sensitive values will be masked in the output)
2. Verify the application is working correctly on the server
3. If needed, SSH into the server and check the contents of the .env files in the deployment directories

For security reasons, GitHub Actions will mask the actual values of secrets in the logs, showing `***` instead.
