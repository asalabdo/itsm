using Microsoft.EntityFrameworkCore;
using ITSMBackend.Data;
using ITSMBackend.Services;
using Asp.Versioning;
using ITSMBackend.Helpers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Mvc;
using ITSMBackend.Models;
using BCrypt.Net;

var builder = WebApplication.CreateBuilder(args);

// Configuration hierarchy (highest wins):
// 1. Environment variables (e.g. ConnectionStrings__DefaultConnection)
// 2. appsettings.Local.json  (git-ignored; developer-specific secrets)
// 3. appsettings.{Environment}.json  (e.g. appsettings.Development.json)
// 4. appsettings.json  (committed defaults)
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

// Add logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Configure Serilog if available (optional enhancement)
if (builder.Environment.IsDevelopment())
{
    builder.Logging.SetMinimumLevel(LogLevel.Debug);
}
else
{
    builder.Logging.SetMinimumLevel(LogLevel.Information);
}
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions => npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorCodesToAdd: null
        )
    )
);

builder.Services.AddAutoMapper(typeof(MappingProfile));

// Register services
builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<IAssetService, AssetService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IApprovalService, ApprovalService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IChangeRequestService, ChangeRequestService>();
builder.Services.AddScoped<IReportingService, ReportingService>();
builder.Services.AddScoped<IServiceRequestService, ServiceRequestService>();
builder.Services.AddScoped<IWorkflowService, WorkflowService>();
builder.Services.AddScoped<IWorkflowEngineService, WorkflowEngineService>();
builder.Services.AddScoped<IPredictiveAnalyticsService, PredictiveAnalyticsService>();
builder.Services.AddScoped<IServiceRequestService, ServiceRequestService>();

// Register ManageEngine integration service
builder.Services.Configure<ManageEngineSettings>(builder.Configuration.GetSection("ManageEngine"));
builder.Services.AddHttpClient<ManageEngineService>();

// JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "ITSMSystem",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "ITSMUsers",
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "your-super-secret-key-here-make-it-long-and-secure"))
    };
});

// Authorization policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("ManagerOrAdmin", policy => policy.RequireRole("Manager", "Admin"));
    options.AddPolicy("AgentOrAbove", policy => policy.RequireRole("Agent", "Manager", "Admin"));
});

builder.Services.AddControllers();

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ITSM Analytics Hub API",
        Version = "v1",
        Description = "API for IT Service Management system with analytics and workflow automation"
    });

    // Add JWT Bearer token support in Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", corsPolicyBuilder =>
    {
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? new[] { "http://localhost:5173" };

        corsPolicyBuilder
            .WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Add response caching
builder.Services.AddResponseCaching();

// Add output caching
builder.Services.AddOutputCache();

// Add health checks
builder.Services.AddHealthChecks();

// Add API versioning
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
});

// Add problem details
builder.Services.AddProblemDetails();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ITSM Analytics Hub API v1");
        c.RoutePrefix = "swagger";
    });
}

// Global exception handling
app.UseExceptionHandler(errApp => errApp.Run(async ctx =>
{
    var ex = ctx.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>()?.Error;
    Console.WriteLine($"UNHANDLED: {ex?.Message}\n{ex?.StackTrace}");
    ctx.Response.StatusCode = 500;
    ctx.Response.ContentType = "application/json";
    await ctx.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(new { error = ex?.Message ?? "Unknown error" }));
}));

// Health checks
app.MapHealthChecks("/health");

// CORS
app.UseCors("AllowFrontend");

// Response caching
app.UseResponseCaching();

// Output caching
app.UseOutputCache();

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// API versioning
// Use standard ApiVersioning usage
// app.UseApiVersioning(); // Not strictly needed for .NET 8+ if using Minimal APIs or correctly configured versioning

// Map controllers
app.MapControllers();

// Initialize database (with error handling for unavailable database)
try
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        if (db.Database.GetPendingMigrations().Any())
        {
            db.Database.Migrate();
        }
        
        // Seed initial data if needed
        await SeedDataAsync(db);
    }
    Console.WriteLine("Database initialization successful.");
}
catch (Exception ex)
{
    Console.WriteLine($"Database initialization failed: {ex.GetBaseException().Message}");
    Console.WriteLine("API will start but database operations may fail until connection is restored.");
}

app.Run();

