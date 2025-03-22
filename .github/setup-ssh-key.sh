#!/bin/bash

# This script helps generate an SSH key for GitHub Actions deployment
# and uploads it to the target server

# Generate SSH key
ssh-keygen -t ed25519 -f deploy_key -N ""

# Display the public key
echo "=== Public Key (add to ~/.ssh/authorized_keys on the server) ==="
cat deploy_key.pub

# Display the private key
echo ""
echo "=== Private Key (add as SSH_PRIVATE_KEY secret in GitHub repository) ==="
cat deploy_key

# Instructions for adding to GitHub
echo ""
echo "=== Instructions ==="
echo "1. Copy the private key above and add it as a secret in your GitHub repository"
echo "   Go to Settings > Secrets and variables > Actions > New repository secret"
echo "   Name: SSH_PRIVATE_KEY"
echo "   Value: [paste the private key]"
echo ""
echo "2. SSH into your server and add the public key to the authorized_keys file:"
echo "   echo \"$(cat deploy_key.pub)\" >> ~/.ssh/authorized_keys"
echo ""
echo "3. Ensure your GitHub repository has the necessary permissions for Actions"
echo ""
echo "4. Test your setup by manually triggering the workflow from GitHub Actions" 