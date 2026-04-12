using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ITSMBackend.Data;
using ITSMBackend.DTOs;
using ITSMBackend.Models;

namespace ITSMBackend.Services;

public interface IServiceRequestService
{
    Task<List<ServiceCatalogItemDto>> GetCatalogAsync();
    Task<List<ServiceRequestDto>> GetAllAsync();
    Task<ServiceRequestDto?> GetByIdAsync(int id);
    Task<ServiceRequestDto> CreateAsync(CreateServiceRequestDto dto, int userId);
    Task<ServiceRequestDto> UpdateAsync(int id, UpdateServiceRequestDto dto);
    Task DeleteAsync(int id);
    Task<List<ServiceRequestDto>> GetByStatusAsync(string status);
    Task<ServiceRequestDto> ApproveRequestAsync(int approvalId, bool approve, string? comments);
    Task<ServiceRequestDto> CompleteRequestAsync(int requestId, string? comments);
    Task<ServiceRequestDto> CompleteTaskAsync(int taskId, string? comments);
    Task<List<ServiceRequestDto>> GetTechnicianQueueAsync();
    Task<List<ServiceRequestDto>> GetUserRequestsAsync(int userId);
    Task NotifyUserAsync(int userId, string title, string message, string type, string? link = null);
}

public class ServiceRequestService : IServiceRequestService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IWorkflowRoutingService _workflowRoutingService;
    private readonly ILogger<ServiceRequestService> _logger;

    public ServiceRequestService(
        ApplicationDbContext context,
        IMapper mapper,
        IWorkflowRoutingService workflowRoutingService,
        ILogger<ServiceRequestService> logger)
    {
        _context = context;
        _mapper = mapper;
        _workflowRoutingService = workflowRoutingService;
        _logger = logger;
    }

    public async Task<List<ServiceCatalogItemDto>> GetCatalogAsync()
    {
        var items = await _context.ServiceCatalogItems
            .Where(i => i.IsActive)
            .ToListAsync();

        items = items.Where(i => !IsHiddenCatalogItem(i)).ToList();
        var requestCounts = await _context.ServiceRequests
            .Where(sr => sr.CatalogItemId.HasValue)
            .GroupBy(sr => sr.CatalogItemId!.Value)
            .Select(g => new { CatalogItemId = g.Key, Count = g.Count() })
            .ToListAsync();

        var mapped = _mapper.Map<List<ServiceCatalogItemDto>>(items);
        foreach (var item in mapped)
        {
            item.RequestCount = requestCounts.FirstOrDefault(rc => rc.CatalogItemId == item.Id)?.Count ?? 0;
        }

        return mapped;
    }

    public async Task<List<ServiceRequestDto>> GetAllAsync()
    {
        var requests = await _context.ServiceRequests
            .Include(sr => sr.CatalogItem)
            .Include(sr => sr.RequestedBy)
            .Include(sr => sr.AssignedTo)
            .Include(sr => sr.Approvals)
                .ThenInclude(a => a.Approver)
            .Include(sr => sr.Tasks)
                .ThenInclude(t => t.AssignedTo)
            .Include(sr => sr.AuditLogs)
            .OrderByDescending(sr => sr.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<ServiceRequestDto>>(requests);
    }

    public async Task<ServiceRequestDto?> GetByIdAsync(int id)
    {
        var request = await _context.ServiceRequests
            .Include(sr => sr.CatalogItem)
            .Include(sr => sr.RequestedBy)
            .Include(sr => sr.AssignedTo)
            .Include(sr => sr.Approvals).ThenInclude(a => a.Approver)
            .Include(sr => sr.Tasks).ThenInclude(t => t.AssignedTo)
            .Include(sr => sr.AuditLogs)
            .FirstOrDefaultAsync(sr => sr.Id == id);

        return request == null ? null : _mapper.Map<ServiceRequestDto>(request);
    }

    public async Task<ServiceRequestDto> CreateAsync(CreateServiceRequestDto dto, int userId)
    {
        var catalogItem = await _context.ServiceCatalogItems.FindAsync(dto.CatalogItemId);
        if (catalogItem == null || IsHiddenCatalogItem(catalogItem)) throw new Exception("Invalid catalog item");

        var count = await _context.ServiceRequests.CountAsync() + 1001;
        var requestNumber = $"REQ-{count}";

        var request = new ServiceRequest
        {
            RequestNumber = requestNumber,
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            ServiceType = catalogItem.Name,
            CatalogItemId = dto.CatalogItemId,
            CustomDataJson = dto.CustomDataJson,
            RequestedById = userId,
            Status = catalogItem.RequiresApproval ? "Pending Approval" : "In Fulfillment",
            WorkflowStage = catalogItem.RequiresApproval ? "Approval" : "Fulfillment",
            SlaDueDate = DateTime.UtcNow.AddHours(catalogItem.DefaultSlaHours),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            AssignedToId = GetDefaultAssigneeForCategory(catalogItem.Category)
        };

        _context.ServiceRequests.Add(request);
        await _context.SaveChangesAsync();

        if (catalogItem.RequiresApproval)
        {
            _context.ApprovalRequests.Add(new ApprovalRequest
            {
                ServiceRequestId = request.Id,
                ApproverId = 1,
                Status = "Pending"
            });
        }
        else
        {
            AddFulfillmentTasks(request, catalogItem);
        }

        _context.RequestAuditLogs.Add(new RequestAuditLog
        {
            ServiceRequestId = request.Id,
            Action = "Submitted",
            Details = $"Request {requestNumber} submitted by user {userId}",
            PerformedById = userId
        });

        await _context.SaveChangesAsync();

        await NotifyUserAsync(userId, "Request Submitted", $"Your request {requestNumber} has been received.", "Info", $"/service-catalog");

        try
        {
            await _workflowRoutingService.RouteServiceRequestAsync(request, userId);
        }
        catch (Exception ex)
        {
            // Dynamic workflow routing should never block the request submission.
            _logger.LogWarning(ex, "Dynamic workflow routing failed for service request {ServiceRequestId}", request.Id);
        }

        return (await GetByIdAsync(request.Id))!;
    }

    public async Task<ServiceRequestDto> UpdateAsync(int id, UpdateServiceRequestDto dto)
    {
        var request = await _context.ServiceRequests.FindAsync(id);
        if (request == null)
            throw new ArgumentException("Service request not found");

        if (dto.Title != null) request.Title = dto.Title;
        if (dto.Description != null) request.Description = dto.Description;
        if (dto.Status != null) request.Status = dto.Status;
        if (dto.Priority != null) request.Priority = dto.Priority;
        if (dto.AssignedToId != null) request.AssignedToId = dto.AssignedToId;
        
        request.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return (await GetByIdAsync(request.Id))!;
    }

    public async Task DeleteAsync(int id)
    {
        var request = await _context.ServiceRequests.FindAsync(id);
        if (request == null)
            throw new ArgumentException("Service request not found");

        _context.ServiceRequests.Remove(request);
        await _context.SaveChangesAsync();
    }

    public async Task<List<ServiceRequestDto>> GetByStatusAsync(string status)
    {
        var requests = await _context.ServiceRequests
            .Where(sr => sr.Status == status)
            .Include(sr => sr.CatalogItem)
            .OrderByDescending(sr => sr.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<ServiceRequestDto>>(requests);
    }

    public async Task<ServiceRequestDto> ApproveRequestAsync(int approvalId, bool approve, string? comments)
    {
        var approval = await _context.ApprovalRequests
            .Include(a => a.ServiceRequest)
            .FirstOrDefaultAsync(a => a.Id == approvalId);
            
        if (approval == null) throw new Exception("Approval request not found");

        approval.Status = approve ? "Approved" : "Rejected";
        approval.DecidedAt = DateTime.UtcNow;
        approval.Comments = comments;

        var request = approval.ServiceRequest;
        if (approve)
        {
            request.Status = "In Fulfillment";
            request.WorkflowStage = "Fulfillment";
            var catalogItem = await _context.ServiceCatalogItems.FirstOrDefaultAsync(item => item.Id == request.CatalogItemId);
            if (catalogItem != null && !await _context.FulfillmentTasks.AnyAsync(task => task.ServiceRequestId == request.Id))
            {
                AddFulfillmentTasks(request, catalogItem);
            }
        }
        else
        {
            request.Status = "Rejected";
            request.WorkflowStage = "Completed";
        }

        _context.RequestAuditLogs.Add(new RequestAuditLog
        {
            ServiceRequestId = request.Id,
            Action = approve ? "Approved" : "Rejected",
            Details = $"Approval decision by {approval.ApproverId}. Comments: {comments}",
            PerformedById = approval.ApproverId
        });

        await _context.SaveChangesAsync();

        if (request.RequestedById.HasValue)
        {
            await NotifyUserAsync(request.RequestedById.Value, 
                approve ? "Request Approved" : "Request Rejected", 
                $"Your request {request.RequestNumber} has been {approval.Status.ToLower()}.", 
                approve ? "Success" : "Error", 
                $"/service-catalog");
        }

        return (await GetByIdAsync(request.Id))!;
    }

    public async Task<ServiceRequestDto> CompleteRequestAsync(int requestId, string? comments)
    {
        var request = await _context.ServiceRequests
            .Include(sr => sr.Tasks)
            .FirstOrDefaultAsync(sr => sr.Id == requestId);

        if (request == null)
            throw new Exception("Service request not found");

        var now = DateTime.UtcNow;
        foreach (var task in request.Tasks.Where(task => task.Status != "Completed"))
        {
            task.Status = "Completed";
            task.CompletedAt = now;
        }

        request.Status = "Fulfilled";
        request.WorkflowStage = "Completed";
        request.CompletionDate = now;
        request.UpdatedAt = now;

        _context.RequestAuditLogs.Add(new RequestAuditLog
        {
            ServiceRequestId = request.Id,
            Action = "Completed",
            Details = $"Request completed. Comments: {comments}",
            PerformedById = request.AssignedToId ?? request.RequestedById ?? 1
        });

        await _context.SaveChangesAsync();

        if (request.RequestedById.HasValue)
        {
            await NotifyUserAsync(
                request.RequestedById.Value,
                "Request Completed",
                $"Your request {request.RequestNumber} has been completed.",
                "Success",
                "/service-request-management");
        }

        return (await GetByIdAsync(request.Id))!;
    }

    public async Task<ServiceRequestDto> CompleteTaskAsync(int taskId, string? comments)
    {
        var task = await _context.FulfillmentTasks
            .Include(t => t.ServiceRequest)
                .ThenInclude(sr => sr.Tasks)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task == null)
            throw new Exception("Fulfillment task not found");

        if (task.Status != "Completed")
        {
            task.Status = "Completed";
            task.CompletedAt = DateTime.UtcNow;
        }

        var request = task.ServiceRequest;
        _context.RequestAuditLogs.Add(new RequestAuditLog
        {
            ServiceRequestId = request.Id,
            Action = "TaskCompleted",
            Details = $"Task '{task.Title}' completed. Comments: {comments}",
            PerformedById = request.AssignedToId ?? request.RequestedById ?? 1
        });

        await _context.SaveChangesAsync();

        var allTasksCompleted = await _context.FulfillmentTasks
            .Where(t => t.ServiceRequestId == request.Id)
            .AllAsync(t => t.Status == "Completed");

        if (allTasksCompleted && request.CompletionDate == null)
        {
            return await CompleteRequestAsync(request.Id, comments);
        }

        return (await GetByIdAsync(request.Id))!;
    }

    public async Task<List<ServiceRequestDto>> GetTechnicianQueueAsync()
    {
        var requests = await _context.ServiceRequests
            .Include(s => s.CatalogItem)
            .Include(s => s.RequestedBy)
            .Include(s => s.AssignedTo)
            .Include(s => s.Approvals)
                .ThenInclude(a => a.Approver)
            .Include(s => s.Tasks)
                .ThenInclude(t => t.AssignedTo)
            .Where(s => s.Status != "Completed" && s.Status != "Fulfilled" && s.Status != "Closed" && s.Status != "Rejected")
            .OrderBy(s => s.SlaDueDate)
            .ToListAsync();

        // Update SLA breach status for in-progress items
        bool updated = false;
        foreach (var req in requests.Where(r => !r.IsSlaBreached && r.SlaDueDate < DateTime.UtcNow))
        {
            req.IsSlaBreached = true;
            updated = true;
        }
        if (updated) await _context.SaveChangesAsync();

        return _mapper.Map<List<ServiceRequestDto>>(requests);
    }

    public async Task<List<ServiceRequestDto>> GetUserRequestsAsync(int userId)
    {
        var requests = await _context.ServiceRequests
            .Include(s => s.CatalogItem)
            .Include(s => s.RequestedBy)
            .Include(s => s.AssignedTo)
            .Include(s => s.Approvals)
                .ThenInclude(a => a.Approver)
            .Include(s => s.Tasks)
                .ThenInclude(t => t.AssignedTo)
            .Where(s => s.RequestedById == userId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
        return _mapper.Map<List<ServiceRequestDto>>(requests);
    }

    public async Task NotifyUserAsync(int userId, string title, string message, string type, string? link = null)
    {
        _context.Notifications.Add(new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            Link = link,
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();
    }

    private int? GetDefaultAssigneeForCategory(string category)
    {
        if (string.IsNullOrEmpty(category)) return 1;

        return category.ToLower() switch
        {
            "hardware" => 2,
            "software" => 3,
            "access" => 1,
            _ => 1
        };
    }

    private void AddFulfillmentTasks(ServiceRequest request, ServiceCatalogItem catalogItem)
    {
        if (_context.FulfillmentTasks.Any(task => task.ServiceRequestId == request.Id))
        {
            return;
        }

        var assigneeId = request.AssignedToId ?? GetDefaultAssigneeForCategory(catalogItem.Category) ?? 1;
        var templates = BuildTaskTemplates(catalogItem, request.Title);

        for (var index = 0; index < templates.Count; index++)
        {
            var template = templates[index];
            _context.FulfillmentTasks.Add(new FulfillmentTask
            {
                ServiceRequestId = request.Id,
                Title = template.Title,
                Description = template.Description,
                Status = index == 0 ? "In Progress" : "Pending",
                AssignedToId = assigneeId,
                CreatedAt = DateTime.UtcNow.AddMinutes(index * 5)
            });
        }
    }

    private static List<(string Title, string Description)> BuildTaskTemplates(ServiceCatalogItem catalogItem, string requestTitle)
    {
        var category = catalogItem.Category.Trim().ToLowerInvariant();

        return category switch
        {
            "hardware" => new List<(string, string)>
            {
                ("Confirm asset availability", $"Check stock and reserve a device for {requestTitle}."),
                ("Prepare and image device", $"Install the approved base image, security agents, and required software."),
                ("Schedule delivery", $"Coordinate handoff with the requester and confirm receipt.")
            },
            "software" => new List<(string, string)>
            {
                ("Validate licensing", $"Confirm the software license or entitlement for {requestTitle}."),
                ("Install application", $"Deploy the approved application package and validate launch."),
                ("Notify requester", $"Confirm the application is ready for use.")
            },
            "access" => new List<(string, string)>
            {
                ("Review access request", $"Verify the requested access scope for {requestTitle}."),
                ("Provision permissions", $"Apply the approved access changes and capture evidence."),
                ("Confirm completion", $"Notify the requester that access has been updated.")
            },
            "network" => new List<(string, string)>
            {
                ("Check network prerequisites", $"Validate the network change requirements for {requestTitle}."),
                ("Implement network change", $"Apply the approved network configuration."),
                ("Verify connectivity", $"Confirm the requester can reach the expected services.")
            },
            "security" => new List<(string, string)>
            {
                ("Validate security approval", $"Confirm the security controls required for {requestTitle}."),
                ("Apply security change", $"Provision the approved security access or control."),
                ("Record evidence", $"Document the change for audit and compliance tracking.")
            },
            _ => new List<(string, string)>
            {
                ("Review request details", $"Review the request requirements for {requestTitle}."),
                ("Complete fulfillment", $"Carry out the service work and validate the outcome."),
                ("Close requester loop", $"Confirm completion with the requester and close the request.")
            }
        };
    }

    private static bool IsHiddenCatalogItem(ServiceCatalogItem item)
    {
        var name = item.Name?.Trim();
        var category = item.Category?.Trim();

        return string.Equals(name, "MacBook Pro M3", StringComparison.OrdinalIgnoreCase)
            || string.Equals(category, "Hardware", StringComparison.OrdinalIgnoreCase);
    }
}
