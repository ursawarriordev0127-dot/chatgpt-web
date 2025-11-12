# How to Install and Start Redis on Windows

## Option 1: Using WSL (Windows Subsystem for Linux) - Recommended

### Step 1: Install WSL (if not already installed)
Open PowerShell as Administrator and run:
```powershell
wsl --install
```
Then restart your computer.

### Step 2: Install Redis in WSL
After restart, open WSL (Ubuntu) and run:
```bash
sudo apt update
sudo apt install redis-server -y
```

### Step 3: Start Redis in WSL
```bash
sudo service redis-server start
```

### Step 4: Configure Redis Password (Optional but Recommended)
Edit Redis config:
```bash
sudo nano /etc/redis/redis.conf
```
Find `# requirepass` and change it to:
```
requirepass chatgpt-web
```
Then restart Redis:
```bash
sudo service redis-server restart
```

### Step 5: Make Redis accessible from Windows
Edit `/etc/redis/redis.conf` and change:
```
bind 127.0.0.1
```
to:
```
bind 0.0.0.0
```

Then restart Redis.

---

## Option 2: Using Memurai (Windows Native)

1. Download Memurai from: https://www.memurai.com/get-memurai
2. Install it (free for development)
3. Set password to `chatgpt-web` in the configuration
4. Start the service

---

## Option 3: Using Docker (if you have Docker Desktop)

```powershell
docker run -d --name redis -p 6379:6379 redis:latest redis-server --requirepass chatgpt-web
```

---

## Option 4: Download Redis for Windows (Unofficial)

1. Download from: https://github.com/tporadowski/redis/releases
2. Extract and run `redis-server.exe`
3. Configure password in `redis.windows.conf`

---

## Verify Redis is Running

After installation, test the connection:
```powershell
# If using WSL:
wsl redis-cli -a chatgpt-web ping

# Should return: PONG
```

---

## Update Your Project Config

Make sure your `server/config/index.ts` matches your Redis setup:
- Host: `127.0.0.1` (or `localhost`)
- Port: `6379`
- Password: `chatgpt-web`

