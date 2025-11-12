# ChatGPT-Web Deployment Guide

## Overview
This guide helps you deploy ChatGPT-Web using PM2 and Nginx on AWS. The setup runs a single Node.js process that serves both the backend API and frontend React app.

## Architecture
```
Internet → Route 53/Domain → AWS EC2 → Nginx (Port 80/443) → Node.js/Express (Port 3000)
                                                ↓
                                          Frontend + Backend
```

---

# 🚀 AWS Deployment (Recommended)

## Quick AWS Setup Guide

### Step 1: Launch EC2 Instance

1. **Login to AWS Console** → Go to EC2 Dashboard

2. **Launch Instance**:
   - **Name**: `chatgpt-web-server`
   - **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance Type**: `t2.small` or higher (t2.micro may be too small)
   - **Key Pair**: Create new key pair → Save `.pem` file securely
   - **Network Settings**:
     - Allow SSH (Port 22) - Your IP only
     - Allow HTTP (Port 80) - Anywhere
     - Allow HTTPS (Port 443) - Anywhere
   - **Storage**: 20 GB gp3 (minimum)

3. **Launch Instance** and wait until status is "Running"

4. **Allocate Elastic IP** (Optional but recommended):
   - EC2 → Elastic IPs → Allocate Elastic IP address
   - Associate with your instance
   - This gives you a permanent IP address

### Step 2: Connect to Your EC2 Instance

```bash
# Change permission of your key file
chmod 400 your-key.pem

# Connect via SSH (replace with your IP and key file)
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### Step 3: Initial Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install build essentials
sudo apt install -y build-essential git

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### Step 4: Setup Your Application

```bash
# Clone your repository
cd /home/ubuntu
git clone https://github.com/your-username/chatgpt-web.git
cd chatgpt-web

# Install dependencies
npm install

# Build the application
npm run build

# Create logs directory
mkdir -p logs
```

### Step 5: Configure Environment Variables

```bash
# Copy ecosystem config if needed
# Edit ecosystem.config.js to add your environment variables
nano ecosystem.config.js
```

Add your environment variables:
```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3000,
  DATABASE_HOST: 'your-rds-endpoint',  // or localhost
  DATABASE_PORT: 5432,
  DATABASE_NAME: 'chatgpt_db',
  DATABASE_USER: 'your_user',
  DATABASE_PASSWORD: 'your_password',
  // Add other variables as needed
}
```

### Step 6: Setup Database (Choose One Option)

#### Option A: Local PostgreSQL on EC2
```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
# In PostgreSQL shell:
CREATE DATABASE chatgpt_db;
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE chatgpt_db TO your_user;
\q
```

#### Option B: AWS RDS (Recommended for Production)
1. Go to AWS RDS Console
2. Create Database:
   - **Engine**: PostgreSQL
   - **Template**: Free tier / Production
   - **DB Instance**: db.t3.micro (free tier)
   - **Master username**: admin
   - **Master password**: Create strong password
   - **Public access**: No (same VPC as EC2)
3. Configure Security Group:
   - Allow PostgreSQL (5432) from EC2 security group
4. Use the endpoint in your ecosystem.config.js

### Step 7: Configure Nginx

```bash
# Copy your nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/chatgpt-web

# Edit the configuration
sudo nano /etc/nginx/sites-available/chatgpt-web

# Replace 'yourdomain.com' with your domain or EC2 public IP
# For IP-only access, you can use:
server_name _;

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Create symbolic link
sudo ln -s /etc/nginx/sites-available/chatgpt-web /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Step 8: Start Application with PM2

```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Run the command that PM2 outputs

# Check status
pm2 status
pm2 logs chatgpt-web
```

### Step 9: Setup Domain (Optional)

#### Using Route 53:
1. Go to Route 53 → Hosted Zones
2. Create Record:
   - **Name**: yourdomain.com
   - **Type**: A
   - **Value**: Your EC2 Elastic IP
3. Create CNAME for www:
   - **Name**: www
   - **Type**: CNAME
   - **Value**: yourdomain.com

### Step 10: Setup SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will automatically configure nginx for HTTPS
# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 11: Configure AWS Security Group

Go to EC2 → Security Groups → Your instance's security group:

**Inbound Rules**:
```
Type            Protocol    Port Range    Source
SSH             TCP         22            Your IP
HTTP            TCP         80            0.0.0.0/0
HTTPS           TCP         443           0.0.0.0/0
Custom TCP      TCP         3000          127.0.0.1/32 (localhost only)
```

**Outbound Rules**: Allow all traffic (default)

## 🎯 Quick Deployment Script

Create a deployment script for easy updates:

```bash
# Create deploy.sh
nano deploy.sh
```

Add this content:
```bash
#!/bin/bash
echo "🚀 Starting deployment..."

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build application
echo "🔨 Building application..."
npm run build

# Restart PM2
echo "🔄 Restarting application..."
pm2 restart chatgpt-web

# Show status
echo "✅ Deployment complete!"
pm2 status
pm2 logs chatgpt-web --lines 20
```

Make it executable:
```bash
chmod +x deploy.sh
```

Use it for updates:
```bash
./deploy.sh
```

## 💰 AWS Cost Optimization

### Free Tier (First 12 months):
- **EC2**: t2.micro - 750 hours/month
- **RDS**: db.t2.micro - 750 hours/month
- **Data Transfer**: 15 GB/month
- **EBS Storage**: 30 GB

