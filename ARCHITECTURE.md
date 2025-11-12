# 🏗️ ChatGPT-Web Architecture

Visual guide to understand how the application is structured and deployed.

---

## 🌐 Production Architecture on AWS

```
┌─────────────────────────────────────────────────────────────────────┐
│                           INTERNET                                  │
│                     (Users access your app)                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS (Port 80/443)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      AWS ROUTE 53 (Optional)                        │
│                    yourdomain.com → 3.145.68.209                    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   AWS EC2 Instance: 3.145.68.209                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    NGINX (Reverse Proxy)                     │  │
│  │  - Handles SSL/TLS (HTTPS)                                   │  │
│  │  - Static file caching                                       │  │
│  │  - Request routing                                           │  │
│  │  - Security headers                                          │  │
│  │  Port: 80/443 → 3000                                         │  │
│  └────────────────────────┬─────────────────────────────────────┘  │
│                           │                                         │
│                           ▼                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    PM2 Process Manager                       │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │         Node.js/Express (build/index.js)               │ │  │
│  │  │         Port: 3000                                      │ │  │
│  │  │  ┌──────────────────┬──────────────────┐               │ │  │
│  │  │  │                  │                  │               │ │  │
│  │  │  ▼                  ▼                  ▼               │ │  │
│  │  │  Backend API    Static Files      Uploads             │ │  │
│  │  │  /api/*         /dist/*           /uploads/*          │ │  │
│  │  │  ↓              ↓                  ↓                   │ │  │
│  │  │  [Routes]      [React App]       [User Files]         │ │  │
│  │  │  [Models]      [HTML/CSS/JS]                          │ │  │
│  │  │  [DB Calls]                                           │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────┬───────────────────────────────────┘  │
│                             │                                       │
│                             ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database (Local/RDS)                 │  │
│  │              - User data                                     │  │
│  │              - Chat history                                  │  │
│  │              - Application settings                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📂 File Structure Flow

### Development (Your Machine)
```
chatgpt-web/
├── server/               ← TypeScript backend source
│   ├── index.ts
│   ├── config/
│   ├── routers/
│   └── models/
│
└── src/                  ← React frontend source
    ├── main.tsx
    ├── components/
    └── pages/
```

### Build Process
```
npm run build
    │
    ├─→ tsc (TypeScript Compiler)
    │   └─→ Compiles server/ → build/
    │
    └─→ vite build
        └─→ Bundles src/ → dist/
```

### Production (AWS Server)
```
/home/ubuntu/chatgpt-web/
├── build/                ← 🚀 RUNS (Compiled backend)
│   ├── index.js
│   └── ...
│
├── dist/                 ← 🌐 SERVED (Built frontend)
│   ├── index.html
│   ├── assets/
│   └── ...
│
└── uploads/              ← 📁 USER FILES
```

---

## 🔄 Request Flow Examples

### Example 1: User Loads Homepage
```
User types: http://3.145.68.209
    │
    ▼
Nginx receives request on port 80
    │
    ▼
Nginx proxies to: localhost:3000
    │
    ▼
Express (build/index.js) receives request
    │
    ▼
Express checks route: GET /
    │
    ▼
Express serves: dist/index.html
    │
    ▼
Browser receives HTML
    │
    ▼
Browser requests: assets/index-[hash].js
    │
    ▼
Express serves: dist/assets/index-[hash].js
    │
    ▼
React app loads in browser
```

### Example 2: User Sends Chat Message
```
User types message in React app
    │
    ▼
React sends: POST /api/chat
    │
    ▼
Nginx proxies to: localhost:3000/api/chat
    │
    ▼
Express routes to: server/routers/apis/chat.ts
    │
    ▼
Chat handler processes request
    │
    ├─→ Queries PostgreSQL database
    │   └─→ Gets user info, history, etc.
    │
    ├─→ Calls OpenAI API
    │   └─→ Gets AI response
    │
    └─→ Saves to database
        └─→ Returns response to React
            │
            ▼
        User sees AI response
```

### Example 3: User Uploads File
```
User uploads image
    │
    ▼
React sends: POST /api/upload (multipart/form-data)
    │
    ▼
Express receives file
    │
    ▼
Multer middleware saves to: uploads/
    │
    ▼
Returns file URL: /static/uploads/filename.jpg
    │
    ▼
