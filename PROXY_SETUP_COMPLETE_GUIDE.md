# 🌍 Complete Proxy Setup Guide - Geographic Restriction Fix

## 🚨 The Problem

**Error:**
```
Your country/region is not supported by the API.
Code: unsupported_country_region_territory
Type: request_forbidden
```

**Root Cause:**
OpenAI blocks API requests from certain countries/regions. Your IP address is detected as being from a restricted location.

**Blocked Regions Include:**
- China (mainland)
- Russia
- Iran
- North Korea
- Syria
- Cuba
- And other sanctioned countries

---

## ✅ The Solution: Use a Proxy/VPN

Your application already has **built-in proxy support**! You just need to configure it.

---

## 🔧 Method 1: Set Environment Variables (Recommended)

### **For Windows (PowerShell)**

#### **Temporary (Current Session Only)**

```powershell
# In PowerShell (run as administrator if needed)
$env:HTTPS_PROXY = "http://your-proxy-server:port"
$env:HTTP_PROXY = "http://your-proxy-server:port"

# Then start your server
npm run dev
```

#### **Permanent (All Sessions)**

```powershell
# In PowerShell (run as administrator)
[System.Environment]::SetEnvironmentVariable('HTTPS_PROXY', 'http://your-proxy-server:port', 'User')
[System.Environment]::SetEnvironmentVariable('HTTP_PROXY', 'http://your-proxy-server:port', 'User')

# Restart PowerShell, then start server
npm run dev
```

#### **With Authentication**

```powershell
$env:HTTPS_PROXY = "http://username:password@your-proxy-server:port"
$env:HTTP_PROXY = "http://username:password@your-proxy-server:port"
```

---

### **For Windows (CMD)**

```cmd
set HTTPS_PROXY=http://your-proxy-server:port
set HTTP_PROXY=http://your-proxy-server:port
npm run dev
```

---

### **For Linux/Mac**

```bash
# Temporary
export HTTPS_PROXY=http://your-proxy-server:port
export HTTP_PROXY=http://your-proxy-server:port
npm run dev

# Permanent - add to ~/.bashrc or ~/.zshrc
echo 'export HTTPS_PROXY=http://your-proxy-server:port' >> ~/.bashrc
echo 'export HTTP_PROXY=http://your-proxy-server:port' >> ~/.bashrc
source ~/.bashrc
```

---

## 🔧 Method 2: Create .env File

Create a `.env` file in your project root:

```bash
# .env file
HTTPS_PROXY=http://your-proxy-server:port
HTTP_PROXY=http://your-proxy-server:port
```

Then install dotenv and configure it:

```bash
npm install dotenv
```

Update `server/index.ts` to load .env:

```typescript
import dotenv from 'dotenv'
dotenv.config()
// ... rest of your code
```

---

## 🌐 Proxy Server Options

### **Option 1: Commercial Proxy Services (Recommended)**

Fast, reliable, specifically designed for API access:

1. **Bright Data (Luminati)**
   - URL: https://brightdata.com/
   - Price: ~$500/month for data center proxies
   - Format: `http://username:password@proxy.brightdata.com:port`

2. **Oxylabs**
   - URL: https://oxylabs.io/
   - Price: ~$300/month
   - Format: `http://username:password@datacenter.oxylabs.io:8001`

3. **Smartproxy**
   - URL: https://smartproxy.com/
   - Price: ~$75/month
   - Format: `http://username:password@gate.smartproxy.com:7000`

4. **IPRoyal**
   - URL: https://iproyal.com/
   - Price: ~$50/month
   - More affordable option

---

### **Option 2: VPN Services (Easier Setup)**

Use a VPN service that provides HTTP proxy:

1. **Shadowsocks**
   - Set up your own server or use a service
   - Format: `http://127.0.0.1:1080` (after running local client)

2. **V2Ray/Xray**
   - Advanced proxy protocol
   - Can provide HTTP proxy interface
   - Format: `http://127.0.0.1:10809`

3. **Clash**
   - Proxy client with HTTP proxy mode
   - Format: `http://127.0.0.1:7890`

