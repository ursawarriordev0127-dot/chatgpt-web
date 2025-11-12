# 🚀 AWS Quick Start Guide

Get your ChatGPT-Web app running on AWS in under 30 minutes!

## 📋 Prerequisites
- AWS Account
- Domain name (optional)
- GitHub repository (or zip file of your code)

---

## ⚡ Super Quick Setup (5 Commands)

### 1️⃣ Launch EC2 & Connect
```bash
# On AWS Console:
# - Launch Ubuntu 22.04 EC2 instance (t2.small recommended)
# - Download your .pem key file
# - Note your public IP

# On your local machine:
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR-EC2-IP
```

### 2️⃣ Run Auto Setup Script
```bash
# Upload and run the setup script
curl -o- https://raw.githubusercontent.com/YOUR-USERNAME/chatgpt-web/main/aws-setup.sh | bash

# OR if you cloned the repo:
cd chatgpt-web
chmod +x aws-setup.sh
./aws-setup.sh
```

### 3️⃣ Configure Nginx
```bash
cd /home/ubuntu/chatgpt-web
sudo cp nginx.conf /etc/nginx/sites-available/chatgpt-web
sudo nano /etc/nginx/sites-available/chatgpt-web  # Edit domain/IP
sudo ln -s /etc/nginx/sites-available/chatgpt-web /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
```

### 4️⃣ Start Application
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Run the command it outputs
```

### 5️⃣ Setup SSL (if you have a domain)
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Done! 🎉** Visit your EC2 public IP or domain name.

---

## 🔧 Detailed Steps

### Step 1: Launch EC2 Instance

1. **AWS Console** → EC2 → Launch Instance

2. **Configure**:
   ```
   Name: chatgpt-web-server
   AMI: Ubuntu Server 22.04 LTS
   Instance Type: t2.small (or t2.micro for testing)
   Key Pair: Create new → Download .pem file
   Storage: 20 GB gp3
   ```

3. **Security Group** (Inbound Rules):
   ```
   SSH (22)    - Your IP
   HTTP (80)   - Anywhere (0.0.0.0/0)
   HTTPS (443) - Anywhere (0.0.0.0/0)
   ```

4. **Launch** and wait for "Running" status

5. **Get Elastic IP** (recommended):
   - EC2 → Elastic IPs → Allocate
   - Associate with your instance

### Step 2: Connect to Server

```bash
# On your local machine
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR-EC2-IP
```

### Step 3: Initial Setup

```bash
# Method 1: Use auto-setup script
cd /home/ubuntu
git clone https://github.com/YOUR-USERNAME/chatgpt-web.git
cd chatgpt-web
chmod +x aws-setup.sh
./aws-setup.sh
```

```bash
# Method 2: Manual setup
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs build-essential git

# Install PM2 & Nginx
sudo npm install -g pm2
sudo apt install -y nginx

# Clone and build
cd /home/ubuntu
git clone https://github.com/YOUR-USERNAME/chatgpt-web.git
cd chatgpt-web
npm install
npm run build
mkdir -p logs
```

### Step 4: Configure Database

**Option A: Local PostgreSQL**
```bash
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql
```
```sql
CREATE DATABASE chatgpt_db;
CREATE USER chatgpt_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE chatgpt_db TO chatgpt_user;
\q
```

**Option B: AWS RDS** (Recommended)
1. RDS Console → Create Database
2. Choose PostgreSQL
3. Select db.t3.micro (free tier)
4. Configure security group to allow EC2 access
5. Use endpoint in ecosystem.config.js

### Step 5: Configure Environment

Edit `ecosystem.config.js`:
```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3000,
  DATABASE_HOST: 'localhost',  // or RDS endpoint
  DATABASE_PORT: 5432,
  DATABASE_NAME: 'chatgpt_db',
  DATABASE_USER: 'chatgpt_user',
  DATABASE_PASSWORD: 'your_secure_password',
}
```

### Step 6: Setup Nginx

```bash
# Copy configuration
sudo cp nginx.conf /etc/nginx/sites-available/chatgpt-web

# Edit for your domain or use IP
sudo nano /etc/nginx/sites-available/chatgpt-web
# Replace 'yourdomain.com' with your domain
# Or use 'server_name _;' for IP access

