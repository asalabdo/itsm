using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Asp.Versioning;
using System.Security.Claims;
using System.Collections.Generic;
using System.Threading.Tasks;
using ITSMBackend.DTOs;
using ITSMBackend.Services;

namespace ITSMBackend.Controllers;

[Authorize]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiController]
public class ChangeRequestsController : ControllerBase
{
    private readonly IChangeRequestService _service;

    public ChangeRequestsController(IChangeRequestService service)
    {
        _service = service;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
    }

    [HttpGet]
    public async Task<ActionResult<List<ChangeRequestDto>>> GetAll()
    {
        var changes = await _service.GetAllAsync();
        return Ok(changes);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ChangeRequestDto>> GetById(int id)
    {
        var change = await _service.GetByIdAsync(id);
        if (change == null)
            return NotFound();

        return Ok(change);
    }

    [HttpPost]
    public async Task<ActionResult<ChangeRequestDto>> Create([FromBody] CreateChangeRequestDto dto)
    {
        var userId = GetCurrentUserId();
        var change = await _service.CreateAsync(dto, userId);
        return CreatedAtAction(nameof(GetById), new { id = change.Id }, change);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ChangeRequestDto>> Update(int id, [FromBody] UpdateChangeRequestDto dto)
    {
        try
        {
            var change = await _service.UpdateAsync(id, dto);
            return Ok(change);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("status/{status}")]
    public async Task<ActionResult<List<ChangeRequestDto>>> GetByStatus(string status)
    {
        var changes = await _service.GetByStatusAsync(status);
        return Ok(changes);
    }

    [HttpPost("{id}/submit")]
    public async Task<ActionResult<ChangeRequestDto>> Submit(int id)
    {
        try
        {
            var change = await _service.SubmitForApprovalAsync(id);
            return Ok(change);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost("{id}/approve")]
    public async Task<ActionResult<ChangeRequestDto>> Approve(int id, [FromBody] ApprovalDecisionDto decision)
    {
        try
        {
            var approverId = GetCurrentUserId();
            var change = await _service.ApproveChangeAsync(id, approverId, decision.Notes ?? "Approved via API");
            return Ok(change);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost("{id}/reject")]
    public async Task<ActionResult<ChangeRequestDto>> Reject(int id, [FromBody] ApprovalDecisionDto decision)
    {
        try
        {
            var approverId = GetCurrentUserId();
            var change = await _service.RejectChangeAsync(id, approverId, decision.Notes ?? "Rejected via API");
            return Ok(change);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }
}

public class ApprovalDecisionDto
{
    public string? Notes { get; set; }
}
