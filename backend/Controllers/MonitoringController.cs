using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ITSMBackend.Data;
using ITSMBackend.DTOs;
using ITSMBackend.Models;
using ITSMBackend.Services;

namespace ITSMBackend.Controllers;

[Authorize]
[ApiController]
[Route("api/monitoring")]
public class MonitoringController : ControllerBase
{
    private readonly ITicketService _ticketService;
    private readonly IProblemManagementService _problemService;
    private readonly ApplicationDbContext _context;

    public MonitoringController(ITicketService ticketService, IProblemManagementService problemService, ApplicationDbContext context)
    {
        _ticketService = ticketService;
        _problemService = problemService;
        _context = context;
    }

    [HttpPost("events")]
    public async Task<ActionResult<MonitoringEventResponseDto>> CreateIncidentFromEvent([FromBody] MonitoringEventDto dto)
    {
        var currentUserId = GetCurrentUserId();
        var ticket = await _ticketService.CreateTicketAsync(new Ticket
        {
            Title = dto.Title,
            Description = dto.Description,
            Category = dto.Category ?? "Incident",
            Subcategory = dto.Source,
            Priority = NormalizePriority(dto.Severity),
            Status = "New",
            RequestedById = currentUserId,
            ExternalSystem = "Monitoring",
            ExternalId = string.IsNullOrWhiteSpace(dto.IssueSignature) ? dto.EventId : dto.IssueSignature,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        ProblemRecordDto? problem = null;
        if (dto.CreateProblem || string.Equals(dto.Severity, "Critical", StringComparison.OrdinalIgnoreCase))
        {
            var matchingTickets = await _context.Tickets
                .Where(t => t.ExternalSystem == "Monitoring" && t.ExternalId == (string.IsNullOrWhiteSpace(dto.IssueSignature) ? dto.EventId : dto.IssueSignature))
                .Select(t => t.Id)
                .ToListAsync();

            if (!matchingTickets.Contains(ticket.Id))
            {
                matchingTickets.Add(ticket.Id);
            }

            if (matchingTickets.Count > 1)
            {
                problem = await _problemService.CreateFromTicketsAsync(
                    matchingTickets,
                    dto.ProblemTitle ?? dto.Title,
                    dto.ProblemDescription ?? dto.Description,
                    currentUserId,
                    "High",
                    "Incident Trend");
            }
        }

        return Ok(new MonitoringEventResponseDto
        {
            Ticket = ticket,
            Problem = problem
        });
    }

    [HttpGet("events/ping")]
    public ActionResult<object> Ping()
    {
        return Ok(new { status = "ok" });
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claim, out var userId) ? userId : 1;
    }

    private static string NormalizePriority(string? severity)
    {
        return severity?.ToLowerInvariant() switch
        {
            "critical" => "Critical",
            "high" => "High",
            "medium" => "Medium",
            "low" => "Low",
            _ => "Medium"
        };
    }
}

public class MonitoringEventDto
{
    public string EventId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Severity { get; set; } = "Medium";
    public string? Source { get; set; }
    public string? Category { get; set; }
    public string? IssueSignature { get; set; }
    public bool CreateProblem { get; set; }
    public string? ProblemTitle { get; set; }
    public string? ProblemDescription { get; set; }
}

public class MonitoringEventResponseDto
{
    public TicketDto Ticket { get; set; } = null!;
    public ProblemRecordDto? Problem { get; set; }
}
