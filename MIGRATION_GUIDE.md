# Migration Guide: MySQL to PostgreSQL

This guide will help you migrate from MySQL to PostgreSQL.

## Prerequisites

1. PostgreSQL installed on Windows (see `POSTGRESQL_SETUP.md`)
2. Node.js and npm installed
3. Backup of your MySQL database (if you have existing data)

## Step-by-Step Migration

### Step 1: Install PostgreSQL

Follow the instructions in `POSTGRESQL_SETUP.md` to install PostgreSQL on Windows.

### Step 2: Install Dependencies

Remove MySQL driver and install PostgreSQL driver:

```powershell
npm uninstall mysql2
npm install pg @types/pg
```

### Step 3: Update Configuration

1. Open `server/config/index.ts`
2. Update the `postgres_config` section with your PostgreSQL credentials:
   ```typescript
   postgres_config: {
     dialect: 'postgres',
     host: '127.0.0.1',
     port: 5432,
     username: 'postgres',        // Your PostgreSQL username
     password: 'your_password',   // Your PostgreSQL password
     database: 'chatgpt-web',     // Your database name
     timezone: '+08:00',
     dialectOptions: {
       ssl: false,
       useUTC: false
     }
   }
   ```

### Step 4: Create Database

Run the setup script:

```powershell
.\setup-postgres.ps1
```

Or manually create the database:

```powershell
psql -U postgres
CREATE DATABASE "chatgpt-web";
\q
```

### Step 5: Initialize Schema

Run the PostgreSQL initialization script:

```powershell
psql -U postgres -d chatgpt-web -f server\sql\postgresql-init.sql
```

### Step 6: Migrate Data (If you have existing MySQL data)

If you have existing data in MySQL, you'll need to export and import it:

#### Export from MySQL:

```powershell
mysqldump -u root -p chatgpt-web > mysql_backup.sql
```

#### Convert SQL syntax (manual process):

PostgreSQL uses different syntax for some operations:
- `AUTO_INCREMENT` → `SERIAL` or `BIGSERIAL`
- `UNSIGNED` → Remove (PostgreSQL doesn't support unsigned)
- `RAND()` → `RANDOM()`
- Backticks `` ` `` → Double quotes `"` for identifiers
- `ENGINE=InnoDB` → Remove (not needed in PostgreSQL)

#### Import to PostgreSQL:

After converting the SQL, import it:

```powershell
psql -U postgres -d chatgpt-web -f converted_backup.sql
```

### Step 7: Test the Application

Start the application:

```powershell
npm run dev
```

Check the console for:
- `PostgreSQL database connection succeeded.` ✅
- Any connection errors ❌

## Key Differences Between MySQL and PostgreSQL

### 1. Data Types

| MySQL | PostgreSQL |
|-------|------------|
| `BIGINT UNSIGNED` | `BIGSERIAL` or `BIGINT` |
| `INT UNSIGNED` | `INTEGER` |
| `DOUBLE` | `DOUBLE PRECISION` |
| `DATETIME` | `TIMESTAMP` |
| `TEXT` | `TEXT` (same) |

### 2. SQL Functions

| MySQL | PostgreSQL |
|-------|------------|
| `RAND()` | `RANDOM()` |
| `NOW()` | `CURRENT_TIMESTAMP` |
| `LIMIT x OFFSET y` | `LIMIT x OFFSET y` (same) |

### 3. Identifiers

- MySQL uses backticks: `` `table_name` ``
- PostgreSQL uses double quotes: `"table_name"` (only if needed)

### 4. Auto Increment

- MySQL: `AUTO_INCREMENT`
- PostgreSQL: `SERIAL` or `BIGSERIAL`

## Troubleshooting

### Connection Refused

- Ensure PostgreSQL service is running
- Check firewall settings
- Verify port 5432 is not blocked

### Authentication Failed

- Check username and password in `server/config/index.ts`
- Verify `pg_hba.conf` settings

### Syntax Errors

- Check for MySQL-specific syntax
- Ensure all `RAND()` are changed to `RANDOM()`
- Verify identifier quoting

### Data Type Errors

- Check for `UNSIGNED` types (remove them)
- Verify `AUTO_INCREMENT` → `SERIAL` conversion

## Rollback Plan

If you need to rollback to MySQL:

1. Restore MySQL configuration in `server/config/index.ts`
2. Reinstall MySQL driver: `npm install mysql2`
3. Restore MySQL database from backup

## Support

For issues or questions:
- Check PostgreSQL logs: `C:\Program Files\PostgreSQL\16\data\log\`
- PostgreSQL documentation: https://www.postgresql.org/docs/
- Sequelize PostgreSQL guide: https://sequelize.org/docs/v6/getting-started/

