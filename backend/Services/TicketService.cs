using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ITSMBackend.Data;
using ITSMBackend.DTOs;
using ITSMBackend.Models;

namespace ITSMBackend.Services;

public interface ITicketService
{
    Task<List<TicketDto>> GetAllTicketsAsync();
    Task<List<TicketDto>> SearchTicketsAsync(TicketFilterDto filter);
    Task<TicketDetailDto?> GetTicketByIdAsync(int id);
    Task<TicketDto> CreateTicketAsync(CreateTicketDto dto, int requestedById);
    Task<TicketDto> UpdateTicketAsync(int id, UpdateTicketDto dto);
    Task DeleteTicketAsync(int id);
    Task<List<TicketDto>> GetTicketsByStatusAsync(string status);
    Task<List<TicketDto>> GetTicketsByAssigneeAsync(int userId);
    Task AddCommentAsync(int ticketId, int userId, string comment);
    Task<int> GetOpenTicketsCountAsync();
    Task<TicketStatsDto> GetStatsAsync();
    Task RefreshSlaStatusAsync();
    Task<Ticket?> GetTicketByExternalIdAsync(string externalId, string externalSystem);
    Task<TicketDto> CreateTicketAsync(Ticket ticket);
    Task UpdateTicketAsync(Ticket ticket);
}

public class TicketService : ITicketService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    // SLA hours by priority (response time targets)
    private static readonly Dictionary<string, int> SlaHours = new()
    {
        { "Critical", 4 },
        { "High", 8 },
        { "Medium", 24 },
        { "Low", 72 }
    };

    private readonly IWorkflowEngineService _workflowEngine;

    public TicketService(ApplicationDbContext context, IMapper mapper, IWorkflowEngineService workflowEngine)
    {
        _context = context;
        _mapper = mapper;
        _workflowEngine = workflowEngine;
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

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        await LogActivityAsync(ticket.Id, requestedById, "Created", null, ticket.Status);

        // Workflow Engine Trigger
        await _workflowEngine.ProcessTriggersAsync("Ticket", "OnCreate", ticket, ticket.TicketNumber);

        return MapWithSla(ticket);
    }

    public async Task<TicketDto> UpdateTicketAsync(int id, UpdateTicketDto dto)
    {
        var ticket = await _context.Tickets.FindAsync(id)
            ?? throw new ArgumentException("Ticket not found");

        var oldStatus = ticket.Status;
        var oldPriority = ticket.Priority;

        _mapper.Map(dto, ticket);
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
            var userId = 1; // placeholder until auth context is used
            await LogActivityAsync(ticket.Id, userId, "StatusChanged", oldStatus, dto.Status);
        }

        await _context.Entry(ticket).Reference(t => t.RequestedBy).LoadAsync();

        // Workflow Engine Trigger
        await _workflowEngine.ProcessTriggersAsync("Ticket", "OnUpdate", ticket, ticket.TicketNumber);

        return MapWithSla(ticket);
    }

    public async Task DeleteTicketAsync(int id)
    {
        var ticket = await _context.Tickets.FindAsync(id)
            ?? throw new ArgumentException("Ticket not found");

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

        return MapWithSla(ticket);
    }

    public async Task UpdateTicketAsync(Ticket ticket)
    {
        ticket.UpdatedAt = DateTime.UtcNow;
        ticket.SlaStatus = ComputeSlaStatus(ticket);
        _context.Tickets.Update(ticket);
        await _context.SaveChangesAsync();
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
        _context.TicketActivities.Add(new TicketActivity
        {
            TicketId = ticketId,
            UserId = userId,
            Action = action,
            OldValue = oldValue,
            NewValue = newValue,
            Timestamp = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();
    }
}
