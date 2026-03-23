# ITSM Backend & Frontend Integration Guide

## Overview
This document provides complete setup and integration instructions for connecting the React frontend with the .NET 10 backend.

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- .NET 10 SDK
- SQL Server (LocalDB, Express, or full version)
- VS Code or Visual Studio

### Backend Setup (5 minutes)

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Restore dependencies**
   ```bash
   dotnet restore
   ```

3. **Configure database**
   Edit `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ITSMDatabase;Trusted_Connection=true;"
     }
   }
   ```

4. **Create database**
   ```bash
   dotnet ef database update
   ```

5. **Run backend**
   ```bash
   dotnet run
   ```
   Backend will run on `http://localhost:5000`

### Frontend Setup (5 minutes)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create .env file**
   ```bash
   cp .env.example .env
   ```

3. **Configure API URL in .env**
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## Project Structure

### Backend (`/backend`)
```
backend/
├── Controllers/       # REST API endpoints
├── Models/           # EF Core database models
├── Services/         # Business logic
├── DTOs/             # Data transfer objects
├── Data/             # Database context & migrations
├── Helpers/          # AutoMapper configs, utilities
├── Program.cs        # Application entry point
├── appsettings.json  # Configuration
└── ITSMBackend.csproj
```

### Frontend (`/src`)
```
src/
├── components/       # React components
├── pages/           # Page components
├── services/        # API client services
│   ├── api.js      # API endpoints wrapper
│   └── apiClient.js # Axios instance
├── styles/          # CSS & Tailwind
├── utils/           # Utilities
└── Routes.jsx       # React Router config
```

## API Integration Points

### 1. Dashboard Pages
**Frontend**: `/pages/executive-it-service-summary/`, `/pages/agent-dashboard/`, etc.

**Backend Endpoint**: `GET /api/dashboard/summary`

**Usage Example**:
```javascript
import { dashboardAPI } from '../services/api';

// In component
const [data, setData] = useState(null);

useEffect(() => {
  dashboardAPI.getSummary()
    .then(response => setData(response.data))
    .catch(error => console.error(error));
}, []);
```

### 2. Ticket Management
**Frontend**: `/pages/ticket-creation/`, `/pages/ticket-management-center/`, `/pages/ticket-details/`

**Backend Endpoints**:
- `GET /api/tickets` - List all tickets
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/{id}` - Get ticket details
- `PUT /api/tickets/{id}` - Update ticket
- `POST /api/tickets/{id}/comments` - Add comment

**Usage Example**:
```javascript
import { ticketsAPI } from '../services/api';

// Create ticket
const handleCreateTicket = async (formData) => {
  try {
    const response = await ticketsAPI.create({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      category: formData.category,
      dueDate: formData.dueDate,
    });
    console.log('Ticket created:', response.data);
  } catch (error) {
    console.error('Failed to create ticket:', error);
  }
};
```

### 3. Asset Management  
**Frontend**: `/pages/asset-lifecycle-management/`, `/pages/asset-registry-and-tracking/`

**Backend Endpoints**:
- `GET /api/assets` - List all assets
- `POST /api/assets` - Create asset
- `GET /api/assets/{id}` - Get asset details
- `PUT /api/assets/{id}` - Update asset
- `DELETE /api/assets/{id}` - Delete asset

### 4. Change Management
**Frontend**: `/pages/change-management-dashboard/`

**Backend Endpoints**:
- `GET /api/changerequests` - List changes
- `POST /api/changerequests` - Create change
- `GET /api/changerequests/{id}` - Get change details
- `PUT /api/changerequests/{id}` - Update change

### 5. Approvals
**Frontend**: `/pages/approval-queue-manager/`

**Backend Endpoints**:
- `GET /api/approvals` - List all approvals
- `GET /api/approvals/pending` - Get pending approvals
- `PUT /api/approvals/{id}` - Approve/reject item

### 6. Workflows
**Frontend**: `/pages/workflow-builder/`, `/pages/workflow-builder-studio/`

**Backend Endpoints**:
- `GET /api/workflows` - List workflows
- `POST /api/workflows` - Create workflow
- `POST /api/workflows/{id}/instances` - Start workflow instance
- `GET /api/workflows/{id}/instances` - Get workflow instances

## Common Integration Patterns

### Pattern 1: List and Display Data
```javascript
import { assetsAPI } from '../services/api';
import { useState, useEffect } from 'react';

export function AssetList() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await assetsAPI.getAll();
        setAssets(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {assets.map(asset => (
        <div key={asset.id}>
          <h3>{asset.name}</h3>
          <p>Status: {asset.status}</p>
        </div>
      ))}
    </div>
  );
}
```

### Pattern 2: Form Submission
```javascript
import { ticketsAPI } from '../services/api';
import { useState } from 'react';

export function CreateTicketForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ticketsAPI.create({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
      });
      
      alert('Ticket created successfully!');
      // Redirect or reset form
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(new FormData(e.target));
    }}>
      {/* Form fields */}
      <button disabled={loading}>
        {loading ? 'Creating...' : 'Create Ticket'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
```

### Pattern 3: Filtering and Search
```javascript
import { ticketsAPI } from '../services/api';
import { useState, useEffect } from 'react';

export function TicketsByStatus({ status }) {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    ticketsAPI.getByStatus(status)
      .then(response => setTickets(response.data))
      .catch(error => console.error(error));
  }, [status]);

  return (
    <div>
      <h2>Tickets: {status}</h2>
      {tickets.map(ticket => (
        <div key={ticket.id}>
          <h4>{ticket.title}</h4>
          <p>Priority: {ticket.priority}</p>
        </div>
      ))}
    </div>
  );
}
```

## Running with Docker

### Build and run with Docker Compose
```bash
# From project root
docker-compose up -d
```

This will start:
- SQL Server on port 1433
- .NET Backend on port 5000
- React Frontend on port 3000

Access the application at `http://localhost:3000`

## Authentication (Future Enhancement)

The backend is prepared for JWT authentication. To implement:

1. Add JWT package to backend
2. Update Program.cs with authentication middleware
3. Add `[Authorize]` attributes to protected endpoints
4. Update frontend apiClient to include Authorization header

Example:
```javascript
// In apiClient.js
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

## Troubleshooting

### Backend API not responding
- Check if backend is running: `dotnet run`
- Verify CORS is configured for frontend origin
- Check appsettings.json for correct port

### Database connection failing
- Verify SQL Server is running
- Check connection string in appsettings.json
- Run migrations: `dotnet ef database update`

### Frontend API calls timeout
- Verify API base URL in .env
- Check backend startup logs for errors
- Ensure backend and frontend are on same network (if using Docker)

### Port conflicts
- Change frontend port: `npm run dev -- --port 3001`
- Change backend port: Edit launchSettings.json or use `--urls` flag

## Environmental Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
```

### Backend (appsettings.json)
```json
{
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173"]
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=ITSMDatabase;"
  }
}
```

## Performance Optimization

1. **Frontend**:
   - Use React.memo for expensive components
   - Implement pagination for large datasets
   - Cache API responses using React Query or SWR

2. **Backend**:
   - Add pagination to GET endpoints
   - Implement caching for frequently accessed data
   - Use async/await for I/O operations
   - Add database indexes on frequently queried columns

## Next Steps

1. Implement authentication (JWT)
2. Add request validation on backend
3. Add error handling middleware
4. Implement API logging and monitoring
5. Add unit and integration tests
6. Deploy to production environment

## Support Resources

- [.NET Documentation](https://docs.microsoft.com/dotnet/)
- [React Documentation](https://react.dev/)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)
- [API Best Practices](https://restfulapi.net/)
