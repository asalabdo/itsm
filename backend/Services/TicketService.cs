using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using ITSMBackend.Data;
using ITSMBackend.DTOs;
using ITSMBackend.Models;
using System.IO;
using System.Text.Json;

namespace ITSMBackend.Services;

public interface ITicketService
{
    Task<List<TicketDto>> GetAllTicketsAsync();
    Task<List<TicketDto>> SearchTicketsAsync(TicketFilterDto filter);
    Task<TicketDetailDto?> GetTicketByIdAsync(int id);
    Task<TicketDto> CreateTicketAsync(CreateTicketDto dto, int requestedById);
    Task<TicketDto> UpdateTicketAsync(int id, UpdateTicketDto dto, int changedByUserId = 1);
    Task DeleteTicketAsync(int id, int deletedByUserId);
    Task<List<TicketDto>> GetTicketsByStatusAsync(string status);
    Task<List<TicketDto>> GetTicketsByAssigneeAsync(int userId);
    Task AddCommentAsync(int ticketId, int userId, string comment);
    Task RecordActivityAsync(int ticketId, int userId, string action, string? oldValue = null, string? newValue = null);
    Task<int> GetOpenTicketsCountAsync();
    Task<TicketStatsDto> GetStatsAsync();
    Task RefreshSlaStatusAsync();
    Task<Ticket?> GetTicketByExternalIdAsync(string externalId, string externalSystem);
    Task<TicketDto> CreateTicketAsync(Ticket ticket);
    Task UpdateTicketAsync(Ticket ticket);
    Task<TicketDto> ReopenTicketAsync(int ticketId, int userId, string? reason = null);
    Task<TicketAttachmentDto> AddAttachmentAsync(int ticketId, int userId, IFormFile file);
    Task<List<TicketAttachmentDto>> GetAttachmentsAsync(int ticketId);
    Task<(byte[] Data, string ContentType, string FileName)?> DownloadAttachmentAsync(int ticketId, int attachmentId);
}

