# 📁 ChatGPT-Web Directory Structure Guide

This document explains the directory structure of the ChatGPT-Web project and how it's organized on AWS for deployment.

---

## 🏗️ Project Structure Overview

```
chatgpt-web/
├── 📁 server/                      # Backend code (Node.js/Express)
│   ├── 📁 config/                  # Server configuration
│   ├── 📁 helpers/                 # Helper functions
│   ├── 📁 middlewares/             # Express middlewares
│   ├── 📁 models/                  # Database models
│   ├── 📁 routers/                 # API routes
│   ├── 📁 scripts/                 # Database migration scripts
│   └── index.ts                    # Server entry point
│
├── 📁 src/                         # Frontend code (React)
│   ├── 📁 components/              # React components
│   ├── 📁 pages/                   # Page components
│   ├── 📁 request/                 # API request handlers
│   ├── 📁 store/                   # State management
│   └── main.tsx                    # Frontend entry point
│
├── 📁 public/                      # Public static files
│
├── 📄 ecosystem.config.js          # PM2 configuration
├── 📄 nginx.conf                   # Nginx configuration
├── 📄 package.json                 # Dependencies
├── 📄 tsconfig.json                # TypeScript config
├── 📄 vite.config.ts               # Vite config
│
├── 📄 deploy.sh                    # Deployment script
├── 📄 aws-setup.sh                 # AWS initial setup script
├── 📄 DEPLOYMENT.md                # Full deployment guide
├── 📄 AWS-QUICKSTART.md            # Quick AWS guide
└── 📄 DEPLOYMENT-CHECKLIST.md      # Deployment checklist
```

---

## 🏭 Production Directory Structure (On AWS)

After deployment, your AWS server will have this structure:

```
/home/ubuntu/
├── chatgpt-web/                    # Main application directory
│   ├── 📁 build/                   # ✅ Compiled backend (from tsc)
│   │   ├── index.js                # Main server file
│   │   ├── config/
│   │   ├── helpers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   └── routers/
│   │
│   ├── 📁 dist/                    # ✅ Built frontend (from vite build)
│   │   ├── index.html
│   │   ├── assets/
│   │   │   ├── index-[hash].js
│   │   │   └── index-[hash].css
│   │   └── ...
│   │
│   ├── 📁 uploads/                 # User uploaded files
│   │
│   ├── 📁 logs/                    # Application logs
│   │   ├── err.log                 # PM2 error logs
│   │   └── out.log                 # PM2 output logs
│   │
│   ├── 📁 node_modules/            # Dependencies
│   │
│   ├── 📁 server/                  # Source backend code
│   ├── 📁 src/                     # Source frontend code
│   │
│   ├── ecosystem.config.js
│   ├── nginx.conf
│   ├── deploy.sh
│   └── package.json
```

---

## 🔄 Build Process Flow

```
Development → Build → Production

┌─────────────────┐
│   Source Code   │
├─────────────────┤
│ server/ (TS)    │──┐
│ src/ (React)    │  │
└─────────────────┘  │
                     │
                     ▼
              ┌──────────────┐
              │ npm run build │
              └──────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
    ┌─────────┐            ┌─────────┐
    │ tsc     │            │  vite   │
    │ compile │            │  build  │
    └─────────┘            └─────────┘
         │                       │
         ▼                       ▼
    📁 build/              📁 dist/
    (Backend JS)           (Frontend)
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
            ┌─────────────────┐
            │   PM2 starts    │
            │  build/index.js │
            └─────────────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Express serves: │
            │ - API (/api/*)  │
            │ - Static (dist/)│
            └─────────────────┘
```

---

## 🌐 Request Flow in Production

```
User Browser
    │
    ▼
┌─────────────────────────────────┐
│  Internet (Port 80/443)         │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  AWS EC2: 3.145.68.209          │
│  ┌───────────────────────────┐  │
│  │  Nginx (Port 80/443)      │  │
│  │  Reverse Proxy            │  │
│  └───────────────────────────┘  │
│         │                        │
│         ▼                        │
│  ┌───────────────────────────┐  │
│  │  PM2 → Node.js/Express    │  │
│  │  (Port 3000)              │  │
│  └───────────────────────────┘  │
│         │                        │
│    ┌────┴────┐                  │
│    ▼         ▼                   │
│  [API]   [Static Files]          │
│  /api/*   /dist/*                │
│    │         │                   │
│    ▼         ▼                   │
│  [DB]    [React App]             │
└─────────────────────────────────┘
```

---

## 📦 Key Directories Explained

### `/build/` - Compiled Backend
- **Created by**: `tsc -p tsconfig.node.json`
- **Contains**: Compiled JavaScript from TypeScript
- **Used by**: PM2 runs `build/index.js`
- **Note**: This is what actually runs in production

