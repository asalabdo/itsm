using Microsoft.AspNetCore.Mvc;
using ITSMBackend.DTOs;
using ITSMBackend.Services;

namespace ITSMBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public TicketsController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }

    /// <summary>Get all tickets (ordered by newest first)</summary>
    [HttpGet]
    public async Task<ActionResult<List<TicketDto>>> GetAllTickets()
    {
        var tickets = await _ticketService.GetAllTicketsAsync();
        return Ok(tickets);
    }

    /// <summary>Search and filter tickets</summary>
    [HttpGet("search")]
    public async Task<ActionResult<List<TicketDto>>> SearchTickets(
        [FromQuery] string? status,
        [FromQuery] string? priority,
        [FromQuery] string? category,
        [FromQuery] int? assignedToId,
        [FromQuery] string? search,
        [FromQuery] string? slaStatus,
        [FromQuery] DateTime? createdFrom,
        [FromQuery] DateTime? createdTo)
    {
        var filter = new TicketFilterDto
        {
            Status = status,
            Priority = priority,
            Category = category,
            AssignedToId = assignedToId,
            Search = search,
            SlaStatus = slaStatus,
            CreatedFrom = createdFrom,
            CreatedTo = createdTo
        };

        var tickets = await _ticketService.SearchTicketsAsync(filter);
        return Ok(tickets);
    }

    /// <summary>Get ticket statistics / summary counts</summary>
    [HttpGet("statistics")]
    public async Task<ActionResult<TicketStatsDto>> GetStatistics()
    {
        var stats = await _ticketService.GetStatsAsync();
        return Ok(stats);
    }

    /// <summary>Get a single ticket with comments and activity log</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<TicketDetailDto>> GetTicketById(int id)
    {
        var ticket = await _ticketService.GetTicketByIdAsync(id);
        if (ticket == null) return NotFound();
        return Ok(ticket);
    }

    /// <summary>Create a new incident ticket</summary>
    [HttpPost]
    public async Task<ActionResult<TicketDto>> CreateTicket([FromBody] CreateTicketDto dto)
    {
        // TODO: Get userId from JWT claims once auth middleware is wired in
        int userId = 0;
        var ticket = await _ticketService.CreateTicketAsync(dto, userId);
        return CreatedAtAction(nameof(GetTicketById), new { id = ticket.Id }, ticket);
    }

    /// <summary>Update ticket fields (partial update – only non-null fields applied)</summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<TicketDto>> UpdateTicket(int id, [FromBody] UpdateTicketDto dto)
    {
        try
        {
            var ticket = await _ticketService.UpdateTicketAsync(id, dto);
            return Ok(ticket);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }

    /// <summary>Delete a ticket</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTicket(int id)
    {
        try
        {
            await _ticketService.DeleteTicketAsync(id);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }

    /// <summary>Get tickets by status</summary>
    [HttpGet("status/{status}")]
    public async Task<ActionResult<List<TicketDto>>> GetTicketsByStatus(string status)
    {
        var tickets = await _ticketService.GetTicketsByStatusAsync(status);
        return Ok(tickets);
    }

    /// <summary>Get tickets assigned to a specific user</summary>
    [HttpGet("assignee/{userId:int}")]
    public async Task<ActionResult<List<TicketDto>>> GetTicketsByAssignee(int userId)
    {
        var tickets = await _ticketService.GetTicketsByAssigneeAsync(userId);
        return Ok(tickets);
    }

    /// <summary>Add a comment to a ticket</summary>
    [HttpPost("{id:int}/comments")]
    public async Task<IActionResult> AddComment(int id, [FromBody] AddCommentRequest request)
    {
        try
        {
            int userId = 1; // TODO: from JWT claims
            await _ticketService.AddCommentAsync(id, userId, request.Comment);
            return Ok();
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }

    /// <summary>Get count of open tickets</summary>
    [HttpGet("statistics/open-count")]
    public async Task<ActionResult<int>> GetOpenTicketsCount()
    {
        var count = await _ticketService.GetOpenTicketsCountAsync();
        return Ok(count);
    }

    /// <summary>Recalculate and persist SLA statuses for all active tickets</summary>
    [HttpPost("sla/refresh")]
    public async Task<IActionResult> RefreshSlaStatus()
    {
        await _ticketService.RefreshSlaStatusAsync();
        return Ok(new { message = "SLA statuses refreshed" });
    }
}

public class AddCommentRequest
{
    public string Comment { get; set; } = string.Empty;
}
