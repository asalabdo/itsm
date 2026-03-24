using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ITSMBackend.DTOs;
using ITSMBackend.Services;

namespace ITSMBackend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ServiceRequestsController : ControllerBase
{
    private readonly IServiceRequestService _service;

    public ServiceRequestsController(IServiceRequestService service)
    {
        _service = service;
    }

    [HttpGet("catalog")]
    public async Task<ActionResult<List<ServiceCatalogItemDto>>> GetCatalog()
    {
        var catalog = await _service.GetCatalogAsync();
        return Ok(catalog);
    }

    [HttpGet]
    public async Task<ActionResult<List<ServiceRequestDto>>> GetAll()
    {
        var requests = await _service.GetAllAsync();
        return Ok(requests);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceRequestDto>> GetById(int id)
    {
        var request = await _service.GetByIdAsync(id);
        if (request == null)
            return NotFound();

        return Ok(request);
    }

    [HttpPost]
    public async Task<ActionResult<ServiceRequestDto>> Create([FromBody] CreateServiceRequestDto dto)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        var request = await _service.CreateAsync(dto, userId);
        return CreatedAtAction(nameof(GetById), new { id = request.Id }, request);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ServiceRequestDto>> Update(int id, [FromBody] UpdateServiceRequestDto dto)
    {
        try
        {
            var request = await _service.UpdateAsync(id, dto);
            return Ok(request);
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

    [HttpPost("approve/{approvalId}")]
    public async Task<ActionResult<ServiceRequestDto>> Approve(int approvalId, [FromBody] ServiceRequestApprovalDto decision)
    {
        var result = await _service.ApproveRequestAsync(approvalId, decision.Approve, decision.Comments);
        return Ok(result);
    }

    [HttpGet("queue")]
    public async Task<ActionResult<List<ServiceRequestDto>>> GetQueue()
    {
        var queue = await _service.GetTechnicianQueueAsync();
        return Ok(queue);
    }

    [HttpGet("my")]
    public async Task<ActionResult<List<ServiceRequestDto>>> GetMyRequests()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        var requests = await _service.GetUserRequestsAsync(userId);
        return Ok(requests);
    }
}

public class ServiceRequestApprovalDto
{
    public bool Approve { get; set; }
    public string? Comments { get; set; }
}