### `/dist/` - Built Frontend
- **Created by**: `vite build`
- **Contains**: Optimized, bundled React application
- **Served by**: Express static middleware
- **Note**: All frontend assets are in this directory

### `/uploads/` - User Files
- **Created by**: Application at runtime
- **Contains**: User uploaded images, files, etc.
- **Served by**: Express static middleware at `/static/uploads`
- **Note**: Should be backed up regularly

### `/logs/` - Application Logs
- **Created by**: PM2
- **Contains**: 
  - `out.log` - Standard output
  - `err.log` - Error output
- **Used for**: Debugging and monitoring
- **Note**: Configure log rotation with PM2

### `/node_modules/` - Dependencies
- **Created by**: `npm install`
- **Contains**: All NPM packages
- **Size**: Can be large (~500MB+)
- **Note**: Not committed to git

---

## 🚀 Deployment Directory Flow

### Initial Setup
```bash
# 1. Connect to AWS
ssh -i casey.pem ubuntu@3.145.68.209

# 2. Clone repository
cd /home/ubuntu
git clone https://github.com/YOUR-USERNAME/chatgpt-web.git
cd chatgpt-web

# Result:
/home/ubuntu/chatgpt-web/
├── server/
├── src/
├── package.json
└── ...
```

### Build Phase
```bash
# 3. Install and build
npm install
npm run build

# Result:
/home/ubuntu/chatgpt-web/
├── build/          # ✅ NEW - Compiled backend
├── dist/           # ✅ NEW - Built frontend
├── node_modules/   # ✅ NEW - Dependencies
├── server/         # Source code
├── src/            # Source code
└── ...
```

### Runtime Phase
```bash
# 4. Start with PM2
pm2 start ecosystem.config.js

# PM2 Process:
- Runs: /home/ubuntu/chatgpt-web/build/index.js
- Serves: /home/ubuntu/chatgpt-web/dist/* (static files)
- Logs: /home/ubuntu/chatgpt-web/logs/*
```

---

## 📊 File Sizes (Approximate)

```
Directory          Size    Description
────────────────────────────────────────────────
build/             5-10MB  Compiled backend
dist/              2-5MB   Built frontend
node_modules/      500MB+  Dependencies
uploads/           Varies  User files
logs/              Varies  Application logs
src/ + server/     10-20MB Source code
```

---

## 🔐 Important Paths on AWS

```bash
# Application
/home/ubuntu/chatgpt-web/                    # Main app directory
/home/ubuntu/chatgpt-web/build/index.js      # Running application
/home/ubuntu/chatgpt-web/logs/               # Application logs

# Nginx
/etc/nginx/sites-available/chatgpt-web       # Nginx config
/etc/nginx/sites-enabled/chatgpt-web         # Enabled config symlink
/var/log/nginx/chatgpt-web-access.log        # Nginx access logs
/var/log/nginx/chatgpt-web-error.log         # Nginx error logs

# PM2
/home/ubuntu/.pm2/                           # PM2 data
/home/ubuntu/.pm2/logs/                      # PM2 logs (if not custom)

# SSL Certificates (after certbot)
/etc/letsencrypt/live/yourdomain.com/        # SSL certificates
```

---

## 🔧 Common Directory Operations

### Check Directory Sizes
```bash
cd /home/ubuntu/chatgpt-web
du -sh *
```

### Clean Build Files
```bash
# Remove build artifacts
rm -rf build/ dist/

# Rebuild
npm run build
```

### Clean Node Modules
```bash
# Remove dependencies
rm -rf node_modules/

# Reinstall
npm install
```

### View Directory Structure
```bash
# Install tree (if not installed)
sudo apt install tree

# View structure
tree -L 2 -I 'node_modules|build|dist'
```

### Backup Important Directories
```bash
# Backup uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/

# Backup database (if local)
pg_dump chatgpt_db > db-backup-$(date +%Y%m%d).sql
```

---

## 🎯 Directory Checklist After Deployment

```bash
cd /home/ubuntu/chatgpt-web

# Verify all required directories exist
ls -la

# Should see:
✅ build/          # Compiled backend
✅ dist/           # Built frontend  
✅ node_modules/   # Dependencies
✅ logs/           # Log files
✅ server/         # Source code
✅ src/            # Source code
✅ package.json    # Dependencies config
✅ ecosystem.config.js  # PM2 config
```

---

## 📝 Notes

1. **Never commit** `build/`, `dist/`, or `node_modules/` to git
2. **Always backup** `uploads/` directory
3. **Monitor** `logs/` directory size (set up log rotation)
4. **Source code** (`server/` and `src/`) is only needed for development/building
5. **Production** only needs `build/`, `dist/`, and `node_modules/`

---

## 🔗 Related Documentation

- See `DEPLOYMENT.md` for full deployment guide
- See `AWS-QUICKSTART.md` for quick AWS setup
- See `DEPLOYMENT-CHECKLIST.md` for deployment checklist

