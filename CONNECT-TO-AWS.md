# 🔌 Connect to Your AWS Server

Quick reference for connecting to your AWS EC2 instance.

---

## 📋 Your Server Details

```
AWS EC2 IP:    3.145.68.209
Username:      ubuntu
Key File:      casey.pem
Location:      /home/ubuntu/chatgpt-web
```

---

## 🚀 Quick Connect

### On Windows (PowerShell)
```powershell
# Navigate to where your casey.pem is located
cd path\to\your\key

# Connect
ssh -i casey.pem ubuntu@3.145.68.209
```

### On Windows (WSL/Git Bash)
```bash
# Set correct permissions (first time only)
chmod 400 casey.pem

# Connect
ssh -i casey.pem ubuntu@3.145.68.209
```

### On Mac/Linux
```bash
# Set correct permissions (first time only)
chmod 400 casey.pem

# Connect
ssh -i casey.pem ubuntu@3.145.68.209
```

---

## 📁 After Connection

```bash
# Navigate to application directory
cd /home/ubuntu/chatgpt-web

# Check application status
pm2 status

# View logs
pm2 logs chatgpt-web

# Check nginx status
sudo systemctl status nginx
```

---

## 🔄 Common Tasks

### Deploy Updates
```bash
ssh -i casey.pem ubuntu@3.145.68.209
cd /home/ubuntu/chatgpt-web
./deploy.sh
```

### Check Application Status
```bash
ssh -i casey.pem ubuntu@3.145.68.209
pm2 status
pm2 logs chatgpt-web
```

### Restart Application
```bash
ssh -i casey.pem ubuntu@3.145.68.209
pm2 restart chatgpt-web
```

### View Logs
```bash
ssh -i casey.pem ubuntu@3.145.68.209
cd /home/ubuntu/chatgpt-web
pm2 logs chatgpt-web --lines 100
```

---

## 🌐 Access Your Application

```
HTTP:  http://3.145.68.209
HTTPS: https://3.145.68.209 (after SSL setup)
```

If you have a domain configured:
```
HTTP:  http://yourdomain.com
HTTPS: https://yourdomain.com
```

---

## 📤 File Transfer

### Upload Files to Server (SCP)
```bash
# Upload single file
scp -i casey.pem local-file.txt ubuntu@3.145.68.209:/home/ubuntu/chatgpt-web/

# Upload directory
scp -i casey.pem -r local-directory ubuntu@3.145.68.209:/home/ubuntu/chatgpt-web/
```

### Download Files from Server
```bash
# Download single file
scp -i casey.pem ubuntu@3.145.68.209:/home/ubuntu/chatgpt-web/logs/err.log ./

# Download directory
scp -i casey.pem -r ubuntu@3.145.68.209:/home/ubuntu/chatgpt-web/logs ./
```

### Using SFTP
```bash
sftp -i casey.pem ubuntu@3.145.68.209

# SFTP commands:
# cd /home/ubuntu/chatgpt-web
# ls
# get remote-file.txt
# put local-file.txt
# exit
```

---

## 🔧 SSH Config (Optional - For Easier Connection)

Create/edit `~/.ssh/config`:

```
Host chatgpt-aws
    HostName 3.145.68.209
    User ubuntu
    IdentityFile ~/path/to/casey.pem
    ServerAliveInterval 60
```

Then connect with just:
```bash
ssh chatgpt-aws
```

---

## 🛠️ Troubleshooting Connection

### Permission Denied (publickey)
```bash
# Make sure key has correct permissions
chmod 400 casey.pem

# Verify you're using the right key
ssh -i casey.pem -v ubuntu@3.145.68.209
```

### Connection Timeout
```bash
# Check AWS Security Group allows your IP on port 22
# Verify instance is running in AWS Console
# Check your internet connection
```

### Host Key Verification Failed
```bash
# Remove old host key
ssh-keygen -R 3.145.68.209

# Connect again
ssh -i casey.pem ubuntu@3.145.68.209
```

---

## 💡 Useful One-Liners

```bash
# Check if server is responding
ping 3.145.68.209

# Quick status check
ssh -i casey.pem ubuntu@3.145.68.209 "pm2 status && systemctl status nginx"

# View last 50 lines of logs
ssh -i casey.pem ubuntu@3.145.68.209 "pm2 logs chatgpt-web --lines 50 --nostream"

# Restart application remotely
ssh -i casey.pem ubuntu@3.145.68.209 "cd /home/ubuntu/chatgpt-web && pm2 restart chatgpt-web"

# Check disk space
ssh -i casey.pem ubuntu@3.145.68.209 "df -h"

# Check memory usage
ssh -i casey.pem ubuntu@3.145.68.209 "free -m"
```

---

## 📞 Emergency Commands

If something goes wrong:

```bash
# Connect to server
ssh -i casey.pem ubuntu@3.145.68.209

# Check what's wrong
pm2 logs chatgpt-web --err --lines 100
sudo tail -f /var/log/nginx/chatgpt-web-error.log

# Restart everything
pm2 restart chatgpt-web
sudo systemctl restart nginx

# If still not working, check if running
pm2 list
sudo systemctl status nginx

# Check if port 3000 is in use
sudo lsof -i :3000

# Nuclear option - restart from scratch
pm2 delete chatgpt-web
cd /home/ubuntu/chatgpt-web
npm run build
pm2 start ecosystem.config.js
pm2 save
```

---

## 🔒 Security Notes

1. **Never share** your `casey.pem` file
2. **Keep it secure** with proper permissions (chmod 400)
3. **Backup** your key file in a secure location
4. **Rotate keys** periodically for security
5. **Use strong passwords** for database and other services

---

## 📚 Next Steps

1. **First Time Setup**: See `AWS-QUICKSTART.md`
2. **Full Deployment**: See `DEPLOYMENT.md`
3. **Directory Structure**: See `DIRECTORY-STRUCTURE.md`
4. **Checklist**: See `DEPLOYMENT-CHECKLIST.md`

