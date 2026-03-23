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

    [HttpGet]
    public async Task<ActionResult<List<TicketDto>>> GetAllTickets()
    {
        var tickets = await _ticketService.GetAllTicketsAsync();
        return Ok(tickets);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TicketDetailDto>> GetTicketById(int id)
    {
        var ticket = await _ticketService.GetTicketByIdAsync(id);
        if (ticket == null)
            return NotFound();

        return Ok(ticket);
    }

    [HttpPost]
    public async Task<ActionResult<TicketDto>> CreateTicket([FromBody] CreateTicketDto dto)
    {
        // TODO: Get userId from authentication context
        int userId = 0; // Let service handle fallback if not authenticated
        
        var ticket = await _ticketService.CreateTicketAsync(dto, userId);
        return CreatedAtAction(nameof(GetTicketById), new { id = ticket.Id }, ticket);
    }

    [HttpPut("{id}")]
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

    [HttpDelete("{id}")]
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

    [HttpGet("status/{status}")]
    public async Task<ActionResult<List<TicketDto>>> GetTicketsByStatus(string status)
    {
        var tickets = await _ticketService.GetTicketsByStatusAsync(status);
        return Ok(tickets);
    }

    [HttpGet("assignee/{userId}")]
    public async Task<ActionResult<List<TicketDto>>> GetTicketsByAssignee(int userId)
    {
        var tickets = await _ticketService.GetTicketsByAssigneeAsync(userId);
        return Ok(tickets);
    }

    [HttpPost("{id}/comments")]
    public async Task<IActionResult> AddComment(int id, [FromBody] AddCommentRequest request)
    {
        try
        {
            // TODO: Get userId from authentication context
            int userId = 1; // Placeholder
            await _ticketService.AddCommentAsync(id, userId, request.Comment);
            return Ok();
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("statistics/open-count")]
    public async Task<ActionResult<int>> GetOpenTicketsCount()
    {
        var count = await _ticketService.GetOpenTicketsCountAsync();
        return Ok(count);
    }
}

public class AddCommentRequest
{
    public string Comment { get; set; } = string.Empty;
}
