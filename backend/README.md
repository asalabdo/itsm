# ITSM Backend Setup

## Overview
This is a .NET 10 backend for the ITSM (IT Service Management) application. It provides REST API endpoints for managing tickets, assets, changes, approvals, workflows, and more.

## Prerequisites
- .NET 10 SDK
- SQL Server (LocalDB or Express)
- Visual Studio 2022 or VS Code with C# Dev Kit

## Architecture
- **Framework**: ASP.NET Core 10
- **Database**: Entity Framework Core with SQL Server
- **API Pattern**: RESTful
- **Structure**: 
  - Models: Data entities
  - Controllers: API endpoints
  - Services: Business logic
  - DTOs: Data transfer objects
  - Data: Entity Framework context and migrations

## Project Structure
```
backend/
├── Controllers/        # API endpoints
├── Models/            # Data entities
├── Services/          # Business logic
├── DTOs/              # Data transfer objects
├── Data/              # Database context
├── Helpers/           # Utilities and mapping profiles
├── Program.cs         # Application startup
├── appsettings.json   # Configuration
└── ITSMBackend.csproj # Project file
```

## Setup Instructions

### 1. Clone and Navigate
```bash
cd e:\my-project\backend
```

### 2. Install Dependencies
```bash
dotnet restore
```

### 3. Configure Database Connection
Edit `appsettings.json` to configure your database connection string:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ITSMDatabase;Trusted_Connection=true;"
  }
}
```

### 4. Create Database and Apply Migrations
```bash
dotnet ef database update
```

This will create the database schema and seed initial data.

### 5. Run the Application
```bash
dotnet run
```

The API will be available at `https://localhost:5001` or `http://localhost:5000`

## API Endpoints

### Tickets
- `GET /api/tickets` - Get all tickets
- `GET /api/tickets/{id}` - Get ticket by ID
- `POST /api/tickets` - Create new ticket
- `PUT /api/tickets/{id}` - Update ticket
- `DELETE /api/tickets/{id}` - Delete ticket
- `GET /api/tickets/status/{status}` - Get tickets by status
- `GET /api/tickets/assignee/{userId}` - Get assigned tickets
- `POST /api/tickets/{id}/comments` - Add comment
- `GET /api/tickets/statistics/open-count` - Get open tickets count

### Assets
- `GET /api/assets` - Get all assets
- `GET /api/assets/{id}` - Get asset by ID
- `POST /api/assets` - Create asset
- `PUT /api/assets/{id}` - Update asset
- `DELETE /api/assets/{id}` - Delete asset
- `GET /api/assets/status/{status}` - Get assets by status
- `GET /api/assets/type/{assetType}` - Get assets by type
- `GET /api/assets/statistics/active-count` - Get active assets count

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/username/{username}` - Get user by username
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `GET /api/users/role/{role}` - Get users by role

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/metrics/{category}` - Get performance metrics
- `GET /api/dashboard/all-metrics` - Get all metrics

### Approvals
- `GET /api/approvals` - Get all approvals
- `GET /api/approvals/pending` - Get pending approvals
- `GET /api/approvals/user/{userId}` - Get approvals for user
- `GET /api/approvals/{id}` - Get approval by ID
- `PUT /api/approvals/{id}` - Update approval

## Swagger Documentation
When running in development mode, Swagger UI is available at:
- `http://localhost:5000/swagger/index.html`

## Environment Configuration

### CORS Settings
Configure allowed frontend origins in `appsettings.json`:
```json
{
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:3000"
    ]
  }
}
```

## Database Models

### Core Entities
- **User**: System users with roles and departments
- **Ticket**: Service tickets with status tracking
- **Asset**: IT assets with lifecycle management
- **ChangeRequest**: Change management requests
- **ServiceRequest**: Service request tracking
- **ApprovalItem**: Approval workflow items
- **Workflow**: Workflow definitions and instances
- **AuditLog**: System audit trail

## Services and Dependency Injection

Available services registered in the DI container:
- `ITicketService` - Ticket management
- `IAssetService` - Asset management
- `IDashboardService` - Dashboard metrics
- `IApprovalService` - Approval management
- `IUserService` - User management

## Next Steps

1. **Authentication**: Implement JWT authentication in Program.cs
2. **Authorization**: Add role-based authorization policies
3. **Validation**: Add FluentValidation for request validation
4. **Error Handling**: Implement global exception handling middleware
5. **Logging**: Configure structured logging (Serilog)
6. **Testing**: Add unit tests and integration tests

## Common Issues and Solutions

### Database Connection Errors
- Ensure SQL Server is running
- Check connection string format
- Verify LocalDB installation: `sqllocaldb info`

### Port Already in Use
```bash
# Run on specific port
dotnet run --urls="https://localhost:7001"
```

### Migration Issues
```bash
# Remove last migration
dotnet ef migrations remove

# Create new migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update
```

## Frontend Integration

The frontend uses the following API client configuration:
- Base URL: `http://localhost:5000/api` (or from environment variable `REACT_APP_API_URL`)
- All requests include CORS headers for cross-origin requests

See `src/services/api.js` for the complete API client implementation.

## License
This project is part of the ITSM Analytics Hub application.
