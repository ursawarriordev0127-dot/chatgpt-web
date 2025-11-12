# Start Redis Server on Windows
$redisPath = "$env:USERPROFILE\Redis\redis-server.exe"

if (Test-Path $redisPath) {
    Write-Host "Starting Redis server..."
    Start-Process -FilePath $redisPath -ArgumentList "--requirepass chatgpt-web" -WindowStyle Minimized
    Start-Sleep -Seconds 2
    
    # Verify Redis is running
    $redisCli = Get-ChildItem "$env:USERPROFILE\Redis" -Recurse -Filter "redis-cli.exe" | Select-Object -First 1 -ExpandProperty FullName
    if ($redisCli) {
        $result = & $redisCli -a chatgpt-web ping 2>&1
        if ($result -match "PONG") {
            Write-Host "✓ Redis server is running on port 6379" -ForegroundColor Green
        } else {
            Write-Host "✗ Redis server may not be running properly" -ForegroundColor Red
        }
    }
} else {
    Write-Host "Redis not found at: $redisPath" -ForegroundColor Red
    Write-Host "Please download Redis for Windows from: https://github.com/tporadowski/redis/releases"
}

