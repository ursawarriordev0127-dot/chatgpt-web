# PostgreSQL Setup Guide for Windows

## Step 1: Install PostgreSQL on Windows

### Option A: Using PostgreSQL Installer (Recommended)

1. **Download PostgreSQL:**
   - Visit: https://www.postgresql.org/download/windows/
   - Download the latest PostgreSQL installer (e.g., PostgreSQL 16.x)
   - Choose the Windows x86-64 installer

2. **Run the Installer:**
   - Run the downloaded `.exe` file
   - Follow the installation wizard:
     - Choose installation directory (default: `C:\Program Files\PostgreSQL\16`)
     - Select components: PostgreSQL Server, pgAdmin 4, Command Line Tools, Stack Builder
     - Choose data directory (default: `C:\Program Files\PostgreSQL\16\data`)
     - Set superuser password (remember this password!)
     - Set port (default: `5432`)
     - Choose locale (default: `[Default locale]`)

3. **Complete Installation:**
   - Wait for installation to complete
   - Uncheck "Launch Stack Builder" if you don't need it
   - Click "Finish"

### Option B: Using Chocolatey (If you have Chocolatey installed)

```powershell
choco install postgresql
```

### Option C: Using Scoop (If you have Scoop installed)

```powershell
scoop install postgresql
```

## Step 2: Verify Installation

1. **Open Command Prompt or PowerShell**
2. **Test PostgreSQL connection:**
   ```powershell
   psql --version
   ```

3. **Connect to PostgreSQL:**
   ```powershell
   psql -U postgres
   ```
   (Enter the password you set during installation)

## Step 3: Create Database

Once connected to PostgreSQL, run:

```sql
CREATE DATABASE "chatgpt-web";
\q
```

Or use pgAdmin 4 (GUI tool) to create the database.

## Step 4: Update Project Configuration

The project has been updated to use PostgreSQL. You need to:

1. **Install dependencies:**
   ```powershell
   npm install
   ```

2. **Update database configuration** in `server/config/index.ts`:
   - Update `username` (default: `postgres`)
   - Update `password` (your PostgreSQL password)
   - Update `database` (default: `chatgpt-web`)
   - Port is already set to `5432` (PostgreSQL default)

3. **Run database migrations:**
   ```powershell
   npm run setup:postgres
   ```

## Step 5: Start the Application

```powershell
npm run dev
```

## Troubleshooting

### PostgreSQL Service Not Running

If you get connection errors, start the PostgreSQL service:

```powershell
# Using Services (GUI)
# Press Win+R, type "services.msc"
# Find "postgresql-x64-16" (or your version)
# Right-click and select "Start"

# Using PowerShell (Run as Administrator)
Start-Service postgresql-x64-16
```

### Connection Refused

- Check if PostgreSQL is running on port 5432
- Verify firewall settings
- Check `pg_hba.conf` file for authentication settings

### Password Issues

- Reset password using pgAdmin 4
- Or edit `pg_hba.conf` to use `trust` authentication (not recommended for production)

## Additional Resources

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- pgAdmin 4 Guide: https://www.pgadmin.org/docs/
- PostgreSQL Windows FAQ: https://www.postgresql.org/docs/current/installation-windows.html

