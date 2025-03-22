#!/bin/bash

# Initial server setup script for SEI Institute
# This script should be run once during the first deployment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Running initial server setup for SEI Institute..."

# Check if this is a first-time setup by checking for a marker file
MARKER_FILE="/var/www/sei-institute/.setup_completed"

if [ -f "$MARKER_FILE" ]; then
    echo "Initial setup has already been completed. Skipping..."
    exit 0
fi

# Make all scripts executable
chmod +x "$SCRIPT_DIR"/*.sh

# Run SSL/TLS setup if it exists
if [ -f "$SCRIPT_DIR/setup-ssl.sh" ]; then
    echo "Setting up SSL/TLS..."
    bash "$SCRIPT_DIR/setup-ssl.sh"
else
    echo "SSL/TLS setup script not found. Skipping..."
fi

# Run CORS setup if it exists
if [ -f "$SCRIPT_DIR/setup-cors.sh" ]; then
    echo "Setting up CORS..."
    bash "$SCRIPT_DIR/setup-cors.sh"
else
    echo "CORS setup script not found. Skipping..."
fi

# Create a marker file to indicate setup has been completed
echo "$(date)" > "$MARKER_FILE"

echo "Initial server setup completed successfully!" 