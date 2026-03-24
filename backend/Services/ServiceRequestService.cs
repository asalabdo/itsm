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
    Task<List<ServiceRequestDto>> GetTechnicianQueueAsync();
    Task<List<ServiceRequestDto>> GetUserRequestsAsync(int userId);
    Task NotifyUserAsync(int userId, string title, string message, string type, string? link = null);
}

public class ServiceRequestService : IServiceRequestService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ServiceRequestService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ServiceCatalogItemDto>> GetCatalogAsync()
    {
        var items = await _context.ServiceCatalogItems.Where(i => i.IsActive).ToListAsync();
        return _mapper.Map<List<ServiceCatalogItemDto>>(items);
    }

    public async Task<List<ServiceRequestDto>> GetAllAsync()
    {
        var requests = await _context.ServiceRequests
            .Include(sr => sr.CatalogItem)
            .Include(sr => sr.RequestedBy)
            .Include(sr => sr.AssignedTo)
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
        if (catalogItem == null) throw new Exception("Invalid catalog item");

        var count = await _context.ServiceRequests.CountAsync() + 1001;
        var requestNumber = $"REQ-{count}";

        var request = new ServiceRequest
        {
            RequestNumber = requestNumber,
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
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
                ApproverId = 1, // Default manager
                Status = "Pending"
            });
        }
        else
        {
            _context.FulfillmentTasks.Add(new FulfillmentTask
            {
                ServiceRequestId = request.Id,
                Title = $"Initiate fulfillment for {catalogItem.Name}",
                Status = "Pending"
            });
        }

        _context.RequestAuditLogs.Add(new RequestAuditLog
        {
            ServiceRequestId = request.Id,
            Action = "Submitted",
            Details = $"Request {requestNumber} submitted by user {userId}",
            PerformedById = userId
        });

        await _context.SaveChangesAsync();

        // Send Notifications
        await NotifyUserAsync(userId, "Request Submitted", $"Your request {requestNumber} has been received.", "Info", $"/service-catalog");
        if (catalogItem.RequiresApproval)
        {
            await NotifyUserAsync(1, "Approval Required", $"New approval request for {requestNumber}.", "Warning", "/fulfillment-center");
        }
        else if (request.AssignedToId.HasValue)
        {
            await NotifyUserAsync(request.AssignedToId.Value, "New Assignment", $"New service request {requestNumber} assigned to you.", "Info", "/fulfillment-center");
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
            
            _context.FulfillmentTasks.Add(new FulfillmentTask
            {
                ServiceRequestId = request.Id,
                Title = "Provision Service",
                Description = "Finalize request as per dynamic data requirements.",
                Status = "Pending"
            });
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

    public async Task<List<ServiceRequestDto>> GetTechnicianQueueAsync()
    {
        var requests = await _context.ServiceRequests
            .Include(s => s.CatalogItem)
            .Where(s => s.Status != "Completed" && s.Status != "Rejected")
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
}