React displays image from: http://3.145.68.209/static/uploads/filename.jpg
```

---

## 🔐 Security Layers

```
┌─────────────────────────────────────────┐
│   Layer 1: AWS Security Group           │
│   - Firewall at AWS level               │
│   - Only allows ports 22, 80, 443       │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   Layer 2: UFW (Ubuntu Firewall)        │
│   - Server-level firewall               │
│   - Blocks unauthorized access          │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   Layer 3: Nginx                        │
│   - SSL/TLS encryption                  │
│   - Security headers                    │
│   - Rate limiting (optional)            │
│   - Request validation                  │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   Layer 4: Express Middleware           │
│   - Authentication (JWT)                │
│   - Request validation                  │
│   - CORS policies                       │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   Layer 5: Database                     │
│   - Password hashing                    │
│   - Parameterized queries               │
│   - Connection pooling                  │
└─────────────────────────────────────────┘
```

---

## 💾 Data Flow

### User Registration
```
Frontend Form → POST /api/register → Express Validator
                                           │
                                           ▼
                                    Password Hashing
                                           │
                                           ▼
                                    PostgreSQL Insert
                                           │
                                           ▼
                                    Return JWT Token
                                           │
                                           ▼
                                    Store in Frontend
```

### Chat Conversation
```
User Message → POST /api/chat → Verify JWT
                                      │
                                      ▼
                                Check Quota/Balance
                                      │
                                      ▼
                                Save Message to DB
                                      │
                                      ▼
                                Call OpenAI API
                                      │
                                      ▼
                                Save AI Response
                                      │
                                      ▼
                                Update User Balance
                                      │
                                      ▼
                                Return to Frontend
```

---

## 🚀 Deployment Process Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. LOCAL DEVELOPMENT                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  git add . && git commit -m "Update"                │   │
│  │  git push origin main                               │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  2. GITHUB REPOSITORY                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Code pushed to GitHub                              │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  3. AWS EC2: Pull Updates                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ssh -i casey.pem ubuntu@3.145.68.209               │   │
│  │  cd /home/ubuntu/chatgpt-web                        │   │
│  │  git pull origin main                               │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  4. BUILD                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  npm install                                        │   │
│  │  npm run build                                      │   │
│  │  Creates: build/ + dist/                           │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  5. RESTART                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  pm2 restart chatgpt-web                            │   │
│  │  Application reloads with new code                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Resource Usage (Typical)

```
Component          CPU    Memory   Disk    Notes
─────────────────────────────────────────────────────────────
Node.js Process    10-30%  200-500MB  -     Under normal load
Nginx              1-5%    10-50MB    -     Very efficient
PostgreSQL         5-15%   100-300MB  5GB   Depends on data
Total System       20-50%  500MB-1GB  10GB  With overhead

Recommended EC2: t2.small (2GB RAM, 1 vCPU)
Minimum EC2: t2.micro (1GB RAM) - may be tight
```

---

## 🔄 High Availability (Optional)

For production systems that need 99.9% uptime:

```
┌─────────────────────────────────────────────────────────┐
│            AWS Application Load Balancer                │
│                     (Port 80/443)                       │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
               ▼                      ▼
        ┌────────────┐         ┌────────────┐
        │  EC2 #1    │         │  EC2 #2    │
        │  PM2+Nginx │         │  PM2+Nginx │
        └─────┬──────┘         └─────┬──────┘
              │                      │
              └──────────┬───────────┘
                         │
                         ▼
              ┌───────────────────┐
              │    AWS RDS        │
              │  (Primary/Standby)│
              └───────────────────┘
```

---

## 🎯 Quick Reference

### Ports
- **80** - HTTP (Nginx)
- **443** - HTTPS (Nginx)
- **3000** - Node.js (Internal only)
- **22** - SSH (Admin only)

### Key Paths
- **Application**: `/home/ubuntu/chatgpt-web/`
- **Running Code**: `/home/ubuntu/chatgpt-web/build/index.js`
- **Static Files**: `/home/ubuntu/chatgpt-web/dist/`
- **User Uploads**: `/home/ubuntu/chatgpt-web/uploads/`
- **Logs**: `/home/ubuntu/chatgpt-web/logs/`

### Processes
- **PM2**: Runs Node.js, auto-restart on crash
- **Nginx**: Web server, reverse proxy, SSL
- **PostgreSQL**: Database (local or RDS)

---

## 📚 Learn More

- **Getting Started**: [DEPLOY-README.md](./DEPLOY-README.md)
- **Quick Setup**: [AWS-QUICKSTART.md](./AWS-QUICKSTART.md)
- **Full Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **File Structure**: [DIRECTORY-STRUCTURE.md](./DIRECTORY-STRUCTURE.md)

