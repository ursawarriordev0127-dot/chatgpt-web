# ChatGPT-Web Proxy Setup Script
# This script helps configure proxy for geographic restrictions

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ChatGPT-Web Proxy Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This error occurs because your region is blocked by OpenAI." -ForegroundColor Yellow
Write-Host "You need to route traffic through a proxy/VPN." -ForegroundColor Yellow
Write-Host ""

# Check if proxy already set
if ($env:HTTPS_PROXY) {
    Write-Host "✓ Proxy already configured: $env:HTTPS_PROXY" -ForegroundColor Green
    Write-Host ""
    $continue = Read-Host "Do you want to reconfigure? (y/n)"
    if ($continue -ne 'y') {
        Write-Host "Exiting..."
        exit
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   STEP 1: Choose Your VPN Type" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Clash for Windows (Port 7890)" -ForegroundColor White
Write-Host "2. V2Ray / V2RayN (Port 10809)" -ForegroundColor White
Write-Host "3. Shadowsocks (Port 1080)" -ForegroundColor White
Write-Host "4. Custom proxy (Enter manually)" -ForegroundColor White
Write-Host "5. I don't have VPN software (Show installation guide)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

$proxyUrl = ""
$proxyName = ""

switch ($choice) {
    "1" {
        $proxyUrl = "http://127.0.0.1:7890"
        $proxyName = "Clash"
    }
    "2" {
        $proxyUrl = "http://127.0.0.1:10809"
        $proxyName = "V2Ray"
    }
    "3" {
        $proxyUrl = "http://127.0.0.1:1080"
        $proxyName = "Shadowsocks"
    }
    "4" {
        Write-Host ""
        $customHost = Read-Host "Enter proxy host (e.g., 127.0.0.1 or proxy.example.com)"
        $customPort = Read-Host "Enter proxy port (e.g., 7890)"
        $needAuth = Read-Host "Does proxy require authentication? (y/n)"
        
        if ($needAuth -eq 'y') {
            $username = Read-Host "Enter username"
            $password = Read-Host "Enter password" -AsSecureString
            $passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
            $proxyUrl = "http://${username}:${passwordPlain}@${customHost}:${customPort}"
        } else {
            $proxyUrl = "http://${customHost}:${customPort}"
        }
        $proxyName = "Custom"
    }
    "5" {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "   VPN Software Installation Guide" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "OPTION 1 - Clash for Windows (Recommended for beginners):" -ForegroundColor Green
        Write-Host "  1. Download: https://github.com/Fndroid/clash_for_windows_pkg/releases" -ForegroundColor White
        Write-Host "  2. Install and run Clash" -ForegroundColor White
        Write-Host "  3. Get a subscription link (search online or use a VPN service)" -ForegroundColor White
        Write-Host "  4. Import subscription in Clash" -ForegroundColor White
        Write-Host "  5. Enable 'System Proxy' in Clash" -ForegroundColor White
        Write-Host "  6. Run this script again and choose option 1" -ForegroundColor White
        Write-Host ""
        Write-Host "OPTION 2 - Commercial Proxy (Recommended for production):" -ForegroundColor Green
        Write-Host "  • Smartproxy: https://smartproxy.com (~$75/month)" -ForegroundColor White
        Write-Host "  • Oxylabs: https://oxylabs.io (~$300/month)" -ForegroundColor White
        Write-Host "  • IPRoyal: https://iproyal.com (~$50/month)" -ForegroundColor White
        Write-Host ""
        Write-Host "OPTION 3 - Self-hosted (Advanced):" -ForegroundColor Green
        Write-Host "  • Get VPS in supported region (US/UK/EU)" -ForegroundColor White
        Write-Host "  • Install Squid proxy" -ForegroundColor White
        Write-Host "  • See PROXY_SETUP_COMPLETE_GUIDE.md for details" -ForegroundColor White
        Write-Host ""
        pause
        exit
    }
    default {
        Write-Host "Invalid choice. Exiting..." -ForegroundColor Red
        exit
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   STEP 2: Verify VPN is Running" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Selected: $proxyName" -ForegroundColor Green
Write-Host "Proxy URL: $proxyUrl" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: Make sure $proxyName is running!" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Is $proxyName running? (y/n)"

if ($confirm -ne 'y') {
    Write-Host ""
    Write-Host "Please start $proxyName first, then run this script again." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   STEP 3: Configuring Proxy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set environment variables
$env:HTTPS_PROXY = $proxyUrl
$env:HTTP_PROXY = $proxyUrl

Write-Host "✓ HTTPS_PROXY set to: $env:HTTPS_PROXY" -ForegroundColor Green
Write-Host "✓ HTTP_PROXY set to: $env:HTTP_PROXY" -ForegroundColor Green
Write-Host ""

# Test proxy connection
Write-Host "Testing proxy connection..." -ForegroundColor Yellow
try {
    $testResult = Test-NetConnection -ComputerName "127.0.0.1" -Port ($proxyUrl -replace ".*:(\d+)", '$1') -WarningAction SilentlyContinue
    if ($testResult.TcpTestSucceeded) {
        Write-Host "✓ Proxy connection successful!" -ForegroundColor Green
    } else {
        Write-Host "✗ Cannot connect to proxy. Make sure $proxyName is running!" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Proxy test failed. Please verify $proxyName is running." -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   STEP 4: Next Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Proxy is now configured for this session!" -ForegroundColor Green
Write-Host ""
Write-Host "To start your server:" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Expected logs:" -ForegroundColor White
Write-Host "  [Proxy] Using proxy: $proxyUrl" -ForegroundColor Gray
Write-Host "  [Chat Request] Using proxy: Yes" -ForegroundColor Gray
Write-Host ""
Write-Host "If you see these logs, your proxy is working! ✓" -ForegroundColor Green
Write-Host ""

$startNow = Read-Host "Do you want to start the server now? (y/n)"

if ($startNow -eq 'y') {
    Write-Host ""
    Write-Host "Stopping any existing node processes..." -ForegroundColor Yellow
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    
    Write-Host "Starting server..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   Server Output" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    npm run dev
} else {
    Write-Host ""
    Write-Host "Remember: This proxy setting is only for this PowerShell session." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To make it permanent:" -ForegroundColor White
    Write-Host '  [System.Environment]::SetEnvironmentVariable("HTTPS_PROXY", "' + $proxyUrl + '", "User")' -ForegroundColor Cyan
    Write-Host '  [System.Environment]::SetEnvironmentVariable("HTTP_PROXY", "' + $proxyUrl + '", "User")' -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or run this script again each time you open PowerShell." -ForegroundColor White
    Write-Host ""
}

Write-Host "Done! 🎉" -ForegroundColor Green