### After Free Tier (~$15-30/month):
- **EC2 t2.small**: ~$17/month
- **RDS db.t3.micro**: ~$15/month
- **Elastic IP**: Free if attached
- **Data Transfer**: $0.09/GB

### Cost Saving Tips:
1. Use t3.small with Auto Scaling
2. Stop instances during non-business hours
3. Use RDS snapshots for backups (cheaper)
4. Enable CloudWatch for monitoring
5. Set billing alerts

## 🔒 AWS Security Best Practices

1. **Use IAM Roles** instead of access keys
2. **Enable CloudWatch Logs** for monitoring
3. **Setup AWS Backup** for automatic backups
4. **Use AWS Secrets Manager** for sensitive data
5. **Enable VPC Flow Logs** for network monitoring
6. **Regular Security Updates**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

## 📊 Monitoring on AWS

### CloudWatch Setup:
```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

# Configure CloudWatch
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

### PM2 Monitoring:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

# 📖 General Deployment Instructions

## Prerequisites (If Not Using AWS)
- Node.js 16+ installed
- PM2 installed globally
- Nginx installed
- Domain name (optional, can use IP address)

## Step-by-Step Deployment

### 1. Install PM2 (if not installed)
```bash
npm install -g pm2
```

### 2. Build the Application
```bash
# Install dependencies
npm install

# Build both frontend and backend
npm run build
```

This creates:
- `build/` - Compiled backend code
- `dist/` - Built frontend static files

### 3. Start with PM2
```bash
# Start the application
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs chatgpt-web

# Monitor resources
pm2 monit
```

### 4. Save PM2 Process List
```bash
# Save current process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions shown in the terminal
```

### 5. Configure Nginx

#### Install Nginx (if not installed)
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

#### Setup Nginx Configuration
```bash
# Copy the nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/chatgpt-web

# Create symbolic link
sudo ln -s /etc/nginx/sites-available/chatgpt-web /etc/nginx/sites-enabled/

# Edit the configuration and replace 'yourdomain.com' with your actual domain
sudo nano /etc/nginx/sites-available/chatgpt-web

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Enable nginx to start on boot
sudo systemctl enable nginx
```

### 6. Setup SSL Certificate (Optional but Recommended)

#### Using Let's Encrypt (Free SSL)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

After SSL setup, uncomment the HTTPS server block in `nginx.conf` and restart nginx.

### 7. Create Logs Directory
```bash
# Create logs directory for PM2
mkdir -p logs
```

### 8. Configure Firewall
```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Check status
sudo ufw status
```

## PM2 Commands Reference

```bash
# Start application
pm2 start ecosystem.config.js

# Stop application
pm2 stop chatgpt-web

# Restart application
pm2 restart chatgpt-web

# Delete from PM2
pm2 delete chatgpt-web

# View logs
pm2 logs chatgpt-web
pm2 logs chatgpt-web --lines 100

# Monitor
pm2 monit

# Application info
pm2 info chatgpt-web

# Process list
pm2 list
```

## Nginx Commands Reference

```bash
# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Reload nginx (no downtime)
sudo systemctl reload nginx

# Check nginx status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/chatgpt-web-error.log

# View access logs
sudo tail -f /var/log/nginx/chatgpt-web-access.log
```

## Updating Your Application

```bash
# 1. Pull latest code
git pull

# 2. Install dependencies
npm install

# 3. Build
npm run build

# 4. Restart PM2
pm2 restart chatgpt-web

# 5. Check logs
pm2 logs chatgpt-web
```

## Troubleshooting

### Application won't start
```bash
# Check PM2 logs
pm2 logs chatgpt-web

# Check if port 3000 is in use
sudo lsof -i :3000
sudo netstat -tulpn | grep 3000
```

### Nginx shows 502 Bad Gateway
```bash
# Check if Node.js app is running
pm2 status

# Check nginx error logs
sudo tail -f /var/log/nginx/chatgpt-web-error.log

# Verify Node.js is listening on port 3000
curl http://localhost:3000
```

### Can't access website
```bash
# Check nginx status
sudo systemctl status nginx

# Check firewall
sudo ufw status

# Verify nginx is listening
sudo netstat -tulpn | grep :80
```

### Database connection issues
```bash
# Check your database configuration in server/config/index.ts
# Ensure database is running and accessible
```

## Environment Variables

If you need to customize environment variables, edit `ecosystem.config.js`:

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3000,
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: 5432,
  // Add more variables as needed
}
```

## Monitoring

### Setup PM2 Plus (Optional)
PM2 Plus provides advanced monitoring:
```bash
pm2 link <secret_key> <public_key>
```

### Basic Health Check
```bash
# Setup a cron job to check application health
crontab -e

# Add this line to check every 5 minutes
*/5 * * * * curl -f http://localhost:3000 || pm2 restart chatgpt-web
```

## Security Recommendations

1. **Keep system updated**
   ```bash
   sudo apt update && sudo apt upgrade
   ```

2. **Use SSL/HTTPS** (follow step 6 above)

3. **Setup fail2ban** to prevent brute force attacks
   ```bash
   sudo apt install fail2ban
   ```

4. **Regular backups** of your database and configuration

5. **Monitor logs regularly**
   ```bash
   pm2 logs
   sudo tail -f /var/log/nginx/chatgpt-web-access.log
   ```

## Support

For issues or questions:
- Check logs: `pm2 logs chatgpt-web`
- Review nginx logs: `/var/log/nginx/chatgpt-web-error.log`
- Check application status: `pm2 status`

