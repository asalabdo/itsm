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
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure(maxRetryCount: 5)
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
builder.Services.AddScoped<IProblemManagementService, ProblemManagementService>();
builder.Services.AddScoped<IReportingService, ReportingService>();
builder.Services.AddScoped<IServiceRequestService, ServiceRequestService>();
builder.Services.AddScoped<IWorkflowService, WorkflowService>();
builder.Services.AddScoped<IWorkflowRoutingService, WorkflowRoutingService>();
builder.Services.AddScoped<IWorkflowEngineService, WorkflowEngineService>();
builder.Services.AddScoped<IPredictiveAnalyticsService, PredictiveAnalyticsService>();

// Register ManageEngine integration service
builder.Services.Configure<ManageEngineSettings>(builder.Configuration.GetSection("ManageEngine"));
builder.Services.AddHttpClient<ManageEngineService>();

// Register GFSA ERP integration service
builder.Services.AddScoped<IErpIntegrationService, ErpIntegrationService>();
builder.Services.Configure<GfsaErpSettings>(builder.Configuration.GetSection("GfsaErp"));
builder.Services.AddHttpClient<ErpIntegrationService>();

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
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Administrator"));
    options.AddPolicy("ManagerOrAdmin", policy => policy.RequireRole("Manager", "Administrator"));
    options.AddPolicy("AgentOrAbove", policy => policy.RequireRole("Technician", "Manager", "Administrator"));
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
var seedOnly = args.Any(arg => string.Equals(arg, "--seed-db", StringComparison.OrdinalIgnoreCase));
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
        if (seedOnly)
        {
            Console.WriteLine("Seed-only mode enabled. Recreating database from the current model...");
            await db.Database.EnsureDeletedAsync();
            await db.Database.EnsureCreatedAsync();
            await SeedDataAsync(db);
            Console.WriteLine("Seed-only database initialization successful.");
            return;
        }
        else if (db.Database.GetPendingMigrations().Any())
        {
            Console.WriteLine("Applying pending database migrations...");
            await db.Database.MigrateAsync();
        }
        
        // Demo seed data is opt-in only.
        var seedDemoData = builder.Configuration.GetValue<bool>("Database:SeedDemoData");
        if (seedDemoData)
        {
            await SeedDataAsync(db);
        }
        else
        {
            Console.WriteLine("Database demo seeding disabled (Database:SeedDemoData=false).");
        }
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
            new ServiceCatalogItem { Name = "Laptop", NameAr = "حاسوب محمول", Description = "High-performance laptop for developers and power users.", DescriptionAr = "حاسوب محمول عالي الأداء للمطورين والمستخدمين المتقدمين.", Category = "Hardware", CategoryAr = "أجهزة", Icon = "Laptop", RequiresApproval = true, DefaultSlaHours = 48, FormConfigJson = "[{\"label\": \"Reason for request\", \"type\": \"text\"}]", IsActive = true },
            new ServiceCatalogItem { Name = "Adobe Creative Cloud", NameAr = "أدوبي كريتيف كلاود", Description = "Access to full suite of Adobe applications.", DescriptionAr = "الوصول إلى المجموعة الكاملة من تطبيقات أدوبي.", Category = "Software", CategoryAr = "برمجيات", Icon = "FileCode", RequiresApproval = true, DefaultSlaHours = 24, FormConfigJson = "[{\"label\": \"Department\", \"type\": \"select\", \"options\": [\"Creative\", \"Marketing\", \"Product\"]}]", IsActive = true },
            new ServiceCatalogItem { Name = "Guest Wi-Fi Access", NameAr = "وصول Wi-Fi للزوار", Description = "Temporary internet access for visitors.", DescriptionAr = "وصول مؤقت إلى الإنترنت للزوار.", Category = "Access", CategoryAr = "وصول", Icon = "Wifi", RequiresApproval = false, DefaultSlaHours = 2, FormConfigJson = "[{\"label\": \"Visitor Name\", \"type\": \"text\"}, {\"label\": \"Expiry Date\", \"type\": \"date\"}]", IsActive = true },
            new ServiceCatalogItem { Name = "VPN Access", NameAr = "وصول VPN", Description = "Secure remote access to company internal network.", DescriptionAr = "وصول آمن عن بُعد إلى الشبكة الداخلية للشركة.", Category = "Access", CategoryAr = "وصول", Icon = "ShieldCheck", RequiresApproval = true, DefaultSlaHours = 8, FormConfigJson = "[{\"label\": \"Justification\", \"type\": \"text\"}]", IsActive = true }
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
            new User { Username = "network1", Email = "network1@itsm.com", FirstName = "Nadia", LastName = "Network", Role = UserRole.Technician, PasswordHash = BCrypt.Net.BCrypt.HashPassword("Agent123!"), Department = "Network Support", JobTitle = "Network Engineer", IsActive = true, CreatedAt = DateTime.UtcNow },
            new User { Username = "security1", Email = "security1@itsm.com", FirstName = "Samir", LastName = "Security", Role = UserRole.Technician, PasswordHash = BCrypt.Net.BCrypt.HashPassword("Agent123!"), Department = "Security Operations", JobTitle = "Security Analyst", IsActive = true, CreatedAt = DateTime.UtcNow },
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
            new ITSMBackend.Models.ServiceRequest { RequestNumber = "SR-2026-001", Title = "New laptop provisioning", Description = "Required for new employee starting soon.", Status = "Open", Priority = "High", ServiceType = "Hardware Provisioning", WorkflowStage = "Submission", RequestedById = user1.Id, AssignedToId = admin.Id, CreatedAt = DateTime.UtcNow.AddDays(-2), UpdatedAt = DateTime.UtcNow, EstimatedHours = 4 },
            new ITSMBackend.Models.ServiceRequest { RequestNumber = "SR-2026-002", Title = "Create new user account", Description = "New hire in Finance requires network and email account.", Status = "In Fulfillment", Priority = "Medium", ServiceType = "User Account Setup", WorkflowStage = "Fulfillment", RequestedById = user2.Id, AssignedToId = agent1.Id, CreatedAt = DateTime.UtcNow.AddDays(-1), UpdatedAt = DateTime.UtcNow, EstimatedHours = 2, ActualHours = 1.5m },
            new ITSMBackend.Models.ServiceRequest { RequestNumber = "SR-2026-003", Title = "Increase disk space on C: drive", Description = "User running low on disk space.", Status = "Fulfilled", Priority = "Low", ServiceType = "Disk Management", WorkflowStage = "Completed", RequestedById = user1.Id, AssignedToId = agent2.Id, CreatedAt = DateTime.UtcNow.AddDays(-4), CompletionDate = DateTime.UtcNow.AddDays(-1), EstimatedHours = 1, ActualHours = 0.75m },
            new ITSMBackend.Models.ServiceRequest { RequestNumber = "SR-2026-004", Title = "Access to Financial Folder", Description = "Auditor needs access to previous year records.", Status = "Pending Approval", Priority = "High", ServiceType = "Access Permissions", WorkflowStage = "Approval", RequestedById = user2.Id, AssignedToId = manager1.Id, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, EstimatedHours = 1 },
            new ITSMBackend.Models.ServiceRequest { RequestNumber = "SR-2026-007", Title = "Password reset for finance staff", Description = "Finance team members locked out after policy enforcement. Needs immediate password reset.", Status = "In Fulfillment", Priority = "Medium", ServiceType = "Access & Identity", WorkflowStage = "Fulfillment", RequestedById = user2.Id, AssignedToId = agent1.Id, CreatedAt = DateTime.UtcNow.AddHours(-6), UpdatedAt = DateTime.UtcNow, EstimatedHours = 1, SlaDueDate = DateTime.UtcNow.AddDays(3) }
        };

        context.ServiceRequests.AddRange(srs);
        await context.SaveChangesAsync();
        Console.WriteLine($"Seeded {srs.Count} service requests.");

        var fulfillmentSeedRequest = srs.FirstOrDefault(request => request.RequestNumber == "SR-2026-002");
        var completedSeedRequest = srs.FirstOrDefault(request => request.RequestNumber == "SR-2026-003");
        var approvalSeedRequest = srs.FirstOrDefault(request => request.RequestNumber == "SR-2026-004");

        if (fulfillmentSeedRequest != null && !context.FulfillmentTasks.Any(task => task.ServiceRequestId == fulfillmentSeedRequest.Id))
        {
            context.FulfillmentTasks.AddRange(
                new FulfillmentTask
                {
                    ServiceRequestId = fulfillmentSeedRequest.Id,
                    Title = "Validate user requirements",
                    Description = "Confirm mailbox, network, and application access needs with the requester.",
                    Status = "Completed",
                    AssignedToId = agent1.Id,
                    CompletedAt = DateTime.UtcNow.AddHours(-20),
                    CreatedAt = DateTime.UtcNow.AddDays(-1).AddHours(-6)
                },
                new FulfillmentTask
                {
                    ServiceRequestId = fulfillmentSeedRequest.Id,
                    Title = "Provision account and mailbox",
                    Description = "Create the requested account, mailbox, and baseline security groups.",
                    Status = "In Progress",
                    AssignedToId = agent1.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-1).AddHours(-3)
                }
            );
        }

        if (completedSeedRequest != null && !context.FulfillmentTasks.Any(task => task.ServiceRequestId == completedSeedRequest.Id))
        {
            context.FulfillmentTasks.AddRange(
                new FulfillmentTask
                {
                    ServiceRequestId = completedSeedRequest.Id,
                    Title = "Review storage request",
                    Description = "Confirm the requested additional storage space is available.",
                    Status = "Completed",
                    AssignedToId = agent2.Id,
                    CompletedAt = DateTime.UtcNow.AddDays(-2),
                    CreatedAt = DateTime.UtcNow.AddDays(-4).AddHours(-2)
                },
                new FulfillmentTask
                {
                    ServiceRequestId = completedSeedRequest.Id,
                    Title = "Extend disk allocation",
                    Description = "Apply the requested storage increase and validate available space.",
                    Status = "Completed",
                    AssignedToId = agent2.Id,
                    CompletedAt = DateTime.UtcNow.AddDays(-1),
                    CreatedAt = DateTime.UtcNow.AddDays(-3)
                }
            );
        }

        if (approvalSeedRequest != null && !context.ApprovalRequests.Any(item => item.ServiceRequestId == approvalSeedRequest.Id))
        {
            context.ApprovalRequests.Add(new ApprovalRequest
            {
                ServiceRequestId = approvalSeedRequest.Id,
                ApproverId = manager1.Id,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow.AddMinutes(-45)
            });
        }

        await context.SaveChangesAsync();

        // Safety: task seed for any Fulfillment-stage SR that has no tasks
        var orphanedFulfillmentSRs = context.ServiceRequests
            .Where(sr => sr.WorkflowStage == "Fulfillment")
            .ToList()
            .Where(sr => !context.FulfillmentTasks.Any(t => t.ServiceRequestId == sr.Id))
            .ToList();
        foreach (var osr in orphanedFulfillmentSRs)
        {
            context.FulfillmentTasks.AddRange(
                new FulfillmentTask { ServiceRequestId = osr.Id, Title = $"Review: {osr.Title}", Description = "Verify requirements and confirm prerequisites.", Status = "Completed", AssignedToId = agent1.Id, CompletedAt = DateTime.UtcNow.AddHours(-2), CreatedAt = osr.CreatedAt.AddHours(1) },
                new FulfillmentTask { ServiceRequestId = osr.Id, Title = $"Execute: {osr.Title}", Description = "Carry out the actions required to fulfill this request.", Status = "Pending", AssignedToId = agent1.Id, CreatedAt = osr.CreatedAt.AddHours(2) },
                new FulfillmentTask { ServiceRequestId = osr.Id, Title = "Notify requester and close loop", Description = "Confirm completion with the requester and document resolution.", Status = "Pending", AssignedToId = agent1.Id, CreatedAt = osr.CreatedAt.AddHours(3) }
            );
        }
        if (orphanedFulfillmentSRs.Any())
        {
            await context.SaveChangesAsync();
            Console.WriteLine($"Auto-seeded tasks for {orphanedFulfillmentSRs.Count} orphaned fulfillment SR(s).");
        }
    }

    // 5b. Always ensure any Fulfillment-stage SR has tasks (even if SRs already existed before this run)
    var allFulfillmentSRs = context.ServiceRequests.Where(sr => sr.WorkflowStage == "Fulfillment").ToList();
    foreach (var fsr in allFulfillmentSRs)
    {
        if (!context.FulfillmentTasks.Any(t => t.ServiceRequestId == fsr.Id))
        {
            context.FulfillmentTasks.AddRange(
                new FulfillmentTask { ServiceRequestId = fsr.Id, Title = $"Review: {fsr.Title}", Description = "Verify requirements and confirm prerequisites.", Status = "Completed", AssignedToId = agent1.Id, CompletedAt = DateTime.UtcNow.AddHours(-2), CreatedAt = fsr.CreatedAt.AddHours(1) },
                new FulfillmentTask { ServiceRequestId = fsr.Id, Title = $"Execute: {fsr.Title}", Description = "Carry out the actions required to fulfill this request.", Status = "Pending", AssignedToId = agent1.Id, CreatedAt = fsr.CreatedAt.AddHours(2) },
                new FulfillmentTask { ServiceRequestId = fsr.Id, Title = "Notify requester and close loop", Description = "Confirm completion with the requester and document resolution.", Status = "Pending", AssignedToId = agent1.Id, CreatedAt = fsr.CreatedAt.AddHours(3) }
            );
            Console.WriteLine($"Fallback seeded tasks for SR: {fsr.RequestNumber}");
        }
    }
    if (allFulfillmentSRs.Any()) await context.SaveChangesAsync();


    if (!context.DashboardMetrics.Any())
    {
        Console.WriteLine("Seeding dashboard metrics...");
        var metrics = new List<ITSMBackend.Models.DashboardMetric>
        {
            new ITSMBackend.Models.DashboardMetric { MetricName = "IT Service Availability", MetricType = "Performance", Value = 99.8m, TargetValue = 99.5m, Unit = "%", Timestamp = DateTime.UtcNow },
            new ITSMBackend.Models.DashboardMetric { MetricName = "Employee Satisfaction", MetricType = "Performance", Value = 4.5m, TargetValue = 4.0m, Unit = "/5.0", Timestamp = DateTime.UtcNow },
            new ITSMBackend.Models.DashboardMetric { MetricName = "Cost per Ticket", MetricType = "Efficiency", Value = 42.0m, TargetValue = 50.0m, Unit = "ريال", Timestamp = DateTime.UtcNow }
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

    // 8. Seed enterprise-grade operational records for the full ITSM flow
    if (!context.Tickets.Any(t => t.TicketNumber == "TKT-2026-007"))
    {
        Console.WriteLine("Seeding enterprise workflow tickets...");
        var enterpriseTickets = new List<Ticket>
        {
            new Ticket
            {
                TicketNumber = "TKT-2026-007",
                Title = "Major incident: CRM application unavailable",
                Description = "Monitoring detected CRM application outage affecting sales and support teams across regional offices.",
                Priority = "Critical",
                Status = "Assigned",
                Category = "Incident",
                Subcategory = "Application Outage",
                AssignedToId = admin.Id,
                RequestedById = user1.Id,
                CreatedAt = DateTime.UtcNow.AddMinutes(-40),
                UpdatedAt = DateTime.UtcNow.AddMinutes(-10),
                DueDate = DateTime.UtcNow.AddHours(2),
                SlaDueDate = DateTime.UtcNow.AddHours(2),
                SlaStatus = "at_risk",
                Urgency = 0.98m,
                Impact = 0.97m,
                ExternalSystem = "Monitoring",
                ExternalId = "EVT-CRM-CRIT-1001"
            },
            new Ticket
            {
                TicketNumber = "TKT-2026-008",
                Title = "Problem investigation: recurring CRM memory leak",
                Description = "Created from repeated CRM incidents to identify the root cause and permanent fix.",
                Priority = "High",
                Status = "In Progress",
                Category = "Problem",
                Subcategory = "Root Cause Analysis",
                AssignedToId = manager1.Id,
                RequestedById = admin.Id,
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                UpdatedAt = DateTime.UtcNow.AddHours(-2),
                DueDate = DateTime.UtcNow.AddDays(2),
                SlaDueDate = DateTime.UtcNow.AddDays(2),
                SlaStatus = "on_track",
                Urgency = 0.82m,
                Impact = 0.89m
            },
            new Ticket
            {
                TicketNumber = "TKT-2026-009",
                Title = "Access request: VPN access for external auditor",
                Description = "Standard access request requiring approval and time-bound remote access.",
                Priority = "Medium",
                Status = "Pending",
                Category = "Service Request",
                Subcategory = "VPN Access",
                AssignedToId = manager1.Id,
                RequestedById = user2.Id,
                CreatedAt = DateTime.UtcNow.AddHours(-6),
                UpdatedAt = DateTime.UtcNow.AddHours(-1),
                DueDate = DateTime.UtcNow.AddHours(8),
                SlaDueDate = DateTime.UtcNow.AddHours(8),
                SlaStatus = "on_track",
                Urgency = 0.52m,
                Impact = 0.41m
            },
            new Ticket
            {
                TicketNumber = "TKT-2026-010",
                Title = "Monitoring alert: database CPU sustained above 95 percent",
                Description = "Event-generated alert linked to the CRM outage chain and routed to infrastructure operations.",
                Priority = "High",
                Status = "New",
                Category = "Alert",
                Subcategory = "Database Performance",
                AssignedToId = agent2.Id,
                RequestedById = admin.Id,
                CreatedAt = DateTime.UtcNow.AddMinutes(-25),
                UpdatedAt = DateTime.UtcNow.AddMinutes(-25),
                DueDate = DateTime.UtcNow.AddHours(1),
                SlaDueDate = DateTime.UtcNow.AddHours(1),
                SlaStatus = "at_risk",
                Urgency = 0.91m,
                Impact = 0.78m,
                ExternalSystem = "Prometheus",
                ExternalId = "ALERT-DBCPU-784"
            }
        };

        context.Tickets.AddRange(enterpriseTickets);
        await context.SaveChangesAsync();
        Console.WriteLine($"Seeded {enterpriseTickets.Count} enterprise workflow tickets.");
    }

    var crmIncident = await context.Tickets.FirstOrDefaultAsync(t => t.TicketNumber == "TKT-2026-007");
    var crmProblem = await context.Tickets.FirstOrDefaultAsync(t => t.TicketNumber == "TKT-2026-008");

    if (crmIncident != null && !context.TicketComments.Any(tc => tc.TicketId == crmIncident.Id))
    {
        Console.WriteLine("Seeding ticket comments and activities...");
        context.TicketComments.AddRange(
            new TicketComment { TicketId = crmIncident.Id, UserId = admin.Id, Comment = "Major incident bridge opened. Application and database teams engaged.", CreatedAt = DateTime.UtcNow.AddMinutes(-35) },
            new TicketComment { TicketId = crmIncident.Id, UserId = agent2.Id, Comment = "Database host shows elevated CPU and connection pool saturation.", CreatedAt = DateTime.UtcNow.AddMinutes(-22) },
            new TicketComment { TicketId = crmProblem!.Id, UserId = manager1.Id, Comment = "Recurring signature matches prior memory leak observed after the last release.", CreatedAt = DateTime.UtcNow.AddHours(-1) }
        );

        context.TicketActivities.AddRange(
            new TicketActivity { TicketId = crmIncident.Id, UserId = admin.Id, Action = "StatusChange", OldValue = "New", NewValue = "Assigned", Timestamp = DateTime.UtcNow.AddMinutes(-34) },
            new TicketActivity { TicketId = crmIncident.Id, UserId = admin.Id, Action = "Assignment", OldValue = "Unassigned", NewValue = "Major Incident Team", Timestamp = DateTime.UtcNow.AddMinutes(-33) },
            new TicketActivity { TicketId = crmProblem!.Id, UserId = manager1.Id, Action = "LinkedIncidentReview", NewValue = "TKT-2026-007,TKT-2026-003", Timestamp = DateTime.UtcNow.AddHours(-1) }
        );

        await context.SaveChangesAsync();
    }

    if (!context.ProblemRecords.Any() && crmIncident != null)
    {
        Console.WriteLine("Seeding problem records...");
        var problem = new ProblemRecord
        {
            ProblemNumber = "PRB-2026-001",
            Title = "Recurring CRM memory leak",
            Description = "Recurring outages caused by a memory leak in the CRM application stack.",
            RootCause = "Application pool memory growth after release deployment.",
            Workaround = "Recycle the application pool and route traffic to the healthy node.",
            Status = "Investigating",
            Priority = "High",
            Category = "Incident Trend",
            CreatedById = admin.Id,
            CreatedAt = DateTime.UtcNow.AddHours(-2),
            UpdatedAt = DateTime.UtcNow.AddHours(-1)
        };

        context.ProblemRecords.Add(problem);
        await context.SaveChangesAsync();

        var ticketLinks = new List<ProblemTicketLink>
        {
            new ProblemTicketLink { ProblemRecordId = problem.Id, TicketId = crmIncident.Id, CreatedAt = DateTime.UtcNow.AddHours(-2) }
        };

        var priorIncident = await context.Tickets.FirstOrDefaultAsync(t => t.TicketNumber == "TKT-2026-003");
        if (priorIncident != null)
        {
            ticketLinks.Add(new ProblemTicketLink { ProblemRecordId = problem.Id, TicketId = priorIncident.Id, CreatedAt = DateTime.UtcNow.AddHours(-2) });
        }

        context.ProblemTicketLinks.AddRange(ticketLinks);
        await context.SaveChangesAsync();
    }

    if (!context.ChangeRequests.Any(cr => cr.ChangeNumber == "CHG-2026-001"))
    {
        Console.WriteLine("Seeding change requests...");
        context.ChangeRequests.AddRange(
            new ChangeRequest
            {
                ChangeNumber = "CHG-2026-001",
                Title = "Emergency CRM application pool memory fix",
                Description = "Apply vendor hotfix and recycle application pool to eliminate recurring CRM memory leak.",
                Status = "Approved",
                Priority = "Critical",
                RiskLevel = "High",
                Category = "Emergency",
                ImplementationPlan = "Deploy patched package to CRM web nodes and validate memory profile for 30 minutes.",
                BackoutPlan = "Revert to previous package and restore prior IIS configuration snapshot.",
                TestingPlan = "Execute smoke tests for login, search, opportunity update, and API latency under load.",
                RequestedById = admin.Id,
                ApprovedById = manager1.Id,
                ScheduledStartDate = DateTime.UtcNow.AddMinutes(20),
                ScheduledEndDate = DateTime.UtcNow.AddHours(2),
                CreatedAt = DateTime.UtcNow.AddMinutes(-15),
                UpdatedAt = DateTime.UtcNow.AddMinutes(-10)
            },
            new ChangeRequest
            {
                ChangeNumber = "CHG-2026-002",
                Title = "Firewall rule update for new vendor VPN",
                Description = "Normal change to enable approved VPN access path for the external audit partner.",
                Status = "Proposed",
                Priority = "Medium",
                RiskLevel = "Medium",
                Category = "Normal",
                ImplementationPlan = "Apply approved firewall object group and validate tunnel establishment.",
                BackoutPlan = "Disable the new object group and remove vendor policy entries.",
                TestingPlan = "Confirm connection from vendor IP range and review denied traffic logs.",
                RequestedById = user2.Id,
                ApprovedById = manager1.Id,
                ScheduledStartDate = DateTime.UtcNow.AddDays(1),
                ScheduledEndDate = DateTime.UtcNow.AddDays(1).AddHours(1),
                CreatedAt = DateTime.UtcNow.AddHours(-3),
                UpdatedAt = DateTime.UtcNow.AddHours(-1)
            }
        );

        await context.SaveChangesAsync();
    }

    if (!context.ServiceRequests.Any(sr => sr.RequestNumber == "SR-2026-005"))
    {
        Console.WriteLine("Seeding enterprise service requests...");
        var vpnCatalog = await context.ServiceCatalogItems.FirstOrDefaultAsync(item => item.Name == "VPN Access");
        var laptopCatalog = await context.ServiceCatalogItems.FirstOrDefaultAsync(item => item.Name == "Laptop");

        context.ServiceRequests.AddRange(
            new ServiceRequest
            {
                RequestNumber = "SR-2026-005",
                Title = "VPN access for external audit",
                Description = "Temporary VPN access with MFA and time-bound access for the finance audit window.",
                Status = "Open",
                Priority = "High",
                ServiceType = "Access Request",
                CatalogItemId = vpnCatalog?.Id,
                RequestedById = user2.Id,
                AssignedToId = manager1.Id,
                WorkflowStage = "Approval",
                CustomDataJson = "{\"requestorDepartment\":\"Finance\",\"requiresMfa\":true,\"expiry\":\"2026-03-31\"}",
                SlaDueDate = DateTime.UtcNow.AddHours(8),
                CreatedAt = DateTime.UtcNow.AddHours(-4),
                UpdatedAt = DateTime.UtcNow.AddHours(-1),
                EstimatedHours = 1.5m
            },
            new ServiceRequest
            {
                RequestNumber = "SR-2026-006",
                Title = "Laptop refresh for service desk analyst",
                Description = "Replace aging laptop for analyst and transfer approved software profile.",
                Status = "In Progress",
                Priority = "Medium",
                ServiceType = "Hardware Provisioning",
                CatalogItemId = laptopCatalog?.Id,
                RequestedById = admin.Id,
                AssignedToId = agent1.Id,
                WorkflowStage = "Fulfillment",
                CustomDataJson = "{\"deliveryLocation\":\"HQ Riyadh\",\"needsDock\":true}",
                SlaDueDate = DateTime.UtcNow.AddHours(36),
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                UpdatedAt = DateTime.UtcNow.AddHours(-5),
                EstimatedHours = 3m,
                ActualHours = 1.25m
            }
        );

        await context.SaveChangesAsync();
    }

    var vpnRequest = await context.ServiceRequests.FirstOrDefaultAsync(sr => sr.RequestNumber == "SR-2026-005");
    var laptopRefresh = await context.ServiceRequests.FirstOrDefaultAsync(sr => sr.RequestNumber == "SR-2026-006");

    if (!context.ApprovalItems.Any(ai => ai.Title == "Approve emergency CRM fix"))
    {
        Console.WriteLine("Seeding approval queue items...");
        var emergencyChange = await context.ChangeRequests.FirstOrDefaultAsync(cr => cr.ChangeNumber == "CHG-2026-001");

        context.ApprovalItems.AddRange(
            new ApprovalItem
            {
                ItemType = "Change",
                ReferenceId = emergencyChange?.Id ?? 0,
                Title = "Approve emergency CRM fix",
                Description = "Approval required for emergency remediation linked to major incident TKT-2026-007.",
                Status = "Approved",
                AssignedToId = manager1.Id,
                RequestedById = admin.Id,
                CreatedAt = DateTime.UtcNow.AddMinutes(-14),
                ResolvedAt = DateTime.UtcNow.AddMinutes(-11),
                ApprovalNotes = "Approved under emergency change policy due to customer impact.",
                Priority = 1
            },
            new ApprovalItem
            {
                ItemType = "ServiceRequest",
                ReferenceId = vpnRequest?.Id ?? 0,
                Title = "Approve auditor VPN access",
                Description = "Manager approval for external auditor access with time-bound entitlement.",
                Status = "Pending",
                AssignedToId = manager1.Id,
                RequestedById = user2.Id,
                CreatedAt = DateTime.UtcNow.AddHours(-2),
                Priority = 1
            }
        );

        await context.SaveChangesAsync();
    }

    if (vpnRequest != null && !context.ApprovalRequests.Any(ar => ar.ServiceRequestId == vpnRequest.Id))
    {
        Console.WriteLine("Seeding service request approvals, tasks, and audit logs...");
        context.ApprovalRequests.AddRange(
            new ApprovalRequest
            {
                ServiceRequestId = vpnRequest.Id,
                ApproverId = manager1.Id,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow.AddHours(-3)
            },
            new ApprovalRequest
            {
                ServiceRequestId = laptopRefresh!.Id,
                ApproverId = admin.Id,
                Status = "Approved",
                Comments = "Budget and stock verified.",
                DecidedAt = DateTime.UtcNow.AddHours(-18),
                CreatedAt = DateTime.UtcNow.AddHours(-20)
            }
        );

        context.FulfillmentTasks.AddRange(
            new FulfillmentTask
            {
                ServiceRequestId = vpnRequest.Id,
                Title = "Create vendor VPN profile",
                Description = "Provision temporary VPN profile with MFA and restricted finance network access.",
                Status = "Pending",
                AssignedToId = agent2.Id,
                CreatedAt = DateTime.UtcNow.AddHours(-2)
            },
            new FulfillmentTask
            {
                ServiceRequestId = laptopRefresh!.Id,
                Title = "Prepare laptop image",
                Description = "Build analyst profile with service desk tooling, VPN client, and endpoint protection.",
                Status = "In Progress",
                AssignedToId = agent1.Id,
                CreatedAt = DateTime.UtcNow.AddHours(-5)
            }
        );

        context.RequestAuditLogs.AddRange(
            new RequestAuditLog
            {
                ServiceRequestId = vpnRequest.Id,
                Action = "WorkflowStageChanged",
                Details = "Moved from Submission to Approval after manager review requirement detected.",
                PerformedById = admin.Id,
                Timestamp = DateTime.UtcNow.AddHours(-3)
            },
            new RequestAuditLog
            {
                ServiceRequestId = laptopRefresh!.Id,
                Action = "AssetAllocationStarted",
                Details = "Warehouse reserved LAPTOP-002 replacement kit for fulfillment.",
                PerformedById = agent1.Id,
                Timestamp = DateTime.UtcNow.AddHours(-5)
            }
        );

        await context.SaveChangesAsync();
    }

    if (!context.Workflows.Any(w => w.Name == "Critical Incident Response"))
    {
        Console.WriteLine("Seeding workflow templates...");
        var workflow = new Workflow
        {
            Name = "Critical Incident Response",
            Description = "Automated flow for major incidents from detection through closure and knowledge capture.",
            Status = "Published",
            CreatedById = admin.Id,
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            UpdatedAt = DateTime.UtcNow.AddHours(-1),
            TriggerType = "TicketCreated",
            WorkflowDefinition = "{\"steps\":[\"Categorize\",\"Assign\",\"Notify\",\"Bridge\",\"Resolve\",\"Knowledge\"]}",
            Version = 2
        };

        context.Workflows.Add(workflow);
        await context.SaveChangesAsync();

        context.WorkflowSteps.AddRange(
            new WorkflowStep { WorkflowId = workflow.Id, StepName = "Auto Categorize", StepType = "Classification", StepOrder = 1, StepConfiguration = "{\"category\":\"Incident\",\"priority\":\"Critical\"}" },
            new WorkflowStep { WorkflowId = workflow.Id, StepName = "Assign Major Incident Team", StepType = "Assignment", StepOrder = 2, StepConfiguration = "{\"group\":\"Major Incident Team\"}" },
            new WorkflowStep { WorkflowId = workflow.Id, StepName = "Notify Leadership", StepType = "Notification", StepOrder = 3, StepConfiguration = "{\"channels\":[\"Teams\",\"Email\"]}" },
            new WorkflowStep { WorkflowId = workflow.Id, StepName = "Open Incident Bridge", StepType = "Task", StepOrder = 4, StepConfiguration = "{\"bridgeType\":\"Teams\"}" },
            new WorkflowStep { WorkflowId = workflow.Id, StepName = "Review Permanent Fix", StepType = "Approval", StepOrder = 5, StepConfiguration = "{\"requiresChange\":true}" }
        );

        await context.SaveChangesAsync();
    }

    if (!context.AutomationRules.Any(rule => rule.Name == "Critical incident escalation"))
    {
        Console.WriteLine("Seeding automation rules...");
        context.AutomationRules.AddRange(
            new AutomationRule
            {
                Name = "Critical incident escalation",
                Description = "Escalates, notifies leadership, and opens an incident bridge when a critical incident is created.",
                TargetEntity = "Ticket",
                TriggerEvent = "OnCreate",
                IsActive = true,
                ConditionsJson = "{\"Category\":\"Incident\",\"Priority\":\"Critical\"}",
                ActionsJson = "[{\"Action\":\"NotifyManager\"},{\"Action\":\"Escalate\"},{\"Action\":\"CreateBridge\"},{\"Action\":\"StartSlaTimer\"}]",
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                UpdatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new AutomationRule
            {
                Name = "Monitoring alert to incident conversion",
                Description = "Creates an incident ticket and routes it to infrastructure operations when high-severity alerts arrive.",
                TargetEntity = "Ticket",
                TriggerEvent = "OnCreate",
                IsActive = true,
                ConditionsJson = "{\"Category\":\"Alert\",\"Priority\":\"High\"}",
                ActionsJson = "[{\"Action\":\"CreateRelatedIncident\"},{\"Action\":\"AssignGroup\",\"Value\":\"Infrastructure\"},{\"Action\":\"NotifyOnCall\"}]",
                CreatedAt = DateTime.UtcNow.AddDays(-3),
                UpdatedAt = DateTime.UtcNow.AddHours(-2)
            }
        );

        await context.SaveChangesAsync();
    }

    if (!context.AssetRelationships.Any())
    {
        Console.WriteLine("Seeding CMDB-style asset relationships...");
        var assets = await context.Assets.OrderBy(a => a.Id).ToListAsync();
        var softwareAsset = assets.FirstOrDefault(a => a.AssetTag == "SOFTWARE-001");
        var dbServer = assets.FirstOrDefault(a => a.AssetTag == "SERVER-001");
        var analystLaptop = assets.FirstOrDefault(a => a.AssetTag == "LAPTOP-002");

        if (softwareAsset != null && dbServer != null)
        {
            context.AssetRelationships.Add(new AssetRelationship
            {
                SourceAssetId = softwareAsset.Id,
                TargetAssetId = dbServer.Id,
                RelationshipType = "Depends On",
                CreatedAt = DateTime.UtcNow.AddDays(-10)
            });
        }

        if (analystLaptop != null && softwareAsset != null)
        {
            context.AssetRelationships.Add(new AssetRelationship
            {
                SourceAssetId = analystLaptop.Id,
                TargetAssetId = softwareAsset.Id,
                RelationshipType = "Connects To",
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            });
        }

        await context.SaveChangesAsync();
    }

    if (!context.ExternalIntegrations.Any(i => i.Name == "Prometheus Monitoring"))
    {
        Console.WriteLine("Seeding external integrations...");
        context.ExternalIntegrations.AddRange(
            new ExternalIntegration
            {
                Name = "Prometheus Monitoring",
                Provider = "Prometheus",
                ConfigurationJson = "{\"endpoint\":\"https://monitoring.internal/api\"}",
                EventSubscriptions = "[\"CriticalIncident\",\"DatabaseAlert\"]",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow.AddDays(-14),
                LastSyncAt = DateTime.UtcNow.AddMinutes(-20)
            },
            new ExternalIntegration
            {
                Name = "Microsoft Teams Incident Bridge",
                Provider = "MS Teams",
                ConfigurationJson = "{\"team\":\"Major Incident Response\"}",
                EventSubscriptions = "[\"CriticalIncident\",\"ChangeApproved\"]",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow.AddDays(-14),
                LastSyncAt = DateTime.UtcNow.AddMinutes(-12)
            }
        );

        await context.SaveChangesAsync();
    }

    if (!context.Notifications.Any(n => n.Title == "Major incident bridge opened"))
    {
        Console.WriteLine("Seeding notifications and audit logs...");
        context.Notifications.AddRange(
            new Notification
            {
                UserId = manager1.Id,
                Title = "Major incident bridge opened",
                Message = "CRM outage bridge has been opened and leadership notifications have been sent.",
                Type = "Warning",
                Link = "/ticket-details",
                IsRead = false,
                CreatedAt = DateTime.UtcNow.AddMinutes(-30)
            },
            new Notification
            {
                UserId = agent1.Id,
                Title = "Laptop refresh awaiting fulfillment",
                Message = "SR-2026-006 moved to fulfillment and requires imaging completion.",
                Type = "Info",
                Link = "/fulfillment-center",
                IsRead = false,
                CreatedAt = DateTime.UtcNow.AddHours(-4)
            }
        );

        var emergencyChange = await context.ChangeRequests.FirstAsync(cr => cr.ChangeNumber == "CHG-2026-001");
        var lastRelationship = await context.AssetRelationships.OrderByDescending(ar => ar.Id).FirstAsync();

        context.AuditLogs.AddRange(
            new AuditLog
            {
                UserId = admin.Id,
                EntityType = "Ticket",
                EntityId = crmIncident?.Id ?? 0,
                Action = "Create",
                NewValues = "{\"TicketNumber\":\"TKT-2026-007\",\"Priority\":\"Critical\",\"Category\":\"Incident\"}",
                Changes = "Major incident created from monitoring event.",
                Timestamp = DateTime.UtcNow.AddMinutes(-40),
                IpAddress = "10.20.30.15"
            },
            new AuditLog
            {
                UserId = manager1.Id,
                EntityType = "ChangeRequest",
                EntityId = emergencyChange.Id,
                Action = "Update",
                OldValues = "{\"Status\":\"Proposed\"}",
                NewValues = "{\"Status\":\"Approved\"}",
                Changes = "Emergency change approved according to major incident policy.",
                Timestamp = DateTime.UtcNow.AddMinutes(-11),
                IpAddress = "10.20.30.25"
            },
            new AuditLog
            {
                UserId = agent2.Id,
                EntityType = "AssetRelationship",
                EntityId = lastRelationship.Id,
                Action = "Create",
                NewValues = "{\"RelationshipType\":\"Depends On\"}",
                Changes = "CMDB dependency mapped for impact analysis.",
                Timestamp = DateTime.UtcNow.AddDays(-10),
                IpAddress = "10.20.30.44"
            }
        );

        await context.SaveChangesAsync();
    }

    var hiddenCatalogItems = await context.ServiceCatalogItems
        .Where(item => item.IsActive)
        .Where(item => item.Category == "Hardware" || (item.Name != null && item.Name.ToLower().Contains("macbook pro m3")))
        .ToListAsync();

    if (hiddenCatalogItems.Count > 0)
    {
        foreach (var item in hiddenCatalogItems)
        {
            item.IsActive = false;
        }

        await context.SaveChangesAsync();
        Console.WriteLine($"Deactivated {hiddenCatalogItems.Count} hidden catalog item(s).");
    }

    // Update existing catalog items with Arabic translations
    var existingItems = await context.ServiceCatalogItems.ToListAsync();
    foreach (var item in existingItems)
    {
        bool needsUpdate = false;
        if (string.IsNullOrEmpty(item.NameAr))
        {
            switch (item.Name?.ToLower())
            {
                case "laptop":
                    item.NameAr = "حاسوب محمول";
                    item.DescriptionAr = "حاسوب محمول عالي الأداء للمطورين والمستخدمين المتقدمين.";
                    item.CategoryAr = "أجهزة";
                    needsUpdate = true;
                    break;
                case "adobe creative cloud":
                    item.NameAr = "أدوبي كريتيف كلاود";
                    item.DescriptionAr = "الوصول إلى المجموعة الكاملة من تطبيقات أدوبي.";
                    item.CategoryAr = "برمجيات";
                    needsUpdate = true;
                    break;
                case "guest wi-fi access":
                    item.NameAr = "وصول Wi-Fi للزوار";
                    item.DescriptionAr = "وصول مؤقت إلى الإنترنت للزوار.";
                    item.CategoryAr = "وصول";
                    needsUpdate = true;
                    break;
                case "vpn access":
                    item.NameAr = "وصول VPN";
                    item.DescriptionAr = "وصول آمن عن بُعد إلى الشبكة الداخلية للشركة.";
                    item.CategoryAr = "وصول";
                    needsUpdate = true;
                    break;
            }
        }
        if (needsUpdate) await context.SaveChangesAsync();
    }

    Console.WriteLine("Database seeding completed successfully.");
}