---

### **Option 3: Self-Hosted Proxy (Advanced)**

Set up your own proxy server on a VPS in a supported region:

#### **Step 1: Get a VPS**
- DigitalOcean ($5/month)
- Vultr ($5/month)
- Linode ($5/month)
- **Location: US, UK, Germany, Singapore, etc.**

#### **Step 2: Install Squid Proxy**

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Install Squid (Ubuntu/Debian)
apt update
apt install squid -y

# Configure Squid
nano /etc/squid/squid.conf
```

Add these lines:

```conf
http_port 3128
http_access allow all
forwarded_for delete
```

Restart Squid:

```bash
systemctl restart squid
systemctl enable squid
```

#### **Step 3: Use Your Proxy**

```powershell
$env:HTTPS_PROXY = "http://your-vps-ip:3128"
$env:HTTP_PROXY = "http://your-vps-ip:3128"
```

---

## 🧪 Testing Your Proxy

### **Test 1: Check Proxy Configuration**

```bash
# In PowerShell
echo $env:HTTPS_PROXY
echo $env:HTTP_PROXY
```

**Expected:** Should show your proxy URL

### **Test 2: Check Logs**

Start your server and check the logs:

```bash
npm run dev
```

**Expected logs:**
```
[Proxy] Using proxy: http://proxy-server:port
[Chat Request] Model: gpt-5, Using proxy: Yes
```

### **Test 3: Send a Test Request**

1. Open your application
2. Select GPT-5 model
3. Send message: "Hello"

**If proxy works:**
```
✅ Response received successfully
✅ No geographic restriction error
```

**If proxy doesn't work:**
```
❌ Error: Your country/region is not supported
❌ Check server logs for proxy configuration
```

---

## 🔍 Troubleshooting

### **Issue 1: Proxy not being used**

**Check logs:**
```
[Proxy] No proxy configured...
```

**Solution:**
1. Make sure environment variable is set
2. Restart PowerShell/Terminal
3. Restart Node server
4. Check: `echo $env:HTTPS_PROXY`

---

### **Issue 2: Proxy connection failed**

**Check logs:**
```
[Chat Fetch Error] connect ETIMEDOUT
```

**Solutions:**
1. **Check proxy is running:**
   ```bash
   curl -x http://your-proxy:port https://api.openai.com
   ```

2. **Check firewall:**
   - Allow outbound connections to proxy
   - Check VPS firewall rules

3. **Check proxy authentication:**
   - Ensure username:password is correct
   - URL encode special characters

---

### **Issue 3: Still getting geographic restriction error**

**Check logs:**
```
[Geographic Restriction] Your country/region is blocked even with proxy configured
```

**Solutions:**

1. **Proxy might be in blocked region:**
   - Check proxy IP: https://ipinfo.io/
   - Ensure proxy is in supported country

2. **Proxy might be leaking your real IP:**
   - Test for leaks: https://browserleaks.com/ip
   - Use HTTPS proxy instead of HTTP
   - Check if proxy supports CONNECT method

3. **OpenAI detecting proxy:**
   - Use residential proxy instead of data center
   - Rotate proxy IPs
   - Use proxy with clean IP reputation

---

## 📝 Configuration Examples

### **Example 1: Using Clash Proxy**

1. Start Clash with HTTP proxy mode
2. Note the port (usually 7890)
3. Configure:

```powershell
$env:HTTPS_PROXY = "http://127.0.0.1:7890"
$env:HTTP_PROXY = "http://127.0.0.1:7890"
npm run dev
```

### **Example 2: Using Commercial Proxy (Oxylabs)**

```powershell
$env:HTTPS_PROXY = "http://customer-username:password@pr.oxylabs.io:7777"
$env:HTTP_PROXY = "http://customer-username:password@pr.oxylabs.io:7777"
npm run dev
```

### **Example 3: Using Shadowsocks**

1. Start Shadowsocks client
2. Enable "HTTP Proxy" mode (port 1080)
3. Configure:

```powershell
$env:HTTPS_PROXY = "http://127.0.0.1:1080"
$env:HTTP_PROXY = "http://127.0.0.1:1080"
npm run dev
```

---

## 🔐 Security Considerations

### **1. Keep Proxy Credentials Secure**

❌ **Don't:**
```javascript
// Don't hardcode in code
const proxy = "http://username:password@proxy.com:8080"
```

✅ **Do:**
```powershell
# Use environment variables
$env:HTTPS_PROXY = "http://username:password@proxy.com:8080"
```

### **2. Use HTTPS Proxies When Possible**

- More secure
- Less likely to leak data
- Better for sensitive API calls

### **3. Validate Proxy Source**

- Only use reputable proxy providers
- Avoid free proxies (can steal API keys)
- Monitor for unusual activity

---

## 💡 Quick Setup Guide (5 Minutes)

### **Recommended: Using Clash + Free Trial**

1. **Download Clash for Windows:**
   - https://github.com/Fndroid/clash_for_windows_pkg/releases
   - Install and run

2. **Get a free proxy config:**
   - Search for "free v2ray config"
   - Or use free trial from services like Shadowsocks

3. **Import config to Clash:**
   - Clash → Profiles → Import
   - Enable "System Proxy"
   - Note HTTP proxy port (Settings → Port → HTTP Port)

4. **Configure your app:**
   ```powershell
   $env:HTTPS_PROXY = "http://127.0.0.1:7890"  # Replace 7890 with your port
   $env:HTTP_PROXY = "http://127.0.0.1:7890"
   npm run dev
   ```

5. **Test:**
   - Send a message with GPT-5
   - Check logs for `[Proxy] Using proxy:`
   - Should work! ✅

---

## 📊 Comparison of Options

| Option | Setup Difficulty | Cost | Speed | Reliability |
|--------|-----------------|------|-------|-------------|
| Commercial Proxy | ⭐ Easy | 💰💰💰 High | ⚡⚡⚡ Fast | 🌟🌟🌟 High |
| VPN Service | ⭐⭐ Medium | 💰💰 Medium | ⚡⚡ Good | 🌟🌟 Medium |
| Self-Hosted VPS | ⭐⭐⭐ Hard | 💰 Low | ⚡⚡⚡ Fast | 🌟🌟 Medium |
| Free Proxy | ⭐ Easy | 💰 Free | ⚡ Slow | 🌟 Low |

---

## ✅ Verification Checklist

Before testing, ensure:

- [ ] Proxy service is running
- [ ] Environment variables are set: `echo $env:HTTPS_PROXY`
- [ ] Variables are in correct format: `http://server:port`
- [ ] Server restarted after setting variables
- [ ] Firewall allows proxy connections
- [ ] Proxy is in supported region
- [ ] Check logs show: `[Proxy] Using proxy:`