public class TicketService : ITicketService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<TicketService> _logger;
    private readonly IWorkflowRoutingService _workflowRoutingService;

    // SLA hours by priority (response time targets)
    private static readonly Dictionary<string, int> SlaHours = new()
    {
        { "Critical", 4 },
        { "High", 8 },
        { "Medium", 24 },
        { "Low", 72 }
    };

    private readonly IWorkflowEngineService _workflowEngine;
    private readonly IUserService _userService;

    public TicketService(
        ApplicationDbContext context,
        IMapper mapper,
        IWorkflowEngineService workflowEngine,
        IUserService userService,
        IWorkflowRoutingService workflowRoutingService,
        ILogger<TicketService> logger)
    {
        _context = context;
        _mapper = mapper;
        _workflowEngine = workflowEngine;
        _userService = userService;
        _workflowRoutingService = workflowRoutingService;
        _logger = logger;
    }

    public async Task<List<TicketDto>> GetAllTicketsAsync()
    {
        var tickets = await _context.Tickets
            .Include(t => t.AssignedTo)
            .Include(t => t.RequestedBy)
            .Include(t => t.Comments)
            .Include(t => t.Activities)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return tickets.Select(t => MapWithSla(t)).ToList();
    }

    public async Task<List<TicketDto>> SearchTicketsAsync(TicketFilterDto filter)
    {
        var query = _context.Tickets
            .Include(t => t.AssignedTo)
            .Include(t => t.RequestedBy)
            .Include(t => t.Comments)
            .Include(t => t.Activities)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Status))
            query = query.Where(t => t.Status == filter.Status);

        if (!string.IsNullOrWhiteSpace(filter.Priority))
            query = query.Where(t => t.Priority == filter.Priority);

        if (!string.IsNullOrWhiteSpace(filter.Category))
            query = query.Where(t => t.Category == filter.Category);

        if (filter.AssignedToId.HasValue)
            query = query.Where(t => t.AssignedToId == filter.AssignedToId);

        if (filter.RequestedById.HasValue)
            query = query.Where(t => t.RequestedById == filter.RequestedById);

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var term = filter.Search.ToLower();
            query = query.Where(t =>
                t.Title.ToLower().Contains(term) ||
                t.Description.ToLower().Contains(term) ||
                t.TicketNumber.ToLower().Contains(term));
        }

        if (filter.CreatedFrom.HasValue)
            query = query.Where(t => t.CreatedAt >= filter.CreatedFrom.Value);

        if (filter.CreatedTo.HasValue)
            query = query.Where(t => t.CreatedAt <= filter.CreatedTo.Value);

        var tickets = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();

        // Apply SLA filter in memory (computed field)
        var dtos = tickets.Select(t => MapWithSla(t)).ToList();

        if (!string.IsNullOrWhiteSpace(filter.SlaStatus))
            dtos = dtos.Where(d => d.SlaStatus == filter.SlaStatus).ToList();

        return dtos;
    }

    public async Task<TicketDetailDto?> GetTicketByIdAsync(int id)
    {
        var ticket = await _context.Tickets
            .Include(t => t.AssignedTo)
            .Include(t => t.RequestedBy)
            .Include(t => t.Comments).ThenInclude(c => c.User)
            .Include(t => t.Activities).ThenInclude(a => a.User)
            .Include(t => t.Attachments)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null) return null;

        var dto = _mapper.Map<TicketDetailDto>(ticket);
        EnrichWithSla(ticket, dto);
        return dto;
    }

    public async Task<TicketDto> CreateTicketAsync(CreateTicketDto dto, int requestedById)
    {
        if (requestedById <= 0)
        {
            var defaultUser = await _context.Users.FirstOrDefaultAsync();
            requestedById = defaultUser?.Id ?? 1;
        }

        var ticket = _mapper.Map<Ticket>(dto);
        ticket.RequestedById = requestedById;
        ticket.TicketNumber = GenerateTicketNumber();
        ticket.Status = "Open";
        ticket.CreatedAt = DateTime.UtcNow;
        ticket.UpdatedAt = DateTime.UtcNow;
        ticket.SlaDueDate = CalculateSlaDueDate(dto.Priority, DateTime.UtcNow);
        ticket.SlaStatus = "on_track";

        if (!ticket.AssignedToId.HasValue)
        {
            ticket.AssignedToId = await ResolveAutoAssigneeIdAsync(ticket.Category);
        }

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        await LogActivityAsync(ticket.Id, requestedById, "Created", null, ticket.Status);

        // Workflow engine is optional for ticket creation; a missing automation table should not block saves.
        try
        {
            await _workflowEngine.ProcessTriggersAsync("Ticket", "OnCreate", ticket, ticket.TicketNumber);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Workflow trigger processing failed for ticket {TicketId}", ticket.Id);
        }

        try
        {
            await _workflowRoutingService.RouteTicketAsync(ticket, requestedById);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Dynamic workflow routing failed for ticket {TicketId}", ticket.Id);
        }

        return MapWithSla(ticket);
    }

    public async Task<TicketDto> UpdateTicketAsync(int id, UpdateTicketDto dto, int changedByUserId = 1)
    {
        var ticket = await _context.Tickets.FindAsync(id)
            ?? throw new ArgumentException("Ticket not found");

        var oldStatus = ticket.Status;
        var oldPriority = ticket.Priority;
        var oldAssignedToId = ticket.AssignedToId;

        if (dto.Title != null)
            ticket.Title = dto.Title;

        if (dto.Description != null)
            ticket.Description = dto.Description;

        if (dto.Priority != null)
            ticket.Priority = dto.Priority;

        if (dto.Status != null)
            ticket.Status = dto.Status;

        if (dto.Category != null)
            ticket.Category = dto.Category;

        if (dto.AssignedToId.HasValue)
        {
            var localUserId = dto.AssignedTo != null
                ? await _userService.EnsureUserExistsAsync(dto.AssignedTo)
                : await _userService.EnsureUserExistsAsync(dto.AssignedToId.Value);
            ticket.AssignedToId = localUserId;
        }

        if (dto.DueDate.HasValue)
            ticket.DueDate = dto.DueDate;

        if (dto.ResolutionNotes != null)
            ticket.ResolutionNotes = dto.ResolutionNotes;

        if (dto.Urgency.HasValue)
            ticket.Urgency = dto.Urgency;

        if (dto.Impact.HasValue)
            ticket.Impact = dto.Impact;

        ticket.UpdatedAt = DateTime.UtcNow;

        if (dto.Status == "Resolved" && ticket.ResolvedAt == null)
            ticket.ResolvedAt = DateTime.UtcNow;

        // Recalculate SLA if priority changed
        if (dto.Priority != null && dto.Priority != oldPriority)
            ticket.SlaDueDate = CalculateSlaDueDate(ticket.Priority, ticket.CreatedAt);

        ticket.SlaStatus = ComputeSlaStatus(ticket);

        await _context.SaveChangesAsync();

        // Log status changes
        if (dto.Status != null && dto.Status != oldStatus)
        {
            await TryLogActivityAsync(ticket.Id, changedByUserId, "StatusChanged", oldStatus, dto.Status);
        }

        if (dto.Priority != null && dto.Priority != oldPriority)
        {
            await TryLogActivityAsync(ticket.Id, changedByUserId, "PriorityChanged", oldPriority, dto.Priority);
        }

        if (dto.AssignedToId.HasValue && dto.AssignedToId != oldAssignedToId)
        {
            await TryLogActivityAsync(ticket.Id, changedByUserId, "Assigned", oldAssignedToId?.ToString(), dto.AssignedToId.Value.ToString());
        }

        await _context.Entry(ticket).Reference(t => t.RequestedBy).LoadAsync();
        await _context.Entry(ticket).Reference(t => t.AssignedTo).LoadAsync();

        // Workflow Engine Trigger
        try
        {
            await _workflowEngine.ProcessTriggersAsync("Ticket", "OnUpdate", ticket, ticket.TicketNumber);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Workflow trigger processing failed for ticket {TicketId}", ticket.Id);
        }

        return MapWithSla(ticket);
    }

    public async Task DeleteTicketAsync(int id, int deletedByUserId)
    {
        var ticket = await _context.Tickets.FindAsync(id)
            ?? throw new ArgumentException("Ticket not found");

        var snapshot = JsonSerializer.Serialize(new
        {
            ticket.TicketNumber,
            ticket.Title,
            ticket.Status,
            ticket.Priority,
            ticket.Category,
            ticket.AssignedToId,
            ticket.RequestedById
        });

        _context.AuditLogs.Add(new AuditLog
        {
            UserId = deletedByUserId > 0 ? deletedByUserId : (ticket.RequestedById ?? 1),
            EntityType = "Ticket",
            EntityId = ticket.Id,
            Action = "Delete",
            OldValues = snapshot,
            Changes = "Ticket deleted from system",
            Timestamp = DateTime.UtcNow
        });

        _context.Tickets.Remove(ticket);
        await _context.SaveChangesAsync();
    }

    public async Task<List<TicketDto>> GetTicketsByStatusAsync(string status)
    {
        var tickets = await _context.Tickets
            .Where(t => t.Status == status)
            .Include(t => t.AssignedTo)
            .Include(t => t.RequestedBy)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return tickets.Select(t => MapWithSla(t)).ToList();
    }

    public async Task<List<TicketDto>> GetTicketsByAssigneeAsync(int userId)
    {
        var tickets = await _context.Tickets
            .Where(t => t.AssignedToId == userId)
            .Include(t => t.AssignedTo)
            .Include(t => t.RequestedBy)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return tickets.Select(t => MapWithSla(t)).ToList();
    }

    public async Task AddCommentAsync(int ticketId, int userId, string comment)
    {
        var ticketComment = new TicketComment
        {
            TicketId = ticketId,
            UserId = userId,
            Comment = comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.TicketComments.Add(ticketComment);

        var ticket = await _context.Tickets.FindAsync(ticketId);
        if (ticket != null)
            ticket.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task RecordActivityAsync(int ticketId, int userId, string action, string? oldValue = null, string? newValue = null)
    {
        await LogActivityAsync(ticketId, userId, action, oldValue, newValue);
    }

    public async Task<int> GetOpenTicketsCountAsync()
    {
        return await _context.Tickets
            .Where(t => t.Status == "Open")
            .CountAsync();
    }

    public async Task<TicketStatsDto> GetStatsAsync()
    {
        var tickets = await _context.Tickets.ToListAsync();
        var now = DateTime.UtcNow;

        return new TicketStatsDto
        {
            Total = tickets.Count,
            Open = tickets.Count(t => t.Status == "Open"),
            InProgress = tickets.Count(t => t.Status == "In Progress"),
            Resolved = tickets.Count(t => t.Status == "Resolved"),
            Closed = tickets.Count(t => t.Status == "Closed"),
            SlaBreached = tickets.Count(t =>
                t.SlaDueDate.HasValue && t.SlaDueDate < now &&
                t.Status != "Resolved" && t.Status != "Closed"),
            SlaAtRisk = tickets.Count(t =>
                t.SlaDueDate.HasValue && t.SlaDueDate > now &&
                (t.SlaDueDate.Value - now).TotalMinutes < 120 &&
                t.Status != "Resolved" && t.Status != "Closed"),
            Critical = tickets.Count(t => t.Priority == "Critical"),
            High = tickets.Count(t => t.Priority == "High"),
            Medium = tickets.Count(t => t.Priority == "Medium"),
            Low = tickets.Count(t => t.Priority == "Low"),
        };
    }

    public async Task RefreshSlaStatusAsync()
    {
        var activeTickets = await _context.Tickets
            .Where(t => t.Status != "Resolved" && t.Status != "Closed")
            .ToListAsync();

        foreach (var ticket in activeTickets)
        {
            // Set SLA due date if missing
            if (!ticket.SlaDueDate.HasValue)
                ticket.SlaDueDate = CalculateSlaDueDate(ticket.Priority, ticket.CreatedAt);

            ticket.SlaStatus = ComputeSlaStatus(ticket);
        }

        await _context.SaveChangesAsync();
    }

    public async Task<Ticket?> GetTicketByExternalIdAsync(string externalId, string externalSystem)
    {
        return await _context.Tickets
            .Include(t => t.AssignedTo)
            .Include(t => t.RequestedBy)
            .FirstOrDefaultAsync(t => t.ExternalId == externalId && t.ExternalSystem == externalSystem);
    }

    public async Task<TicketDto> CreateTicketAsync(Ticket ticket)
    {
        if (string.IsNullOrEmpty(ticket.TicketNumber))
            ticket.TicketNumber = GenerateTicketNumber();

        if (ticket.CreatedAt == default)
            ticket.CreatedAt = DateTime.UtcNow;

        if (ticket.UpdatedAt == default)
            ticket.UpdatedAt = DateTime.UtcNow;

        if (!ticket.SlaDueDate.HasValue)
            ticket.SlaDueDate = CalculateSlaDueDate(ticket.Priority, ticket.CreatedAt);

        ticket.SlaStatus = ComputeSlaStatus(ticket);

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        try
        {
            await _workflowEngine.ProcessTriggersAsync("Ticket", "OnCreate", ticket, ticket.TicketNumber);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Workflow trigger processing failed for ticket {TicketId}", ticket.Id);
        }

        try
        {
            await _workflowRoutingService.RouteTicketAsync(ticket, ticket.RequestedById ?? 1, ticket.ExternalSystem);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Dynamic workflow routing failed for imported ticket {TicketId}", ticket.Id);
        }

        return MapWithSla(ticket);
    }

    public async Task UpdateTicketAsync(Ticket ticket)
    {
        ticket.UpdatedAt = DateTime.UtcNow;
        ticket.SlaStatus = ComputeSlaStatus(ticket);
        _context.Tickets.Update(ticket);
        await _context.SaveChangesAsync();
    }

    public async Task<TicketDto> ReopenTicketAsync(int ticketId, int userId, string? reason = null)
    {
        var ticket = await _context.Tickets
            .Include(t => t.AssignedTo)
            .Include(t => t.RequestedBy)
            .Include(t => t.Comments)
            .Include(t => t.Activities)
            .FirstOrDefaultAsync(t => t.Id == ticketId)
            ?? throw new ArgumentException("Ticket not found");

        var previousStatus = ticket.Status;
        ticket.Status = "Reopened";
        ticket.ResolvedAt = null;
        ticket.UpdatedAt = DateTime.UtcNow;
        ticket.SlaStatus = ComputeSlaStatus(ticket);

        await _context.SaveChangesAsync();
        await LogActivityAsync(ticketId, userId, "Reopened", previousStatus, reason ?? "Ticket reopened");

        return await GetTicketSummaryAsync(ticketId);
    }

    public async Task<TicketAttachmentDto> AddAttachmentAsync(int ticketId, int userId, IFormFile file)
    {
        var ticket = await _context.Tickets.FindAsync(ticketId)
            ?? throw new ArgumentException("Ticket not found");

        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);

        var attachment = new TicketAttachment
        {
            TicketId = ticketId,
            UserId = userId,
            FileName = Path.GetFileName(file.FileName),
            ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType,
            ContentLength = file.Length,
            FileData = ms.ToArray(),
            CreatedAt = DateTime.UtcNow
        };

        _context.TicketAttachments.Add(attachment);
        ticket.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return _mapper.Map<TicketAttachmentDto>(attachment);
    }

    public async Task<List<TicketAttachmentDto>> GetAttachmentsAsync(int ticketId)
    {
        var attachments = await _context.TicketAttachments
            .Where(a => a.TicketId == ticketId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<TicketAttachmentDto>>(attachments);
    }

    public async Task<(byte[] Data, string ContentType, string FileName)?> DownloadAttachmentAsync(int ticketId, int attachmentId)
    {
        var attachment = await _context.TicketAttachments
            .FirstOrDefaultAsync(a => a.TicketId == ticketId && a.Id == attachmentId);

        if (attachment == null)
            return null;

        return (attachment.FileData, attachment.ContentType, attachment.FileName);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private static string GenerateTicketNumber()
    {
        return $"TKT-{DateTime.UtcNow:yyyy}-{DateTime.UtcNow.Ticks % 100000:D5}";
    }

    private static DateTime CalculateSlaDueDate(string priority, DateTime createdAt)
    {
        var hours = SlaHours.TryGetValue(priority, out var h) ? h : 24;
        return createdAt.AddHours(hours);
    }

    private static string ComputeSlaStatus(Ticket ticket)
    {
        if (!ticket.SlaDueDate.HasValue) return "on_track";
        if (ticket.Status is "Resolved" or "Closed") return "resolved";

        var remaining = ticket.SlaDueDate.Value - DateTime.UtcNow;
        if (remaining.TotalMinutes <= 0) return "breached";
        if (remaining.TotalMinutes <= 120) return "at_risk";
        return "on_track";
    }

    private TicketDto MapWithSla(Ticket ticket)
    {
        var dto = _mapper.Map<TicketDto>(ticket);
        EnrichWithSla(ticket, dto);
        return dto;
    }

    private static void EnrichWithSla(Ticket ticket, TicketDto dto)
    {
        dto.SlaDueDate = ticket.SlaDueDate;
        dto.SlaStatus = ComputeSlaStatus(ticket);
        dto.Urgency = ticket.Urgency;
        dto.Impact = ticket.Impact;
        dto.ResolutionNotes = ticket.ResolutionNotes;

        if (ticket.SlaDueDate.HasValue && ticket.Status is not ("Resolved" or "Closed"))
        {
            var remaining = (int)(ticket.SlaDueDate.Value - DateTime.UtcNow).TotalMinutes;
            dto.SlaRemainingMinutes = remaining;
        }
    }

    private async Task LogActivityAsync(int ticketId, int userId, string action, string? oldValue, string? newValue)
    {
        var resolvedUserId = await ResolveLocalUserIdAsync(userId);
        _context.TicketActivities.Add(new TicketActivity
        {
            TicketId = ticketId,
            UserId = resolvedUserId,
            Action = action,
            OldValue = oldValue,
            NewValue = newValue,
            Timestamp = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();
    }

    private async Task TryLogActivityAsync(int ticketId, int userId, string action, string? oldValue, string? newValue)
    {
        try
        {
            await LogActivityAsync(ticketId, userId, action, oldValue, newValue);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to log ticket activity {Action} for ticket {TicketId}", action, ticketId);
        }
    }

    private async Task<int> ResolveLocalUserIdAsync(int userId)
    {
        if (await _context.Users.AnyAsync(u => u.Id == userId))
        {
            return userId;
        }

        var fallbackUser = await _context.Users
            .Where(u => u.IsActive)
            .OrderBy(u => u.Id)
            .Select(u => u.Id)
            .FirstOrDefaultAsync();

        return fallbackUser > 0 ? fallbackUser : 1;
    }

    private async Task<TicketDto> GetTicketSummaryAsync(int id)
    {
        var ticket = await _context.Tickets
            .Include(t => t.AssignedTo)
            .Include(t => t.RequestedBy)
            .Include(t => t.Comments)
            .Include(t => t.Activities)
            .Include(t => t.Attachments)
            .FirstAsync(t => t.Id == id);

        return MapWithSla(ticket);
    }

    private async Task<int?> ResolveAutoAssigneeIdAsync(string category)
    {
        var normalized = (category ?? string.Empty).Trim().ToLowerInvariant();
        var technicians = await _context.Users
            .Where(u => u.IsActive && u.Role != UserRole.EndUser)
            .ToListAsync();

        var keywords = normalized.Contains("network")
            ? new[] { "network", "infrastructure", "support" }
            : normalized.Contains("security")
                ? new[] { "security", "soc", "support" }
                : normalized.Contains("change")
                    ? new[] { "manager", "change" }
                    : normalized.Contains("access")
                        ? new[] { "security", "support" }
                        : new[] { "support", "it" };

        foreach (var keyword in keywords)
        {
            var match = technicians.FirstOrDefault(u =>
                (!string.IsNullOrWhiteSpace(u.Department) && u.Department.Contains(keyword, StringComparison.OrdinalIgnoreCase)) ||
                (!string.IsNullOrWhiteSpace(u.JobTitle) && u.JobTitle.Contains(keyword, StringComparison.OrdinalIgnoreCase)) ||
                u.Username.Contains(keyword, StringComparison.OrdinalIgnoreCase));

            if (match != null)
                return match.Id;
        }

        return technicians.FirstOrDefault()?.Id;
    }
}
