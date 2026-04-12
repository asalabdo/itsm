# Database Setup Instructions

## Prerequisites
You need to have SQL Server or SQL Server LocalDB installed.

## Option 1: Using LocalDB (Recommended - Easiest)

### Check if LocalDB is Installed
```bash
sqllocaldb info
```

If you see a response, LocalDB is installed and you can proceed.

### Start LocalDB
```bash
sqllocaldb start mssqllocaldb
```

### Create and Migrate Database
```bash
cd backend
dotnet ef database create
dotnet ef database update
```

Or all at once:
```bash
cd backend
dotnet run
```

The application will create the database automatically on first run.

## Option 2: Using SQL Server Express

If you have SQL Server Express installed:

1. Edit `backend/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=ITSMDatabase;Trusted_Connection=true;TrustServerCertificate=true;"
  }
}
```

2. Start SQL Server Express (check Windows Services)

3. Run migrations:
```bash
cd backend
dotnet ef database update
```

## Option 3: Using Full SQL Server

If you have SQL Server installed on your machine or network:

1. Edit `backend/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YourServerName;Database=ITSMDatabase;Trusted_Connection=true;TrustServerCertificate=true;"
  }
}
```

2. Run migrations:
```bash
cd backend
dotnet ef database update
```

## Option 4: Using Docker SQL Server

If you don't have SQL Server installed but have Docker:

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword123!" -p 1433:1433 mcr.microsoft.com/mssql/server:2022-latest
```

Then update `backend/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ITSMDatabase;User Id=sa;Password=YourPassword123!;TrustServerCertificate=true;"
  }
}
```

And run migrations:
```bash
cd backend
dotnet ef database update
```

## Verify Setup

Once database is set up, test the connection:

```bash
cd backend
dotnet run
```

You should see:
```
Application started. Press Ctrl+C to shut down.
```

## Troubleshooting

### "Cannot open database"
- Verify SQL Server is running
- Check connection string in `appsettings.json`
- Try using `localhost` instead of `.`

### "Login failed"
- Check username and password in connection string
- Ensure Trusted_Connection is set correctly
- Try running with `TrustServerCertificate=true`

### "Database already exists"
- Delete the database and let the app recreate it
- Or simply run the migrations: `dotnet ef database update`

## Running Migrations

### See pending migrations
```bash
cd backend
dotnet ef migrations list
```

### Create a new migration
```bash
cd backend
dotnet ef migrations add MigrationName
```

### Apply migrations to database
```bash
cd backend
dotnet ef database update
```

### Remove last migration
```bash
cd backend
dotnet ef migrations remove
```

## Need More Help?

See the main documentation files:
- `START_HERE.md` - Quick start guide
- `QUICK_REFERENCE.md` - Common commands
- `backend/README.md` - Backend documentation
