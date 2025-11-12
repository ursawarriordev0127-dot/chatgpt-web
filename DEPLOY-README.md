# 🚀 ChatGPT-Web AWS Deployment Guide

**Quick Navigation** | Complete deployment documentation for AWS EC2

---

## 🎯 Your Server Information

```
Server IP:    3.145.68.209
Username:     ubuntu
Key File:     casey.pem
Directory:    /home/ubuntu/chatgpt-web
```

**Quick Connect:**
```bash
ssh -i casey.pem ubuntu@3.145.68.209
```

---

## 📚 Documentation Guide

Choose the right document for your needs:

### 🏃 **Quick Start** (Fastest Way)
📄 **[AWS-QUICKSTART.md](./AWS-QUICKSTART.md)**
- Perfect for: Getting started quickly
- Time: 20-30 minutes
- Best for: First-time deployment

### 📖 **Complete Guide** (Everything You Need)
📄 **[DEPLOYMENT.md](./DEPLOYMENT.md)**
- Perfect for: Full understanding
- Time: 1-2 hours
- Best for: Production deployment with all details

### 📁 **Directory Structure** (Understanding the Layout)
📄 **[DIRECTORY-STRUCTURE.md](./DIRECTORY-STRUCTURE.md)**
- Perfect for: Understanding where files go
- Shows: Complete directory tree and file organization
- Best for: Developers new to the project

### ✅ **Deployment Checklist** (Don't Miss Anything)
📄 **[DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)**
- Perfect for: Step-by-step verification
- Format: Interactive checklist
- Best for: Ensuring nothing is missed

### 🔌 **Connection Guide** (Access Your Server)
📄 **[CONNECT-TO-AWS.md](./CONNECT-TO-AWS.md)**
- Perfect for: SSH connection and file transfer
- Contains: Your specific server details
- Best for: Daily operations

---

## ⚡ Super Quick Start (5 Steps)

If you're ready to deploy right now:

### 1️⃣ Connect to Your Server
```bash
ssh -i casey.pem ubuntu@3.145.68.209
```

### 2️⃣ Initial Setup (First Time Only)
```bash
# Run the automated setup script
curl -o- https://raw.githubusercontent.com/YOUR-USERNAME/chatgpt-web/main/aws-setup.sh | bash

# OR manually:
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs build-essential git nginx
sudo npm install -g pm2
```

### 3️⃣ Clone & Build
```bash
cd /home/ubuntu
git clone https://github.com/YOUR-USERNAME/chatgpt-web.git
cd chatgpt-web
npm install
npm run build
mkdir -p logs
```

### 4️⃣ Configure & Start
```bash
# Configure Nginx
sudo cp nginx.conf /etc/nginx/sites-available/chatgpt-web
sudo nano /etc/nginx/sites-available/chatgpt-web  # Edit server_name
sudo ln -s /etc/nginx/sites-available/chatgpt-web /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Run the command it outputs
```

### 5️⃣ Verify
```bash
pm2 status
pm2 logs chatgpt-web
```

**Done!** Visit: http://3.145.68.209

---

## 🎨 Visual Deployment Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. LOCAL MACHINE                                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │  ssh -i casey.pem ubuntu@3.145.68.209              │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. AWS EC2: 3.145.68.209                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Install: Node.js, PM2, Nginx, Git                 │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. CLONE & BUILD                                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │  git clone → npm install → npm run build           │    │
│  │  Creates: build/ + dist/                           │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. CONFIGURE                                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Setup: Nginx → PM2 → Database                     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  5. PRODUCTION (Running)                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Nginx → Node.js (PM2) → Frontend + Backend        │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Project Files Overview

```
chatgpt-web/
│
├── 📘 DEPLOY-README.md              ← YOU ARE HERE (Start here!)
├── 📘 AWS-QUICKSTART.md             ← Quick 20-min setup
├── 📘 DEPLOYMENT.md                 ← Complete guide
├── 📘 DIRECTORY-STRUCTURE.md        ← File organization
├── 📘 DEPLOYMENT-CHECKLIST.md       ← Step-by-step checklist
├── 📘 CONNECT-TO-AWS.md             ← SSH & connection help
│
├── ⚙️ ecosystem.config.js           ← PM2 configuration
├── ⚙️ nginx.conf                    ← Nginx configuration
├── 🔧 deploy.sh                     ← Update deployment script
├── 🔧 aws-setup.sh                  ← Initial server setup
│
├── 📦 package.json                  ← Dependencies
├── 📁 server/                       ← Backend source
├── 📁 src/                          ← Frontend source
│
└── After Build:
    ├── 📁 build/                    ← Compiled backend (production)
    ├── 📁 dist/                     ← Built frontend (production)
    └── 📁 logs/                     ← Application logs
```

---

## 🎓 Understanding the Deployment

