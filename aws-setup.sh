#!/bin/bash

# AWS EC2 Initial Setup Script for ChatGPT-Web
# Run this script on a fresh Ubuntu EC2 instance
# Usage: bash aws-setup.sh

set -e  # Exit on error

echo "🚀 ChatGPT-Web AWS EC2 Setup Script"
echo "===================================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo "❌ Please run this script as ubuntu user, not as root"
    exit 1
fi

# Update system
echo "📦 Step 1: Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
echo ""
echo "📦 Step 2: Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo "✅ Node.js $NODE_VERSION installed"
echo "✅ npm $NPM_VERSION installed"

# Install build essentials
echo ""
echo "📦 Step 3: Installing build essentials..."
sudo apt install -y build-essential git curl wget

# Install PM2
echo ""
echo "📦 Step 4: Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo ""
echo "📦 Step 5: Installing Nginx..."
sudo apt install -y nginx

# Install PostgreSQL (optional)
read -p "Do you want to install PostgreSQL on this server? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Installing PostgreSQL..."
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    echo "✅ PostgreSQL installed"
    echo "💡 Create database with: sudo -u postgres psql"
fi

# Install Certbot for SSL
echo ""
echo "📦 Step 6: Installing Certbot for SSL certificates..."
sudo apt install -y certbot python3-certbot-nginx

# Setup firewall
echo ""
echo "🔒 Step 7: Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
echo "✅ Firewall configured"

# Create application directory
echo ""
echo "📁 Step 8: Setting up application directory..."
cd /home/ubuntu

# Ask for GitHub repository
echo ""
read -p "Enter your GitHub repository URL (e.g., https://github.com/user/repo.git): " REPO_URL

if [ ! -z "$REPO_URL" ]; then
    echo "📥 Cloning repository..."
    git clone $REPO_URL chatgpt-web
    cd chatgpt-web
    
    # Install dependencies
    echo ""
    echo "📦 Installing application dependencies..."
    npm install
    
    # Create logs directory
    mkdir -p logs
    
    # Build application
    echo ""
    echo "🔨 Building application..."
    npm run build
    
    echo ""
    echo "✅ Application setup complete!"
else
    echo "⚠️  Skipping repository clone. You can clone manually later."
fi

# Display summary
echo ""
echo "=========================================="
echo "✅ AWS EC2 Setup Complete!"
echo "=========================================="
echo ""
echo "📋 What's been installed:"
echo "  ✓ Node.js $NODE_VERSION"
echo "  ✓ npm $NPM_VERSION"
echo "  ✓ PM2 (Process Manager)"
echo "  ✓ Nginx (Web Server)"
echo "  ✓ Certbot (SSL Certificates)"
echo "  ✓ Git & Build Tools"
echo ""
echo "📍 Application directory: /home/ubuntu/chatgpt-web"
echo ""
echo "🔧 Next Steps:"
echo "  1. Configure your database settings in ecosystem.config.js"
echo "  2. Setup Nginx configuration:"
echo "     sudo cp nginx.conf /etc/nginx/sites-available/chatgpt-web"
echo "     sudo ln -s /etc/nginx/sites-available/chatgpt-web /etc/nginx/sites-enabled/"
echo "     sudo rm /etc/nginx/sites-enabled/default"
echo "     sudo nginx -t && sudo systemctl restart nginx"
echo ""
echo "  3. Start application with PM2:"
echo "     pm2 start ecosystem.config.js"
echo "     pm2 save"
echo "     pm2 startup"
echo ""
echo "  4. Setup SSL certificate:"
echo "     sudo certbot --nginx -d yourdomain.com"
echo ""
echo "💡 View the full deployment guide in DEPLOYMENT.md"
echo ""
echo "🎉 Happy deploying!"