async Task SeedDataAsync(ApplicationDbContext context)
{
    Console.WriteLine("Starting database seeding...");

    // 1. Seed Service Catalog
    if (!context.ServiceCatalogItems.Any())
    {
        context.ServiceCatalogItems.AddRange(
            new ServiceCatalogItem { Name = "MacBook Pro M3", Description = "High-performance laptop for developers and power users.", Category = "Hardware", Icon = "Laptop", RequiresApproval = true, DefaultSlaHours = 48, FormConfigJson = "[{\"label\": \"Reason for request\", \"type\": \"text\"}]", IsActive = true },
            new ServiceCatalogItem { Name = "Adobe Creative Cloud", Description = "Access to full suite of Adobe applications.", Category = "Software", Icon = "FileCode", RequiresApproval = true, DefaultSlaHours = 24, FormConfigJson = "[{\"label\": \"Department\", \"type\": \"select\", \"options\": [\"Creative\", \"Marketing\", \"Product\"]}]", IsActive = true },
            new ServiceCatalogItem { Name = "Guest Wi-Fi Access", Description = "Temporary internet access for visitors.", Category = "Access", Icon = "Wifi", RequiresApproval = false, DefaultSlaHours = 2, FormConfigJson = "[{\"label\": \"Visitor Name\", \"type\": \"text\"}, {\"label\": \"Expiry Date\", \"type\": \"date\"}]", IsActive = true },
            new ServiceCatalogItem { Name = "VPN Access", Description = "Secure remote access to company internal network.", Category = "Access", Icon = "ShieldCheck", RequiresApproval = true, DefaultSlaHours = 8, FormConfigJson = "[{\"label\": \"Justification\", \"type\": \"text\"}]", IsActive = true }
        );
        await context.SaveChangesAsync();
    }

    // 2. Seed Users
    if (!context.Users.Any())
    {
        Console.WriteLine("Seeding users...");
        var users = new[]
        {
            new User { Username = "admin", Email = "admin@itsm.com", FirstName = "Admin", LastName = "User", Role = UserRole.Administrator, PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"), Department = "IT", IsActive = true, CreatedAt = DateTime.UtcNow },
            new User { Username = "agent1", Email = "agent1@itsm.com", FirstName = "John", LastName = "Agent", Role = UserRole.Technician, PasswordHash = BCrypt.Net.BCrypt.HashPassword("Agent123!"), Department = "IT", IsActive = true, CreatedAt = DateTime.UtcNow },
            new User { Username = "agent2", Email = "agent2@itsm.com", FirstName = "Sarah", LastName = "Support", Role = UserRole.Technician, PasswordHash = BCrypt.Net.BCrypt.HashPassword("Agent123!"), Department = "Support", IsActive = true, CreatedAt = DateTime.UtcNow },
            new User { Username = "manager1", Email = "manager1@itsm.com", FirstName = "Jane", LastName = "Manager", Role = UserRole.Manager, PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager123!"), Department = "IT", IsActive = true, CreatedAt = DateTime.UtcNow },
            new User { Username = "user1", Email = "user1@company.com", FirstName = "Robert", LastName = "Employee", Role = UserRole.EndUser, PasswordHash = BCrypt.Net.BCrypt.HashPassword("User123!"), Department = "Finance", IsActive = true, CreatedAt = DateTime.UtcNow },
            new User { Username = "user2", Email = "user2@company.com", FirstName = "Emma", LastName = "Staff", Role = UserRole.EndUser, PasswordHash = BCrypt.Net.BCrypt.HashPassword("User123!"), Department = "HR", IsActive = true, CreatedAt = DateTime.UtcNow }
        };

        context.Users.AddRange(users);
        await context.SaveChangesAsync();
        Console.WriteLine($"Seeded {users.Length} users.");
    }
    else
    {
        Console.WriteLine("Users already exist, skipping user seed.");
    }

    // Capture user IDs for foreign keys — fallback to any available user if named ones not found
    var allUsers = await context.Users.ToListAsync();
    if (!allUsers.Any())
    {
        Console.WriteLine("CRITICAL: No users found. Skipping dependent data seeding.");
        return;
    }

    var admin    = allUsers.FirstOrDefault(u => u.Username == "admin")    ?? allUsers[0];
    var agent1   = allUsers.FirstOrDefault(u => u.Username == "agent1")   ?? allUsers[Math.Min(1, allUsers.Count - 1)];
    var agent2   = allUsers.FirstOrDefault(u => u.Username == "agent2")   ?? allUsers[Math.Min(2, allUsers.Count - 1)];
    var manager1 = allUsers.FirstOrDefault(u => u.Username == "manager1") ?? allUsers[Math.Min(3, allUsers.Count - 1)];
    var user1    = allUsers.FirstOrDefault(u => u.Username == "user1")    ?? allUsers[allUsers.Count >= 2 ? allUsers.Count - 2 : 0];
    var user2    = allUsers.FirstOrDefault(u => u.Username == "user2")    ?? allUsers[allUsers.Count - 1];

    Console.WriteLine($"Using {allUsers.Count} users for seeding (admin={admin.Username}, user1={user1.Username}).");

    // 3. Seed Assets
    if (!context.Assets.Any())
    {
        Console.WriteLine("Seeding assets...");
        var assets = new List<ITSMBackend.Models.Asset>
        {
            new ITSMBackend.Models.Asset { AssetTag = "LAPTOP-001", Name = "Dell Latitude 5420", AssetType = "Hardware", Status = "Active", SerialNumber = "DL1234567", Model = "Latitude 5420", Manufacturer = "Dell", CostAmount = 1200, PurchaseDate = DateTime.UtcNow.AddYears(-2), Location = "Office Building A", OwnerId = admin.Id, Description = "Laptop for IT Manager", CreatedAt = DateTime.UtcNow },
            new ITSMBackend.Models.Asset { AssetTag = "SERVER-001", Name = "Dell PowerEdge R750", AssetType = "Hardware", Status = "Active", SerialNumber = "DPS111222333", Model = "PowerEdge R750", Manufacturer = "Dell", CostAmount = 15000, PurchaseDate = DateTime.UtcNow.AddYears(-3), Location = "Data Center", OwnerId = admin.Id, Description = "Production Database Server", CreatedAt = DateTime.UtcNow },
            new ITSMBackend.Models.Asset { AssetTag = "SOFTWARE-001", Name = "Microsoft Office 365 Pro Plus", AssetType = "Software", Status = "Active", SerialNumber = "MS-OFFICE-365-001", Model = "Office 365", Manufacturer = "Microsoft", CostAmount = 120, PurchaseDate = DateTime.UtcNow.AddYears(-1), Location = "Cloud", Description = "Office productivity suite", CreatedAt = DateTime.UtcNow }
        };

        if (agent1 != null) {
            assets.Add(new ITSMBackend.Models.Asset { AssetTag = "LAPTOP-002", Name = "HP Pavilion 15", AssetType = "Hardware", Status = "Active", SerialNumber = "HP9876543", Model = "Pavilion 15", Manufacturer = "HP", CostAmount = 800, PurchaseDate = DateTime.UtcNow.AddYears(-1), Location = "Office Building B", OwnerId = agent1.Id, Description = "Laptop for Support Agent", CreatedAt = DateTime.UtcNow });
        }

        context.Assets.AddRange(assets);
        await context.SaveChangesAsync();
        Console.WriteLine($"Seeded {assets.Count} assets.");
    }

    // 4. Seed Tickets
    if (!context.Tickets.Any())
    {
        Console.WriteLine("Seeding tickets...");
        var tickets = new List<ITSMBackend.Models.Ticket>
        {
            new ITSMBackend.Models.Ticket { TicketNumber = "TKT-2026-001", Title = "Email sync issue on mobile device", Description = "User cannot sync emails on their mobile device.", Priority = "High", Status = "Open", Category = "Email", AssignedToId = agent1.Id, RequestedById = user1.Id, CreatedAt = DateTime.UtcNow.AddDays(-3), UpdatedAt = DateTime.UtcNow, DueDate = DateTime.UtcNow.AddDays(1), Urgency = 0.8m, Impact = 0.7m },
            new ITSMBackend.Models.Ticket { TicketNumber = "TKT-2026-002", Title = "Monitor not detected after OS update", Description = "After Windows 11 update, monitor not recognized.", Priority = "Medium", Status = "In Progress", Category = "Hardware", AssignedToId = agent1.Id, RequestedById = user2.Id, CreatedAt = DateTime.UtcNow.AddDays(-5), UpdatedAt = DateTime.UtcNow, DueDate = DateTime.UtcNow.AddDays(3), Urgency = 0.6m, Impact = 0.5m },
            new ITSMBackend.Models.Ticket { TicketNumber = "TKT-2026-003", Title = "VPN connection drops intermittently", Description = "VPN connection disconnects randomly throughout the day.", Priority = "Critical", Status = "Open", Category = "Network", AssignedToId = admin.Id, RequestedById = user1.Id, CreatedAt = DateTime.UtcNow.AddHours(-12), UpdatedAt = DateTime.UtcNow, DueDate = DateTime.UtcNow.AddHours(4), Urgency = 0.95m, Impact = 0.9m },
            new ITSMBackend.Models.Ticket { TicketNumber = "TKT-2026-004", Title = "Printer queue not clearing", Description = "Stuck print jobs in queue, unable to print.", Priority = "Low", Status = "Resolved", Category = "Printing", AssignedToId = agent2.Id, RequestedById = user2.Id, CreatedAt = DateTime.UtcNow.AddDays(-7), UpdatedAt = DateTime.UtcNow.AddDays(-1), ResolvedAt = DateTime.UtcNow.AddDays(-1), Urgency = 0.3m, Impact = 0.4m, ResolutionNotes = "Cleared print queue and restarted spooler." },
            new ITSMBackend.Models.Ticket { TicketNumber = "TKT-2026-005", Title = "Software installation: Adobe Creative Cloud", Description = "Marketing team requires Adobe CC for new project.", Priority = "Medium", Status = "Open", Category = "Software", AssignedToId = admin.Id, RequestedById = user1.Id, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, DueDate = DateTime.UtcNow.AddDays(2), Urgency = 0.5m, Impact = 0.4m },
            new ITSMBackend.Models.Ticket { TicketNumber = "TKT-2026-006", Title = "Locked account after failed logins", Description = "User account is locked. Needs reset to continue work.", Priority = "High", Status = "In Progress", Category = "Access", AssignedToId = agent1.Id, RequestedById = user1.Id, CreatedAt = DateTime.UtcNow.AddHours(-2), UpdatedAt = DateTime.UtcNow, Urgency = 0.8m, Impact = 0.2m }
        };

        context.Tickets.AddRange(tickets);
        await context.SaveChangesAsync();
        Console.WriteLine($"Seeded {tickets.Count} tickets.");
    }

    // 5. Seed Service Requests
    if (!context.ServiceRequests.Any())
    {
        Console.WriteLine("Seeding service requests...");
        var srs = new List<ITSMBackend.Models.ServiceRequest>
        {
            new ITSMBackend.Models.ServiceRequest { RequestNumber = "SR-2026-001", Title = "New laptop provisioning", Description = "Required for new employee starting soon.", Status = "Open", Priority = "High", ServiceType = "Hardware Provisioning", RequestedById = user1.Id, AssignedToId = admin.Id, CreatedAt = DateTime.UtcNow.AddDays(-2), UpdatedAt = DateTime.UtcNow, EstimatedHours = 4 },
            new ITSMBackend.Models.ServiceRequest { RequestNumber = "SR-2026-002", Title = "Create new user account", Description = "New hire in Finance requires network and email account.", Status = "In Progress", Priority = "Medium", ServiceType = "User Account Setup", RequestedById = user2.Id, AssignedToId = agent1.Id, CreatedAt = DateTime.UtcNow.AddDays(-1), UpdatedAt = DateTime.UtcNow, EstimatedHours = 2, ActualHours = 1.5m },
            new ITSMBackend.Models.ServiceRequest { RequestNumber = "SR-2026-003", Title = "Increase disk space on C: drive", Description = "User running low on disk space.", Status = "Fulfilled", Priority = "Low", ServiceType = "Disk Management", RequestedById = user1.Id, AssignedToId = agent2.Id, CreatedAt = DateTime.UtcNow.AddDays(-4), CompletionDate = DateTime.UtcNow.AddDays(-1), EstimatedHours = 1, ActualHours = 0.75m },
            new ITSMBackend.Models.ServiceRequest { RequestNumber = "SR-2026-004", Title = "Access to Financial Folder", Description = "Auditor needs access to previous year records.", Status = "Pending Approval", Priority = "High", ServiceType = "Access Permissions", RequestedById = user2.Id, AssignedToId = manager1.Id, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, EstimatedHours = 1 }
        };

        context.ServiceRequests.AddRange(srs);
        await context.SaveChangesAsync();
        Console.WriteLine($"Seeded {srs.Count} service requests.");
    }

    // 6. Seed Dashboard Metrics
    if (!context.DashboardMetrics.Any())
    {
        Console.WriteLine("Seeding dashboard metrics...");
        var metrics = new List<ITSMBackend.Models.DashboardMetric>
        {
            new ITSMBackend.Models.DashboardMetric { MetricName = "IT Service Availability", MetricType = "Performance", Value = 99.8m, TargetValue = 99.5m, Unit = "%", Timestamp = DateTime.UtcNow },
            new ITSMBackend.Models.DashboardMetric { MetricName = "Employee Satisfaction", MetricType = "Performance", Value = 4.5m, TargetValue = 4.0m, Unit = "/5.0", Timestamp = DateTime.UtcNow },
            new ITSMBackend.Models.DashboardMetric { MetricName = "Cost per Ticket", MetricType = "Efficiency", Value = 42.0m, TargetValue = 50.0m, Unit = "USD", Timestamp = DateTime.UtcNow }
        };

        context.DashboardMetrics.AddRange(metrics);
        await context.SaveChangesAsync();
        Console.WriteLine($"Seeded {metrics.Count} dashboard metrics.");
    }

    // 7. Seed Performance Metrics
    if (!context.PerformanceMetrics.Any())
    {
        Console.WriteLine("Seeding performance metrics...");
        var performance = new List<ITSMBackend.Models.PerformanceMetric>
        {
            new ITSMBackend.Models.PerformanceMetric { MetricName = "Sales", Category = "Department", Value = 4.6m, PercentageChange = 2.5m, Trend = "Up", RecordedDate = DateTime.UtcNow },
            new ITSMBackend.Models.PerformanceMetric { MetricName = "Marketing", Category = "Department", Value = 4.3m, PercentageChange = 1.2m, Trend = "Up", RecordedDate = DateTime.UtcNow },
            new ITSMBackend.Models.PerformanceMetric { MetricName = "Finance", Category = "Department", Value = 4.8m, PercentageChange = 3.1m, Trend = "Up", RecordedDate = DateTime.UtcNow },
            new ITSMBackend.Models.PerformanceMetric { MetricName = "HR", Category = "Department", Value = 4.4m, PercentageChange = -1.5m, Trend = "Down", RecordedDate = DateTime.UtcNow },
            new ITSMBackend.Models.PerformanceMetric { MetricName = "Operations", Category = "Department", Value = 4.1m, PercentageChange = 0.5m, Trend = "Stable", RecordedDate = DateTime.UtcNow },
            new ITSMBackend.Models.PerformanceMetric { MetricName = "Engineering", Category = "Department", Value = 4.5m, PercentageChange = 2.0m, Trend = "Up", RecordedDate = DateTime.UtcNow },
            
            // Trend Data
            new ITSMBackend.Models.PerformanceMetric { MetricName = "Jan", Category = "IncidentTrend", Value = 12, RecordedDate = DateTime.UtcNow.AddMonths(-8) },
            new ITSMBackend.Models.PerformanceMetric { MetricName = "Feb", Category = "IncidentTrend", Value = 8, RecordedDate = DateTime.UtcNow.AddMonths(-7) },
            new ITSMBackend.Models.PerformanceMetric { MetricName = "Mar", Category = "IncidentTrend", Value = 15, RecordedDate = DateTime.UtcNow.AddMonths(-6) },
            new ITSMBackend.Models.PerformanceMetric { MetricName = "Apr", Category = "IncidentTrend", Value = 6, RecordedDate = DateTime.UtcNow.AddMonths(-5) },
            new ITSMBackend.Models.PerformanceMetric { MetricName = "May", Category = "IncidentTrend", Value = 4, RecordedDate = DateTime.UtcNow.AddMonths(-4) },
            new ITSMBackend.Models.PerformanceMetric { MetricName = "Jun", Category = "IncidentTrend", Value = 7, RecordedDate = DateTime.UtcNow.AddMonths(-3) },
            new ITSMBackend.Models.PerformanceMetric { MetricName = "Jul", Category = "IncidentTrend", Value = 3, RecordedDate = DateTime.UtcNow.AddMonths(-2) },
            new ITSMBackend.Models.PerformanceMetric { MetricName = "Aug", Category = "IncidentTrend", Value = 9, RecordedDate = DateTime.UtcNow.AddMonths(-1) },
            new ITSMBackend.Models.PerformanceMetric { MetricName = "Sep", Category = "IncidentTrend", Value = 5, RecordedDate = DateTime.UtcNow }
        };

        context.PerformanceMetrics.AddRange(performance);
        await context.SaveChangesAsync();
        Console.WriteLine($"Seeded {performance.Count} performance metrics.");
    }

    Console.WriteLine("Database seeding completed successfully.");
}
