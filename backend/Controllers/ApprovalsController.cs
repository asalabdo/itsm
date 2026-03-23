using Microsoft.AspNetCore.Mvc;
using ITSMBackend.DTOs;
using ITSMBackend.Services;

namespace ITSMBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApprovalsController : ControllerBase
{
    private readonly IApprovalService _approvalService;

    public ApprovalsController(IApprovalService approvalService)
    {
        _approvalService = approvalService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ApprovalItemDto>>> GetAllApprovals()
    {
        var items = await _approvalService.GetAllApprovalsAsync();
        return Ok(items);
    }

    [HttpGet("pending")]
    public async Task<ActionResult<List<ApprovalItemDto>>> GetPendingApprovals()
    {
        var items = await _approvalService.GetPendingApprovalsAsync();
        return Ok(items);
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<List<ApprovalItemDto>>> GetApprovalsForUser(int userId)
    {
        var items = await _approvalService.GetApprovalsForUserAsync(userId);
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApprovalItemDto>> GetApprovalById(int id)
    {
        var item = await _approvalService.GetApprovalByIdAsync(id);
        if (item == null)
            return NotFound();

        return Ok(item);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApprovalItemDto>> UpdateApproval(int id, [FromBody] UpdateApprovalItemDto dto)
    {
        try
        {
            var item = await _approvalService.UpdateApprovalAsync(id, dto);
            return Ok(item);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }
}
