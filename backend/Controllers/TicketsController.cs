using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using ITSMBackend.Data;
using ITSMBackend.DTOs;
using ITSMBackend.Services;

namespace ITSMBackend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;
    private readonly ApplicationDbContext _context;
    private readonly IUserService _userService;

    public TicketsController(ITicketService ticketService, ApplicationDbContext context, IUserService userService)
    {
        _ticketService = ticketService;
        _context = context;
        _userService = userService;
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
        [FromQuery] int? requestedById,
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
            RequestedById = requestedById,
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
        try
        {
            var ticket = await _ticketService.GetTicketByIdAsync(id);
            if (ticket == null) return NotFound();
            return Ok(ticket);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, details = ex.ToString() });
        }
    }

    /// <summary>Create a new incident ticket</summary>
    [HttpPost]
    public async Task<ActionResult<TicketDto>> CreateTicket([FromBody] CreateTicketDto dto)
    {
        var currentUserId = await GetCurrentActiveUserIdAsync();
        if (currentUserId == null)
        {
            return Forbid();
        }

        int requestedById = currentUserId.Value;

        // If a specific requester is provided (e.g. ERP employee), sync them JIT
        if (dto.RequestedById.HasValue && dto.RequestedById.Value > 0)
        {
            try
            {
                requestedById = await _userService.EnsureUserExistsAsync(dto.RequestedById.Value);
            }
            catch (Exception ex)
            {
                // Fallback to current user if sync fails, or log it
                Console.WriteLine($"JIT Requester Sync failed: {ex.Message}");
            }
        }

        var ticket = await _ticketService.CreateTicketAsync(dto, requestedById);
        return CreatedAtAction(nameof(GetTicketById), new { id = ticket.Id }, ticket);
    }

    /// <summary>Update ticket fields (partial update – only non-null fields applied)</summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<TicketDto>> UpdateTicket(int id, [FromBody] UpdateTicketDto dto)
    {
        try
        {
            var ticket = await _ticketService.UpdateTicketAsync(id, dto, GetCurrentUserId());
            return Ok(ticket);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, details = ex.ToString() });
        }
    }

    /// <summary>Delete a ticket</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTicket(int id)
    {
        try
        {
            await _ticketService.DeleteTicketAsync(id, GetCurrentUserId());
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, details = ex.ToString() });
        }
    }

    /// <summary>Get tickets by status</summary>
    [HttpGet("status/{status}")]
    public async Task<ActionResult<List<TicketDto>>> GetTicketsByStatus(string status)
    {
        try
        {
            var tickets = await _ticketService.GetTicketsByStatusAsync(status);
            return Ok(tickets);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, details = ex.ToString() });
        }
    }

    /// <summary>Get tickets assigned to a specific user</summary>
    [HttpGet("assignee/{userId:int}")]
    public async Task<ActionResult<List<TicketDto>>> GetTicketsByAssignee(int userId)
    {
        try
        {
            var tickets = await _ticketService.GetTicketsByAssigneeAsync(userId);
            return Ok(tickets);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, details = ex.ToString() });
        }
    }

    /// <summary>Add a comment to a ticket</summary>
    [HttpPost("{id:int}/comments")]
    public async Task<IActionResult> AddComment(int id, [FromBody] AddCommentRequest request)
    {
        try
        {
            var userId = await GetCurrentActiveUserIdAsync();
            if (userId == null) return Forbid();

            await _ticketService.AddCommentAsync(id, userId.Value, request.Comment);
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
        try
        {
            await _ticketService.RefreshSlaStatusAsync();
            return Ok(new { message = "SLA statuses refreshed" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, details = ex.ToString() });
        }
    }

    [HttpPost("{id:int}/status")]
    public async Task<ActionResult<TicketDto>> UpdateStatus(int id, [FromBody] UpdateTicketStatusRequest request)
    {
        try
        {
            var ticket = await _ticketService.UpdateTicketAsync(id, new UpdateTicketDto { Status = request.Status }, GetCurrentUserId());
            return Ok(ticket);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, details = ex.ToString() });
        }
    }

    [HttpPost("{id:int}/priority")]
    public async Task<ActionResult<TicketDto>> UpdatePriority(int id, [FromBody] UpdateTicketPriorityRequest request)
    {
        try
        {
            var ticket = await _ticketService.UpdateTicketAsync(id, new UpdateTicketDto { Priority = request.Priority }, GetCurrentUserId());
            return Ok(ticket);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, details = ex.ToString() });
        }
    }

    [HttpPost("{id:int}/assign")]
    public async Task<ActionResult<TicketDto>> AssignTicket(int id, [FromBody] AssignTicketRequest request)
    {
        try
        {
            var ticket = await _ticketService.UpdateTicketAsync(id, new UpdateTicketDto
            {
                AssignedToId = request.AssignedToId,
                AssignedTo = request.AssignedTo
            }, GetCurrentUserId());
            return Ok(ticket);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, details = ex.ToString() });
        }
    }

    [HttpPost("{id:int}/escalate")]
    public async Task<ActionResult<TicketDto>> EscalateTicket(int id, [FromBody] EscalateTicketRequest request)
    {
        try
        {
            var ticket = await _ticketService.UpdateTicketAsync(id, new UpdateTicketDto
            {
                Priority = "Critical",
                Status = "In Progress"
            }, GetCurrentUserId());

            await _ticketService.RecordActivityAsync(
                id,
                request.UserId ?? 1,
                "Escalation",
                null,
                string.IsNullOrWhiteSpace(request.Reason) ? "Escalated via API" : request.Reason);

            return Ok(ticket);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, details = ex.ToString() });
        }
    }

    [HttpPost("{id:int}/replies")]
    public async Task<IActionResult> AddReply(int id, [FromBody] TicketTextRequest request)
    {
        var userId = request.UserId ?? await GetCurrentActiveUserIdAsync() ?? 0;
        if (userId <= 0) return Forbid();

        await _ticketService.AddCommentAsync(id, userId, request.Text);
        return Ok(new { message = "Reply added" });
    }

    [HttpPost("{id:int}/notes")]
    public async Task<IActionResult> AddInternalNote(int id, [FromBody] TicketTextRequest request)
    {
        var userId = request.UserId ?? await GetCurrentActiveUserIdAsync() ?? 0;
        if (userId <= 0) return Forbid();

        await _ticketService.AddCommentAsync(id, userId, $"[Internal] {request.Text}");
        await _ticketService.RecordActivityAsync(id, userId, "InternalNote", null, request.Text);
        return Ok(new { message = "Internal note added" });
    }

    [HttpPost("{id:int}/feedback")]
    public async Task<IActionResult> SubmitFeedback(int id, [FromBody] TicketFeedbackRequest request)
    {
        await _ticketService.RecordActivityAsync(
            id,
            request.UserId ?? 1,
            "CustomerFeedback",
            request.Rating.ToString(),
            request.Feedback ?? string.Empty);
        return Ok(new { message = "Feedback recorded" });
    }

    [HttpPost("{id:int}/time/start")]
    public async Task<IActionResult> StartTimeTracking(int id, [FromBody] TicketTimeTrackingRequest request)
    {
        var userId = request.UserId ?? await GetCurrentActiveUserIdAsync() ?? 0;
        if (userId <= 0) return Forbid();

        await _ticketService.RecordActivityAsync(id, userId, "TimeTrackingStarted", null, DateTime.UtcNow.ToString("O"));
        return Ok(new { message = "Timer started" });
    }

    [HttpPost("{id:int}/time/stop")]
    public async Task<IActionResult> StopTimeTracking(int id, [FromBody] TicketTimeTrackingRequest request)
    {
        var userId = request.UserId ?? await GetCurrentActiveUserIdAsync() ?? 0;
        if (userId <= 0) return Forbid();

        await _ticketService.RecordActivityAsync(id, userId, "TimeTrackingStopped", null, request.DurationSeconds.ToString());
        return Ok(new { message = "Timer stopped" });
    }

    [HttpPost("{id:int}/reopen")]
    public async Task<ActionResult<TicketDto>> ReopenTicket(int id, [FromBody] ReopenTicketRequest request)
    {
        try
        {
            var ticket = await _ticketService.ReopenTicketAsync(id, GetCurrentUserId(), request?.Reason);
            return Ok(ticket);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("{id:int}/attachments")]
    public async Task<ActionResult<List<TicketAttachmentDto>>> GetAttachments(int id)
    {
        var attachments = await _ticketService.GetAttachmentsAsync(id);
        return Ok(attachments);
    }

    [HttpGet("{id:int}/attachments/{attachmentId:int}")]
    public async Task<IActionResult> DownloadAttachment(int id, int attachmentId)
    {
        var attachment = await _ticketService.DownloadAttachmentAsync(id, attachmentId);
        if (attachment == null)
        {
            return NotFound();
        }

        return File(attachment.Value.Data, attachment.Value.ContentType, attachment.Value.FileName);
    }

    [HttpPost("{id:int}/attachments")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<TicketAttachmentDto>> UploadAttachment(int id, [FromForm] TicketAttachmentUploadRequest request)
    {
        if (request.File == null)
        {
            return BadRequest(new { message = "File is required" });
        }

        var attachment = await _ticketService.AddAttachmentAsync(id, GetCurrentUserId(), request.File);
        return Ok(attachment);
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claim, out var userId) ? userId : 1;
    }

    private async Task<int?> GetCurrentActiveUserIdAsync()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(claim, out var userId))
        {
            return null;
        }

        var isActive = await _context.Users
            .AsNoTracking()
            .AnyAsync(u => u.Id == userId && u.IsActive);

        return isActive ? userId : null;
    }
}

public class AddCommentRequest
{
    public string Comment { get; set; } = string.Empty;
}

public class UpdateTicketStatusRequest
{
    public string Status { get; set; } = string.Empty;
}

public class UpdateTicketPriorityRequest
{
    public string Priority { get; set; } = string.Empty;
}

public class AssignTicketRequest
{
    public int? AssignedToId { get; set; }
    public UserDto? AssignedTo { get; set; }
}

public class EscalateTicketRequest
{
    public int? UserId { get; set; }
    public string? Reason { get; set; }
}

public class TicketTextRequest
{
    public int? UserId { get; set; }
    public string Text { get; set; } = string.Empty;
}

public class TicketFeedbackRequest
{
    public int? UserId { get; set; }
    public int Rating { get; set; }
    public string? Feedback { get; set; }
}

public class TicketTimeTrackingRequest
{
    public int? UserId { get; set; }
    public int DurationSeconds { get; set; }
}

public class ReopenTicketRequest
{
    public string? Reason { get; set; }
}

public class TicketAttachmentUploadRequest
{
    public IFormFile? File { get; set; }
}
