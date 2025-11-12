# Stop Redis Server on Windows
Write-Host "Stopping Redis server..."
Get-Process -Name "redis-server" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "Redis server stopped"

