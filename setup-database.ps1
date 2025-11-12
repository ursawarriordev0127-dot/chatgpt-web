# PostgreSQL Database Setup Script
# This script creates the database and initializes the schema

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check PostgreSQL installation
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
if (-not (Test-Path $psqlPath)) {
    Write-Host "Error: PostgreSQL not found at $psqlPath" -ForegroundColor Red
    exit 1
}

Write-Host "PostgreSQL found at: $psqlPath" -ForegroundColor Green
Write-Host ""

# Check if PostgreSQL service is running
Write-Host "Checking PostgreSQL service..." -ForegroundColor Yellow
$service = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1

if ($service) {
    if ($service.Status -ne 'Running') {
        Write-Host "Starting PostgreSQL service..." -ForegroundColor Yellow
        try {
            Start-Service $service.Name -ErrorAction Stop
            Write-Host "Service started successfully!" -ForegroundColor Green
            Start-Sleep -Seconds 3
        } catch {
            Write-Host "Error starting service: $_" -ForegroundColor Red
            Write-Host "Please start the service manually or run as Administrator" -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host "PostgreSQL service is running" -ForegroundColor Green
    }
} else {
    Write-Host "Warning: Could not find PostgreSQL service" -ForegroundColor Yellow
    Write-Host "Please ensure PostgreSQL is installed correctly" -ForegroundColor Yellow
}

Write-Host ""

# Get PostgreSQL password
Write-Host "Please enter your PostgreSQL password:" -ForegroundColor Yellow
Write-Host "(This is the password you set during PostgreSQL installation)" -ForegroundColor Gray
$securePassword = Read-Host "Password" -AsSecureString
$password = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
)

if ([string]::IsNullOrWhiteSpace($password)) {
    Write-Host "Error: Password cannot be empty" -ForegroundColor Red
    exit 1
}

# Set environment variable
$env:PGPASSWORD = $password

Write-Host ""
Write-Host "Testing connection..." -ForegroundColor Yellow
$testResult = & $psqlPath -U postgres -c "SELECT version();" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Connection successful!" -ForegroundColor Green
} else {
    Write-Host "Connection failed. Error:" -ForegroundColor Red
    Write-Host $testResult -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  1. PostgreSQL service is running" -ForegroundColor White
    Write-Host "  2. Password is correct" -ForegroundColor White
    Write-Host "  3. Port 5432 is not blocked by firewall" -ForegroundColor White
    $env:PGPASSWORD = ""
    exit 1
}

Write-Host ""
Write-Host "Creating database 'chatgpt-web'..." -ForegroundColor Yellow
$createDbResult = & $psqlPath -U postgres -c "CREATE DATABASE `"chatgpt-web`";" 2>&1
if ($LASTEXITCODE -eq 0 -or $createDbResult -match "already exists") {
    Write-Host "Database 'chatgpt-web' is ready!" -ForegroundColor Green
} else {
    Write-Host "Warning: $createDbResult" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Running initialization script..." -ForegroundColor Yellow
$sqlFile = Join-Path $PSScriptRoot "server\sql\postgresql-init.sql"
if (Test-Path $sqlFile) {
    $initResult = & $psqlPath -U postgres -d chatgpt-web -f $sqlFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database schema initialized successfully!" -ForegroundColor Green
    } else {
        Write-Host "Some errors occurred (this may be normal if tables already exist):" -ForegroundColor Yellow
        Write-Host $initResult -ForegroundColor Gray
    }
} else {
    Write-Host "Warning: SQL file not found at $sqlFile" -ForegroundColor Yellow
}

# Clear password
$env:PGPASSWORD = ""

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update server/config/index.ts with your PostgreSQL password" -ForegroundColor White
Write-Host "2. Run 'npm run dev' to start the application" -ForegroundColor White
Write-Host ""
