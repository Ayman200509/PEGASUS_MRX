#!/bin/bash

# 1. Pull latest changes
echo "Pulling latest changes..."
git pull

# 2. Install dependencies (in case of new packages)
echo "Installing dependencies..."
npm install

# 3. Build the application
echo "Building application..."
npm run build

# 4. Restart the application (Assuming PM2)
# Replace 'pegasus-mrx' with your actual PM2 app name if different
echo "Restarting PM2 process..."
pm2 restart all

echo "Deployment complete!"
