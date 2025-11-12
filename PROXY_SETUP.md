# Proxy Setup Guide

This guide explains how to configure a proxy server to bypass country/region restrictions for OpenAI API requests.

## Problem

If you encounter the error: `"unsupported_country_region_territory"` or `"Country, region, or territory not supported"`, it means your server's IP address is in a region that OpenAI doesn't support.

## Solution

Configure a proxy server to route API requests through a supported region.

## Setup Instructions

### Option 1: Environment Variables (Recommended)

Set the proxy URL as an environment variable before starting the server:

**Windows (PowerShell):**
```powershell
$env:HTTPS_PROXY="http://proxy-server:port"
npm run dev
```

**Windows (Command Prompt):**
```cmd
set HTTPS_PROXY=http://proxy-server:port
npm run dev
```

**Linux/Mac:**
```bash
export HTTPS_PROXY=http://proxy-server:port
npm run dev
```

**Or set it permanently in your `.env` file:**
```env
HTTPS_PROXY=http://proxy-server:port
```

### Option 2: Proxy URL Formats

The proxy URL can be in the following formats:

- **HTTP Proxy:** `http://proxy.example.com:8080`
- **HTTPS Proxy:** `https://proxy.example.com:8080`
- **With Authentication:** `http://username:password@proxy.example.com:8080`

### Example Proxy Services

1. **Free Proxy Services:**
   - Search for free HTTP/HTTPS proxies online
   - Use with caution as they may be unreliable

2. **Paid Proxy Services:**
   - Residential proxies (recommended)
   - Datacenter proxies
   - VPN services that provide proxy endpoints

3. **Self-Hosted Proxy:**
   - Set up your own proxy server in a supported region
   - Use tools like Squid, Shadowsocks, or V2Ray

### Testing the Proxy

After setting up the proxy, restart your backend server and try making a chat request. The proxy will automatically be used for all OpenAI API requests.

### Troubleshooting

1. **Proxy not working:**
   - Verify the proxy URL is correct
   - Check if the proxy server is accessible
   - Ensure the proxy supports HTTPS connections

2. **Connection timeout:**
   - The proxy server may be down or slow
   - Try a different proxy server

3. **Authentication errors:**
   - Verify username/password in the proxy URL
   - Check if the proxy requires authentication

### Notes

- The proxy is applied automatically to all OpenAI API requests
- If no proxy is configured, requests will go directly to OpenAI (may fail in unsupported regions)
- The proxy setting is read from environment variables at server startup
- Restart the server after changing proxy settings

## Security Considerations

- Never commit proxy credentials to version control
- Use environment variables or secure configuration files
- Consider using a dedicated proxy server for production
- Monitor proxy usage and costs if using paid services

