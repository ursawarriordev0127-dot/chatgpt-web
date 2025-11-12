# ✅ AWS Deployment Checklist

Use this checklist to ensure you don't miss any steps during deployment.

---

## 🚦 Pre-Deployment

- [ ] AWS account created and verified
- [ ] Domain name purchased (optional but recommended)
- [ ] Code repository ready on GitHub
- [ ] Database schema and migrations prepared
- [ ] Environment variables documented

---

## 🖥️ AWS Infrastructure Setup

### EC2 Instance
- [ ] EC2 instance launched (Ubuntu 22.04 LTS)
- [ ] Instance type: t2.small or higher selected
- [ ] 20 GB storage allocated
- [ ] Key pair (.pem file) downloaded and secured
- [ ] Security group configured:
  - [ ] SSH (22) - Your IP only
  - [ ] HTTP (80) - Anywhere
  - [ ] HTTPS (443) - Anywhere
- [ ] Elastic IP allocated and associated
- [ ] Can SSH into the instance

### Database (Choose One)
- [ ] **Option A**: PostgreSQL installed on EC2
  - [ ] Database created
  - [ ] User created with secure password
  - [ ] Permissions granted
  
- [ ] **Option B**: AWS RDS configured
  - [ ] RDS instance created (db.t3.micro)
  - [ ] Security group allows EC2 access
  - [ ] Endpoint URL copied
  - [ ] Master password saved securely

---

## 🛠️ Server Configuration

### System Setup
- [ ] Connected to EC2 via SSH
- [ ] System packages updated (`sudo apt update && sudo apt upgrade`)
- [ ] Node.js 18.x installed
- [ ] Build essentials installed (git, build-essential)
- [ ] PM2 installed globally
- [ ] Nginx installed
- [ ] Certbot installed (for SSL)

### Application Setup
- [ ] Repository cloned to `/home/ubuntu/chatgpt-web`
- [ ] Dependencies installed (`npm install`)
- [ ] Application built successfully (`npm run build`)
- [ ] `build/` directory created
- [ ] `dist/` directory created
- [ ] `logs/` directory created
- [ ] `ecosystem.config.js` configured with correct environment variables

---

## 🌐 Nginx & Domain

### Nginx Configuration
- [ ] `nginx.conf` copied to `/etc/nginx/sites-available/`
- [ ] Configuration file edited (domain or IP set)
- [ ] Symbolic link created in `/etc/nginx/sites-enabled/`
- [ ] Default site removed
- [ ] Nginx configuration tested (`sudo nginx -t`)
- [ ] Nginx restarted successfully
- [ ] Nginx enabled to start on boot

### Domain & DNS (If using domain)
- [ ] DNS A record created pointing to Elastic IP
- [ ] WWW CNAME record created (optional)
- [ ] DNS propagation completed (check with `nslookup yourdomain.com`)
- [ ] Can access site via domain

---

## 🚀 Application Deployment

### PM2 Setup
- [ ] Application started with PM2
- [ ] PM2 process list saved (`pm2 save`)
- [ ] PM2 startup command configured
- [ ] Startup command executed (as sudo if needed)
- [ ] Application status is "online" (`pm2 status`)
- [ ] Logs show no errors (`pm2 logs`)

### Testing
- [ ] Can access application via HTTP
- [ ] Frontend loads correctly
- [ ] API endpoints respond
- [ ] Database connection working
- [ ] User registration/login working
- [ ] File uploads working (if applicable)

---

## 🔒 Security & SSL

### SSL Certificate
- [ ] Certbot installed
- [ ] SSL certificate obtained (`sudo certbot --nginx`)
- [ ] HTTPS working correctly
- [ ] HTTP redirects to HTTPS
- [ ] Certificate auto-renewal configured
- [ ] Auto-renewal tested (`sudo certbot renew --dry-run`)

### Security Hardening
- [ ] SSH key is secure (chmod 400)
- [ ] Strong database password used
- [ ] Environment variables secured
- [ ] Unnecessary ports closed
- [ ] Firewall configured (ufw)
- [ ] Regular security updates enabled
- [ ] AWS security group minimized
- [ ] No sensitive data in logs

---

## 📊 Monitoring & Maintenance

### Monitoring Setup
- [ ] PM2 monitoring working (`pm2 monit`)
- [ ] Log rotation configured
- [ ] AWS CloudWatch configured (optional)
- [ ] Billing alerts set up
- [ ] Health check endpoint tested

### Backup Strategy
- [ ] Database backup method decided
- [ ] Backup schedule configured
- [ ] Backup restoration tested
- [ ] Code repository up to date

### Documentation
- [ ] Deployment steps documented
- [ ] Environment variables documented
- [ ] Team members have access
- [ ] Credentials stored securely (1Password, LastPass, etc.)

---

## 🔄 Post-Deployment

### Verification
- [ ] Application accessible from multiple locations
- [ ] Mobile responsiveness checked
- [ ] Performance tested
- [ ] Error monitoring configured
- [ ] Analytics set up (if needed)

### Deployment Scripts
- [ ] `deploy.sh` script tested
- [ ] `deploy.sh` made executable
- [ ] Update process verified
- [ ] Rollback plan documented

---

## 📱 Final Checks

- [ ] All features working as expected
- [ ] No console errors in browser
- [ ] No server errors in PM2 logs
- [ ] No Nginx errors in logs
- [ ] SSL certificate valid
- [ ] Performance is acceptable
- [ ] Mobile version works
- [ ] Cross-browser tested

---

## 🎉 Launch!

- [ ] Announce to stakeholders
- [ ] Monitor for 24 hours after launch
- [ ] Have rollback plan ready
- [ ] Celebrate! 🎊

---

## 📞 Emergency Contacts

**Key Information:**
```
EC2 IP: ___________________
Elastic IP: ________________
Domain: ____________________
Database: __________________
SSH Key Location: __________
```

**Quick Commands:**
```bash
# SSH into server
ssh -i your-key.pem ubuntu@YOUR-IP

# Check application status
pm2 status

# View logs
pm2 logs chatgpt-web

# Restart application
pm2 restart chatgpt-web

# Check nginx
sudo systemctl status nginx

# View nginx logs
sudo tail -f /var/log/nginx/chatgpt-web-error.log
```

---

## 🔧 Troubleshooting Resources

- [ ] DEPLOYMENT.md read thoroughly
- [ ] AWS-QUICKSTART.md reviewed
- [ ] PM2 documentation bookmarked
- [ ] Nginx documentation bookmarked
- [ ] Support contacts saved

**Remember:** Always test updates in a staging environment first!