### What Gets Built?
```
Source Code → Build → Production

server/ (TypeScript)  →  tsc  →  build/ (JavaScript)
src/ (React)          →  vite →  dist/ (HTML/JS/CSS)
```

### What Runs in Production?
```
PM2 runs → build/index.js → Serves:
                              ├── API routes (/api/*)
                              └── Static files (dist/)
```

### Where Everything Lives?
```
/home/ubuntu/chatgpt-web/
├── build/index.js          ← Running application
├── dist/                   ← Served to users
├── logs/                   ← Check for errors
├── uploads/                ← User files
└── node_modules/           ← Dependencies
```

---

## 🔄 Common Operations

### Deploy New Updates
```bash
# Option 1: Use deploy script (easiest)
ssh -i casey.pem ubuntu@3.145.68.209
cd /home/ubuntu/chatgpt-web
./deploy.sh

# Option 2: Manual
git pull
npm install
npm run build
pm2 restart chatgpt-web
```

### Check Application Status
```bash
pm2 status
pm2 logs chatgpt-web
pm2 monit
```

### View Logs
```bash
# Application logs
pm2 logs chatgpt-web
pm2 logs chatgpt-web --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/chatgpt-web-error.log
sudo tail -f /var/log/nginx/chatgpt-web-access.log
```

### Restart Services
```bash
# Restart application
pm2 restart chatgpt-web

# Restart nginx
sudo systemctl restart nginx

# Restart everything
pm2 restart chatgpt-web && sudo systemctl restart nginx
```

---

## 🆘 Troubleshooting Quick Reference

### App Won't Start
```bash
pm2 logs chatgpt-web --err
cd /home/ubuntu/chatgpt-web
npm run build
pm2 restart chatgpt-web
```

### 502 Bad Gateway
```bash
pm2 status  # Check if running
curl http://localhost:3000  # Test direct access
pm2 restart chatgpt-web
sudo systemctl restart nginx
```

### Can't Connect via SSH
```bash
# Check key permissions
chmod 400 casey.pem

# Verify AWS Security Group allows your IP
# Check instance is running in AWS Console
```

### Database Connection Failed
```bash
# Check database is running
sudo systemctl status postgresql

# Check connection string in ecosystem.config.js
nano ecosystem.config.js
```

---

## 💰 AWS Cost Tracking

### Free Tier (First 12 Months)
- ✅ EC2 t2.micro: 750 hours/month
- ✅ RDS db.t2.micro: 750 hours/month
- ✅ 30 GB storage

### After Free Tier (~$15-30/month)
- EC2 t2.small: ~$17/month
- RDS db.t3.micro: ~$15/month
- Bandwidth: ~$5/month

**💡 Tip:** Set up AWS billing alerts in AWS Console!

---

## 🔒 Security Checklist

- [ ] SSH key (casey.pem) is secure (chmod 400)
- [ ] AWS Security Group configured correctly
- [ ] SSL certificate installed (HTTPS)
- [ ] Database password is strong
- [ ] Regular system updates enabled
- [ ] Firewall (ufw) configured
- [ ] Backups configured

---

## 📞 Need Help?

### Check Documentation
1. **First**: See [AWS-QUICKSTART.md](./AWS-QUICKSTART.md)
2. **Detailed**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
3. **Structure**: See [DIRECTORY-STRUCTURE.md](./DIRECTORY-STRUCTURE.md)
4. **Checklist**: See [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)

### Debug Commands
```bash
# System status
ssh -i casey.pem ubuntu@3.145.68.209
pm2 status && systemctl status nginx

# View logs
pm2 logs chatgpt-web --lines 100
sudo tail -100 /var/log/nginx/chatgpt-web-error.log

# Check resources
df -h  # Disk space
free -m  # Memory
htop  # CPU and processes
```

---

## 🎉 Ready to Deploy?

1. **New to AWS?** → Start with [AWS-QUICKSTART.md](./AWS-QUICKSTART.md)
2. **Want details?** → Read [DEPLOYMENT.md](./DEPLOYMENT.md)
3. **Ready to go?** → Follow the 5 steps above!

**Your server is waiting at: 3.145.68.209** 🚀

---

## 📝 Maintenance Schedule

### Daily
- [ ] Check application status: `pm2 status`
- [ ] Monitor error logs: `pm2 logs chatgpt-web --err --lines 50`

### Weekly
- [ ] Review access logs
- [ ] Check disk space: `df -h`
- [ ] Monitor costs in AWS Console

### Monthly
- [ ] System updates: `sudo apt update && sudo apt upgrade`
- [ ] Database backup
- [ ] Review AWS costs
- [ ] Check SSL certificate expiration

---

**Last Updated:** 2025-11-12  
**Server:** 3.145.68.209  
**Status:** Ready for deployment ✅

