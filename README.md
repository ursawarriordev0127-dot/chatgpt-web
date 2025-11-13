<div align="center">
<img src="./src/assets/openai.svg" style="width:64px;height:64px;margin:0 32px" alt="icon"/>

<h1 align="center">ChatGPT Web</h1>

A commercially-viable ChatGpt web application built with React.

A deployable commercial ChatGpt web application.
  
</div>

### Screenshots

![cover](https://files.catbox.moe/tp963e.png)
![cover](https://files.catbox.moe/y5avbx.png)
![cover](https://files.catbox.moe/k16jsz.png)
![cover](https://files.catbox.moe/8o5oja.png)

## 🤖 Main Features

- **Admin Management System**: Comprehensive admin panel for managing users, tokens, products, activation codes, orders, and more
- **Dual Authentication**: Separate admin and user authentication with intelligent token management
- **Modern UI**: Carefully designed interface with responsive design and English localization
- **High Performance**: Extremely fast first screen loading speed (~100kb)
- **AI Model Support**: Support for GPT-3.5, GPT-4, GPT-5, Midjourney drawing, DALL·E model drawing, and other AI applications
- **Export Functionality**: One-click export chat records with full Markdown support
- **Flexible API**: Support for custom API addresses (e.g., [OpenAI](https://api.openai.com) / [API2D](https://api2d.com/r/192767))
- **Plugin System**: Extensible plugin architecture for custom functionality

## 🎮 Getting Started

### Prerequisites

**Node Environment**

`node` requires `^16 || ^18 || ^19` version (node >= 16.19.0), you can use nvm to manage multiple local node versions.

```
# Check node version
node -v

# Check npm version
npm -v

# Check yarn version
yarn -v
```

**Database**

- MySQL or PostgreSQL database
- Redis (optional, for queue and caching)

### Installation Steps

**1. Clone the repository**
```bash
git clone https://github.com/username/chatgpt-web.git
cd chatgpt-web
```

**2. Install dependencies**
```bash
yarn install
```

**3. Configure the server**

- Copy and configure database connection in `server/config/index.ts`
- Import the MySQL SQL file from `server/sql/` into your database
- Configure Redis connection if using queue features

**4. Run the project**

```bash
# Start web development server (frontend)
yarn dev:web

# Start server (backend) - in another terminal
yarn dev
```

**5. Build for production**
```bash
yarn build
```

## ⛺️ Environment Variables

> If deploying the project in frontend-backend separation mode, you need to fill in the following configuration

### Frontend Environment Variables

#### `VITE_APP_REQUEST_HOST` 

The `Host` address of the request server. This is required when the frontend and backend are deployed separately.

Example:
```env
VITE_APP_REQUEST_HOST=https://api.yourdomain.com
```

### Backend Configuration

Configure the following in `server/config/index.ts`:

- **Database**: MySQL or PostgreSQL connection settings
- **Redis**: Redis connection settings (optional)
- **Upload**: File upload configuration (OSS, COS, etc.)
- **Payment**: Payment gateway configuration (Alipay, WeChat Pay, etc.)
- **Email**: SMTP email configuration
- **SMS**: SMS service configuration

## 🚧 Development

> It is strongly not recommended to develop or deploy locally. Due to some technical reasons, it is difficult to configure the OpenAI API proxy locally, unless you can guarantee a direct connection to the OpenAI server.

#### Local Development

1. Install nodejs and yarn. For specific details, please ask ChatGPT
2. Execute `yarn install`
3. Web project development `yarn dev:web`
4. Server project development `yarn dev`
5. Build project `yarn build`

#### Server Setup

1. **Database Setup**
   - Import the MySQL SQL file from `server/sql/` into your database
   - Configure database connection in `server/config/index.ts`

2. **API Configuration**
   - Configure OpenAI API keys in the admin panel after first login
   - Set up payment gateways, email, SMS services as needed
   - Configure file upload services (OSS, COS, etc.) if needed

3. **API Documentation**
   - Frontend requests to the server [API Documentation](https://console-docs.apipost.cn/preview/38826c52f656ef05/044846bd536b67bb)
   - You can develop according to this API documentation

4. **First Admin Login**
   - Default admin credentials are typically set in the database
   - After login, configure AI model API keys in the admin panel
   - Ensure at least one API key is configured for the models you want to use (e.g., GPT-5, GPT-4)

## 🎯 Deployment

### 🚀 AWS EC2 Deployment (Recommended)

**Complete deployment guides are available:**

📘 **Quick Start (20 minutes):** See [DEPLOY-README.md](./DEPLOY-README.md) - Start here!  
📘 **AWS Quick Guide:** See [AWS-QUICKSTART.md](./AWS-QUICKSTART.md)  
📘 **Full Documentation:** See [DEPLOYMENT.md](./DEPLOYMENT.md)  
📁 **Directory Structure:** See [DIRECTORY-STRUCTURE.md](./DIRECTORY-STRUCTURE.md)  
✅ **Deployment Checklist:** See [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)

**Super Quick Deploy (5 commands):**
```bash
# 1. Connect to AWS
ssh -i your-key.pem ubuntu@your-ec2-ip

# 2. Install dependencies
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs build-essential git nginx
sudo npm install -g pm2

# 3. Clone & Build
cd /home/ubuntu
git clone https://github.com/YOUR-USERNAME/chatgpt-web.git
cd chatgpt-web
npm install && npm run build

# 4. Configure & Start
sudo cp nginx.conf /etc/nginx/sites-available/chatgpt-web
sudo ln -s /etc/nginx/sites-available/chatgpt-web /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
pm2 start ecosystem.config.js && pm2 save && pm2 startup

# 5. Done! Visit your EC2 IP address
```

This setup deploys both frontend and backend in one process using PM2 + Nginx.

### Frontend Deployment

> Simply upload the packaged `dist` directory of the `WEB` project to your web server. Pay attention to the server IP address location!

**Important Notes:**
- If deploying frontend and backend separately, set `VITE_APP_REQUEST_HOST` environment variable
- Ensure CORS is properly configured on the backend
- Configure proper routing for SPA (Single Page Application)

### Backend Deployment

1. Build the server:
   ```bash
   yarn build
   ```

2. Start the server:
   ```bash
   yarn start
   ```

3. Or use PM2 for process management:
   ```bash
   pm2 start build/index.js --name chatgpt-web
   ```