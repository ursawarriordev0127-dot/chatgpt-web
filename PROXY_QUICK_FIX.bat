@echo off
REM Quick Proxy Setup Script for ChatGPT-Web
REM Run this in PowerShell, not CMD

echo ========================================
echo   ChatGPT-Web Proxy Configuration
echo ========================================
echo.
echo This script will help you configure proxy for geographic restrictions.
echo.
echo STEP 1: Start your VPN software first!
echo   - Clash, V2Ray, Shadowsocks, or any VPN
echo   - Make sure it's running with HTTP proxy mode
echo.
pause
echo.
echo STEP 2: Choose your VPN type:
echo   1. Clash (Port 7890)
echo   2. V2Ray (Port 10809)
echo   3. Shadowsocks (Port 1080)
echo   4. Custom port
echo.
set /p choice="Enter choice (1-4): "

if "%choice%"=="1" (
    set PROXY_PORT=7890
    set PROXY_NAME=Clash
)
if "%choice%"=="2" (
    set PROXY_PORT=10809
    set PROXY_NAME=V2Ray
)
if "%choice%"=="3" (
    set PROXY_PORT=1080
    set PROXY_NAME=Shadowsocks
)
if "%choice%"=="4" (
    set /p PROXY_PORT="Enter your proxy port: "
    set PROXY_NAME=Custom
)

echo.
echo ========================================
echo   Configuration
echo ========================================
echo VPN Type: %PROXY_NAME%
echo Proxy: http://127.0.0.1:%PROXY_PORT%
echo.
echo.
echo STEP 3: Copy and run these commands in PowerShell:
echo.
echo $env:HTTPS_PROXY = "http://127.0.0.1:%PROXY_PORT%"
echo $env:HTTP_PROXY = "http://127.0.0.1:%PROXY_PORT%"
echo taskkill /F /IM node.exe
echo npm run dev
echo.
echo ========================================
echo   Verification
echo ========================================
echo.
echo After starting the server, check logs for:
echo   [Proxy] Using proxy: http://127.0.0.1:%PROXY_PORT%
echo   [Chat Request] Using proxy: Yes
echo.
echo If you see these messages, it's working!
echo.
pause