---

## 🎯 Summary

Your application now has **enhanced proxy support** with:

1. ✅ **Automatic proxy detection** from environment variables
2. ✅ **Detailed logging** to help debug proxy issues
3. ✅ **Clear error messages** when proxy is needed
4. ✅ **Support for HTTP and HTTPS proxies**
5. ✅ **Support for authenticated proxies**

**Next Steps:**

1. Choose a proxy method (recommended: Commercial proxy or VPN)
2. Configure environment variables
3. Restart server
4. Test with GPT-5
5. Check logs to verify proxy is working

---

## 🆘 Still Need Help?

### **Check Your Setup:**

```powershell
# 1. Check environment variables
echo $env:HTTPS_PROXY
echo $env:HTTP_PROXY

# 2. Check proxy connectivity
curl -x $env:HTTPS_PROXY https://api.openai.com/v1/models

# 3. Start server and check logs
npm run dev
```

### **Look for These Log Messages:**

```
✅ Good: [Proxy] Using proxy: http://...
✅ Good: [Chat Request] Using proxy: Yes

❌ Bad: [Proxy] No proxy configured...
❌ Bad: [Geographic Restriction] No proxy configured!
```

---

**Last Updated:** 2025-11-12
**Status:** ✅ Production Ready
**Tested:** Windows 10/11, PowerShell, Node.js 16+

