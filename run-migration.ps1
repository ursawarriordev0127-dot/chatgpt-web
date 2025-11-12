# Quick migration script
$password = Read-Host "Enter PostgreSQL password for user 'postgres'" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

$env:PGPASSWORD = $plainPassword
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d chatgpt-web -f server/sql/postgresql-migration-add-missing-columns.sql
$env:PGPASSWORD = $null

Write-Host "Migration completed!" -ForegroundColor Green

