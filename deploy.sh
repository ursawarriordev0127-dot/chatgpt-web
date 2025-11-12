#!/bin/bash

# ChatGPT-Web Deployment Script
# Usage: ./deploy.sh

set -e  # Exit on error

echo "🚀 Starting deployment for ChatGPT-Web..."
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the project root?"
    exit 1
fi

# Pull latest code
echo ""
echo "📥 Step 1: Pulling latest code from Git..."
git pull origin main || git pull origin master

# Install dependencies
echo ""
echo "📦 Step 2: Installing dependencies..."
npm install

# Run migrations if needed (uncomment if you use migrations)
# echo ""
# echo "🗄️  Step 3: Running database migrations..."
# npm run migrate

# Build application
echo ""
echo "🔨 Step 3: Building application..."
npm run build

# Check if build was successful
if [ ! -d "build" ] || [ ! -d "dist" ]; then
    echo "❌ Error: Build failed. build/ or dist/ directory not found."
    exit 1
fi

# Restart PM2
echo ""
echo "🔄 Step 4: Restarting application with PM2..."
pm2 restart chatgpt-web

# Wait a moment for the app to start
sleep 2

# Show status
echo ""
echo "✅ Deployment complete!"
echo "=========================================="
echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo "📝 Recent Logs:"
pm2 logs chatgpt-web --lines 20 --nostream

echo ""
echo "🎉 Deployment finished successfully!"
echo "💡 Use 'pm2 logs chatgpt-web' to view live logs"
echo "💡 Use 'pm2 monit' to monitor resources"

