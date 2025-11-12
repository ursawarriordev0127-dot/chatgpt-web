# Installing PostgreSQL on Windows - Step by Step

## Quick Installation Guide

### Method 1: Using PostgreSQL Installer (Recommended)

1. **Download PostgreSQL:**
   - Go to: https://www.postgresql.org/download/windows/
   - Click "Download the installer"
   - Download the latest version (e.g., PostgreSQL 16.x)
   - Choose: **Windows x86-64** installer

2. **Run the Installer:**
   - Double-click the downloaded `.exe` file (e.g., `postgresql-16.x-x64-windows.exe`)
   - Click "Next" on the welcome screen
   
3. **Choose Installation Directory:**
   - Default: `C:\Program Files\PostgreSQL\16`
   - Click "Next"

4. **Select Components:**
   - ✅ PostgreSQL Server (required)
   - ✅ pgAdmin 4 (GUI tool - recommended)
   - ✅ Command Line Tools (required for `psql`)
   - ✅ Stack Builder (optional)
   - Click "Next"

5. **Choose Data Directory:**
   - Default: `C:\Program Files\PostgreSQL\16\data`
   - Click "Next"

6. **Set Password:**
   - **IMPORTANT:** Enter a password for the `postgres` superuser
   - Remember this password! You'll need it later.
   - Click "Next"

7. **Set Port:**
   - Default: `5432`
   - Keep the default unless you have a conflict
   - Click "Next"

8. **Choose Locale:**
   - Default: `[Default locale]`
   - Click "Next"

9. **Review Installation:**
   - Click "Next" to begin installation
   - Wait for installation to complete (may take a few minutes)

10. **Complete Installation:**
    - Uncheck "Launch Stack Builder" (unless you need it)
    - Click "Finish"

### Method 2: Using Chocolatey (If you have Chocolatey)

Open PowerShell as Administrator and run:

```powershell
choco install postgresql
```

### Method 3: Using Winget (Windows Package Manager)

Open PowerShell and run:

```powershell
winget install PostgreSQL.PostgreSQL
```

## Verify Installation

### Step 1: Add PostgreSQL to PATH (If needed)

If `psql` command still doesn't work after installation:

1. **Find PostgreSQL Installation Path:**
   - Usually: `C:\Program Files\PostgreSQL\16\bin`
   - Or: `C:\Program Files\PostgreSQL\15\bin` (if version 15)

2. **Add to PATH:**
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Go to "Advanced" tab
   - Click "Environment Variables"
   - Under "System variables", find "Path" and click "Edit"
   - Click "New" and add: `C:\Program Files\PostgreSQL\16\bin`
   - Click "OK" on all windows
   - **Restart your terminal/command prompt**

### Step 2: Test Installation

Open a **NEW** Command Prompt or PowerShell window and run:

```powershell
psql --version
```

You should see something like:
```
psql (PostgreSQL) 16.x
```

### Step 3: Connect to PostgreSQL

```powershell
psql -U postgres
```

Enter the password you set during installation.

## Quick Setup Commands

Once PostgreSQL is installed and accessible:

### 1. Create Database

```powershell
psql -U postgres
```

Then in psql prompt:
```sql
CREATE DATABASE "chatgpt-web";
\q
```

### 2. Run Initialization Script

```powershell
psql -U postgres -d chatgpt-web -f server\sql\postgresql-init.sql
```

## Troubleshooting

### Issue: "psql is not recognized"

**Solution 1:** Add PostgreSQL to PATH (see above)

**Solution 2:** Use full path:
```powershell
"C:\Program Files\PostgreSQL\16\bin\psql.exe" --version
```

**Solution 3:** Restart your computer after installation

### Issue: "Connection refused" or "could not connect"

**Check if PostgreSQL service is running:**

1. Press `Win + R`, type `services.msc`, press Enter
2. Find service named: `postgresql-x64-16` (or your version)
3. Right-click → "Start" (if stopped)
4. Right-click → "Properties" → Set "Startup type" to "Automatic"

**Or use PowerShell (as Administrator):**
```powershell
Start-Service postgresql-x64-16
```

### Issue: "Password authentication failed"

- Make sure you're using the correct password set during installation
- Try resetting password using pgAdmin 4
- Or edit `pg_hba.conf` to use `trust` authentication (development only)

### Issue: Port 5432 already in use

- Change PostgreSQL port during installation
- Or stop the service using that port
- Update `server/config/index.ts` with the new port

## Using pgAdmin 4 (GUI Tool)

pgAdmin 4 is installed with PostgreSQL and provides a graphical interface:

1. **Open pgAdmin 4:**
   - Search for "pgAdmin 4" in Start menu
   - Or go to: `C:\Program Files\PostgreSQL\16\pgAdmin 4\bin\pgAdmin4.exe`

2. **Connect to Server:**
   - Right-click "Servers" → "Create" → "Server"
   - Name: `PostgreSQL 16` (or any name)
   - Connection tab:
     - Host: `localhost`
     - Port: `5432`
     - Username: `postgres`
     - Password: (your password)
   - Click "Save"

3. **Create Database:**
   - Right-click "Databases" → "Create" → "Database"
   - Name: `chatgpt-web`
   - Click "Save"

## Next Steps After Installation

1. ✅ Verify PostgreSQL is installed: `psql --version`
2. ✅ Create database: `CREATE DATABASE "chatgpt-web";`
3. ✅ Update `server/config/index.ts` with your PostgreSQL password
4. ✅ Run: `npm install` to install PostgreSQL driver
5. ✅ Run initialization script: `psql -U postgres -d chatgpt-web -f server\sql\postgresql-init.sql`
6. ✅ Start application: `npm run dev`

## Need Help?

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Windows Installation Guide: https://www.postgresql.org/docs/current/installation-windows.html
- pgAdmin Documentation: https://www.pgadmin.org/docs/

