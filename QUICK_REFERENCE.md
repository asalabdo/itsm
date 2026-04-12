# Quick Reference - Development Guide

## Starting the Application

### Option 1: Individual Processes
```bash
# Terminal 1 - Backend
cd backend
dotnet run
# Runs on http://localhost:5500

# Terminal 2 - Frontend  
npm run dev
# Runs on http://localhost:5173
```

### Option 2: Docker Compose
```bash
docker-compose up
# Backend: http://localhost:5500
# Frontend: http://localhost:3000
# Database: localhost:1433
```

## Common Development Tasks

### Adding a New API Endpoint

1. **Create/Update Service**
   ```csharp
   // Services/YourService.cs
   public interface IYourService
   {
       Task<List<YourDto>> GetAllAsync();
   }
   
   public class YourService : IYourService
   {
       // Implementation
   }
   ```

2. **Register in Program.cs**
   ```csharp
   builder.Services.AddScoped<IYourService, YourService>();
   ```

3. **Create Controller**
   ```csharp
   // Controllers/YourController.cs
   [ApiController]
   [Route("api/[controller]")]
   public class YourController : ControllerBase
   {
       private readonly IYourService _service;
       
       public YourController(IYourService service)
       {
           _service = service;
       }
       
       [HttpGet]
       public async Task<ActionResult<List<YourDto>>> GetAll()
       {
           var items = await _service.GetAllAsync();
           return Ok(items);
       }
   }
   ```

4. **Update Frontend API Client**
   ```javascript
   // src/services/api.js
   export const yourAPI = {
       getAll: () => apiClient.get('/your'),
       getById: (id) => apiClient.get(`/your/${id}`),
       create: (data) => apiClient.post('/your', data),
   };
   ```

### Database Operations

#### Create a Migration
```bash
cd backend
dotnet ef migrations add MigrationName
dotnet ef database update
```

#### Revert Last Migration
```bash
cd backend
dotnet ef migrations remove
dotnet ef database update
```

#### View Pending Migrations
```bash
cd backend
dotnet ef migrations list
```

#### Drop Database
```bash
cd backend
dotnet ef database drop
dotnet ef database update
```

### Running Tests (When Added)
```bash
cd backend
dotnet test
```

### Building for Production

#### Backend
```bash
cd backend
dotnet build --configuration Release
dotnet publish --configuration Release -o ./publish
```

#### Frontend
```bash
npm run build
```

### Debugging

#### Backend - Using Visual Studio
1. Open solution
2. Set breakpoints
3. Press F5 to debug

#### Backend - Using VS Code
```bash
cd backend
dotnet run --no-build
# Attach debugger in VS Code
```

#### Frontend - In Browser
1. Open DevTools (F12)
2. Go to Sources tab
3. Set breakpoints in code

## API Testing

### Using Swagger UI (Development Only)
1. Run backend: `dotnet run`
2. Open: `http://localhost:5500/swagger/index.html`
3. Try endpoints interactively

### Using cURL
```bash
# GET
curl http://localhost:5500/api/tickets

# POST
curl -X POST http://localhost:5500/api/tickets \
  -H "Content-Type: application/json" \
   -d '{"title":"New Ticket","priority":"High"}'

# PUT
curl -X PUT http://localhost:5500/api/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"In Progress"}'

# DELETE
curl -X DELETE http://localhost:5500/api/tickets/1
```

### Using Postman
1. Create new request
2. Set method (GET, POST, etc.)
3. Enter URL: `http://localhost:5500/api/tickets`
4. Add headers if needed
5. Add body for POST/PUT
6. Send request

### Using Thunder Client (VS Code)
1. Install extension
2. Create requests
3. Test endpoints

## Configuration

### Environment Variables

#### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5500/api
REACT_APP_ENVIRONMENT=development
```

#### Backend (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=ITSMDatabase;..."
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173"]
  }
}
```

### Database Connection Strings

#### LocalDB
```
Server=(localdb)\mssqllocaldb;Database=ITSMDatabase;Trusted_Connection=true;
```

#### SQL Server Express
```
Server=localhost\SQLEXPRESS;Database=ITSMDatabase;Trusted_Connection=true;
```

#### SQL Server (Remote)
```
Server=yourserver.com;Database=ITSMDatabase;User Id=sa;Password=YourPassword;
```

#### Docker SQL Server
```
Server=sqlserver;Database=ITSMDatabase;User Id=sa;Password=YourPassword123!;TrustServerCertificate=true;
```

## Code Patterns

### Service Pattern (Async/Await)
```csharp
public async Task<YourDto> GetByIdAsync(int id)
{
    var entity = await _context.YourEntity
        .Include(x => x.RelatedEntity)
        .FirstOrDefaultAsync(x => x.Id == id);
    
    return entity == null ? null : _mapper.Map<YourDto>(entity);
}
```

### Frontend API Hook
```javascript
function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await ticketsAPI.getAll();
        setTickets(res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetch();
  }, []);

  return { tickets, loading, error };
}
```

## Troubleshooting

### Backend Won't Start
```bash
# Check if port is in use
netstat -ano | findstr :5500

# Kill process on port 5500
taskkill /PID <PID> /F

# Or change port
dotnet run --urls="http://localhost:5001"
```

### Database Connection Error
```bash
# Check SQL Server is running
# Verify connection string
# Try connection string in SSMS first

# LocalDB
sqllocaldb info

# Start LocalDB
sqllocaldb start mssqllocaldb
```

### Frontend API Calls Failing
1. Check CORS configuration in appsettings.json
2. Verify backend is running on expected port
3. Check browser console for actual error
4. Check Network tab to see request/response

### Module Not Found (Frontend)
```bash
npm install
npm run dev
```

### NuGet Package Issues (Backend)
```bash
cd backend
dotnet nuget locals all --clear
dotnet restore
```

## Performance Tips

### Backend
- Use `async/await` everywhere
- Include related entities only when needed
- Add pagination to list endpoints
- Use database indexes well

### Frontend
- Lazy load components
- Use React.memo for expensive renders
- Debounce debounce API calls
- Cache immutable data

## Security Checklist

- [ ] Implement authentication (JWT)
- [ ] Add authorization policies
- [ ] Validate all inputs
- [ ] Sanitize outputs
- [ ] Use HTTPS in production
- [ ] Secure connection strings
- [ ] Implement rate limiting
- [ ] Add request logging
- [ ] Vulnerable dependency scan

## Useful Commands

### NPM
```bash
npm install              # Install dependencies
npm run dev             # Start dev server
npm run build           # Build production
npm run serve           # Preview build locally
npm update              # Update packages
npm outdated            # Check for updates
```

### .NET CLI
```bash
dotnet new              # Create project
dotnet restore          # Restore dependencies
dotnet build            # Build project
dotnet run              # Run project
dotnet test             # Run tests
dotnet publish          # Publish release
dotnet ef               # Entity Framework CLI
dotnet tool list        # List global tools
```

## Need Help?

### Documentation
- [.NET Documentation](https://docs.microsoft.com/en-us/dotnet/)
- [React Documentation](https://react.dev/)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)
- [ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/)

### Community
- Stack Overflow
- GitHub Issues
- Reddit r/dotnet, r/reactjs
- Discord communities

### Debugging Resources
- Chrome DevTools
- Postman/Thunder Client
- SQL Server Management Studio
- Visual Studio Debugger
