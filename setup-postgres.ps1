# PostgreSQL Setup Script for Windows
# This script helps set up PostgreSQL database for the ChatGPT Web application

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is installed
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
$pgVersion = & psql --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "PostgreSQL found: $pgVersion" -ForegroundColor Green
} else {
    Write-Host "PostgreSQL is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install PostgreSQL first. See POSTGRESQL_SETUP.md for instructions." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Please enter your PostgreSQL connection details:" -ForegroundColor Yellow

# Get database connection details
$dbHost = Read-Host "Host (default: localhost)"
if ([string]::IsNullOrWhiteSpace($dbHost)) { $dbHost = "localhost" }

$dbPort = Read-Host "Port (default: 5432)"
if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = "5432" }

$dbUser = Read-Host "Username (default: postgres)"
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "postgres" }

$dbPassword = Read-Host "Password" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
)

$dbName = Read-Host "Database name (default: chatgpt-web)"
if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "chatgpt-web" }

Write-Host ""
Write-Host "Creating database '$dbName'..." -ForegroundColor Yellow

# Set PGPASSWORD environment variable for psql
$env:PGPASSWORD = $dbPasswordPlain

# Create database
$createDbQuery = "CREATE DATABASE `"$dbName`";"
$createDbResult = & psql -h $dbHost -p $dbPort -U $dbUser -d postgres -c $createDbQuery 2>&1

if ($LASTEXITCODE -eq 0 -or $createDbResult -match "already exists") {
    Write-Host "Database '$dbName' is ready." -ForegroundColor Green
} else {
    Write-Host "Error creating database: $createDbResult" -ForegroundColor Red
    $env:PGPASSWORD = ""
    exit 1
}

Write-Host ""
Write-Host "Running initialization script..." -ForegroundColor Yellow

# Run SQL initialization script
$sqlFile = Join-Path $PSScriptRoot "server\sql\postgresql-init.sql"
if (Test-Path $sqlFile) {
    $initResult = & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $sqlFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database schema initialized successfully!" -ForegroundColor Green
    } else {
        Write-Host "Warning: Some errors occurred during initialization:" -ForegroundColor Yellow
        Write-Host $initResult -ForegroundColor Yellow
    }
} else {
    Write-Host "SQL file not found: $sqlFile" -ForegroundColor Yellow
    Write-Host "Please run the SQL script manually." -ForegroundColor Yellow
}

# Clear password from environment
$env:PGPASSWORD = ""

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update server/config/index.ts with your database credentials" -ForegroundColor White
Write-Host "2. Run 'npm install' to install PostgreSQL dependencies" -ForegroundColor White
Write-Host "3. Run 'npm run dev' to start the application" -ForegroundColor White
Write-Host ""

