# PostgreSQL Installation Checker Script
# This script checks if PostgreSQL is installed and accessible

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Installation Checker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if psql is in PATH
Write-Host "Checking if PostgreSQL is installed..." -ForegroundColor Yellow
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if ($psqlPath) {
    Write-Host "✓ PostgreSQL found!" -ForegroundColor Green
    Write-Host "  Location: $($psqlPath.Source)" -ForegroundColor Gray
    
    # Get version
    $version = & psql --version 2>&1
    Write-Host "  Version: $version" -ForegroundColor Gray
    Write-Host ""
    
    # Check if PostgreSQL service is running
    Write-Host "Checking PostgreSQL service status..." -ForegroundColor Yellow
    $service = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1
    
    if ($service) {
        Write-Host "  Service Name: $($service.Name)" -ForegroundColor Gray
        if ($service.Status -eq 'Running') {
            Write-Host "  Status: Running ✓" -ForegroundColor Green
        } else {
            Write-Host "  Status: $($service.Status)" -ForegroundColor Yellow
            Write-Host "  To start the service, run:" -ForegroundColor Yellow
            Write-Host "    Start-Service $($service.Name)" -ForegroundColor White
        }
    } else {
        Write-Host "  Warning: PostgreSQL service not found" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Testing connection..." -ForegroundColor Yellow
    Write-Host "  Run: psql -U postgres" -ForegroundColor White
    Write-Host "  Enter your PostgreSQL password when prompted" -ForegroundColor Gray
    
} else {
    Write-Host "✗ PostgreSQL is NOT installed or not in PATH" -ForegroundColor Red
    Write-Host ""
    
    # Check common installation paths
    Write-Host "Checking common installation paths..." -ForegroundColor Yellow
    $commonPaths = @(
        "C:\Program Files\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files\PostgreSQL\15\bin\psql.exe",
        "C:\Program Files\PostgreSQL\14\bin\psql.exe",
        "C:\Program Files (x86)\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files (x86)\PostgreSQL\15\bin\psql.exe"
    )
    
    $found = $false
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            Write-Host "  ✓ Found PostgreSQL at: $path" -ForegroundColor Green
            Write-Host ""
            Write-Host "To add PostgreSQL to PATH:" -ForegroundColor Yellow
            Write-Host "  1. Press Win+R, type 'sysdm.cpl', press Enter" -ForegroundColor White
            Write-Host "  2. Go to 'Advanced' tab → 'Environment Variables'" -ForegroundColor White
            Write-Host "  3. Edit 'Path' under 'System variables'" -ForegroundColor White
            Write-Host "  4. Add: $(Split-Path $path -Parent)" -ForegroundColor White
            Write-Host "  5. Restart your terminal" -ForegroundColor White
            $found = $true
            break
        }
    }
    
    if (-not $found) {
        Write-Host "  ✗ PostgreSQL not found in common locations" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install PostgreSQL:" -ForegroundColor Yellow
        Write-Host "  1. Download from: https://www.postgresql.org/download/windows/" -ForegroundColor White
        Write-Host "  2. Run the installer" -ForegroundColor White
        Write-Host "  3. Make sure to select 'Command Line Tools' during installation" -ForegroundColor White
        Write-Host "  4. See INSTALL_POSTGRESQL_WINDOWS.md for detailed instructions" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Check Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