# Enable site
sudo ln -s /etc/nginx/sites-available/chatgpt-web /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Step 7: Start Application

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save configuration
pm2 save

# Setup auto-start on reboot
pm2 startup
# Copy and run the command it shows

# Check status
pm2 status
pm2 logs chatgpt-web
```

### Step 8: Setup Domain & SSL

**Configure Domain (Route 53 or your DNS provider)**:
```
Type: A Record
Name: @ (or yourdomain.com)
Value: YOUR-ELASTIC-IP
TTL: 300
```

**Get SSL Certificate**:
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## 🔄 Updates & Maintenance

### Deploy Updates
```bash
cd /home/ubuntu/chatgpt-web
./deploy.sh
```

Or manually:
```bash
git pull
npm install
npm run build
pm2 restart chatgpt-web
```

### Check Status
```bash
pm2 status
pm2 logs chatgpt-web
pm2 monit
```

### View Logs
```bash
# PM2 logs
pm2 logs chatgpt-web --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/chatgpt-web-access.log
sudo tail -f /var/log/nginx/chatgpt-web-error.log
```

---

## 💰 Cost Estimate

### Free Tier (12 months)
- EC2 t2.micro: FREE (750 hours/month)
- RDS db.t2.micro: FREE (750 hours/month)
- 30 GB Storage: FREE
- **Total: $0/month**

### After Free Tier
- EC2 t2.small: ~$17/month
- RDS db.t3.micro: ~$15/month
- Data Transfer: ~$5/month
- **Total: ~$35/month**

### Cost Saving Tips
- Use Reserved Instances (save 30-50%)
- Stop instances during off-hours
- Use Auto Scaling
- Enable CloudWatch billing alerts

---

## 🔒 Security Checklist

- [ ] Change default ports if needed
- [ ] Setup SSL/HTTPS
- [ ] Use strong database passwords
- [ ] Keep SSH key secure
- [ ] Enable AWS CloudWatch
- [ ] Setup automated backups
- [ ] Use IAM roles (no access keys)
- [ ] Enable VPC firewall rules
- [ ] Regular system updates: `sudo apt update && sudo apt upgrade`

---

## 🐛 Troubleshooting

### Can't connect to EC2
```bash
# Check security group allows your IP on port 22
# Verify you're using correct key file
# Check instance is running
```

### Application won't start
```bash
pm2 logs chatgpt-web  # Check error logs
pm2 restart chatgpt-web
```

### 502 Bad Gateway
```bash
# Check if app is running
pm2 status

# Check if port 3000 is accessible
curl http://localhost:3000

# Restart services
pm2 restart chatgpt-web
sudo systemctl restart nginx
```

### Database connection failed
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -h localhost -U chatgpt_user -d chatgpt_db

# Check RDS security group if using RDS
```

---

## 📚 Useful Commands

```bash
# PM2
pm2 list                    # List all processes
pm2 restart chatgpt-web     # Restart app
pm2 stop chatgpt-web        # Stop app
pm2 delete chatgpt-web      # Remove from PM2
pm2 logs                    # View all logs
pm2 monit                   # Monitor resources

# Nginx
sudo systemctl restart nginx
sudo systemctl status nginx
sudo nginx -t               # Test configuration

# System
htop                        # Monitor system resources
df -h                       # Check disk space
free -m                     # Check memory

# Logs
tail -f logs/out.log        # App output
tail -f logs/err.log        # App errors
journalctl -u nginx         # Nginx system logs
```

---

## 🎯 Next Steps

1. **Setup Monitoring**: Configure CloudWatch or PM2 Plus
2. **Backup Strategy**: Setup automated DB backups
3. **CDN**: Consider CloudFront for static assets
4. **Load Balancer**: Use ALB for multiple instances
5. **CI/CD**: Setup GitHub Actions for auto-deploy

---

## 📞 Support

- Full Guide: See `DEPLOYMENT.md`
- Issues: Check PM2 and Nginx logs
- AWS Docs: https://docs.aws.amazon.com/
- Community: GitHub Issues

**Happy Deploying! 🚀**

