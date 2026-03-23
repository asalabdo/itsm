using Microsoft.AspNetCore.Mvc;
using ITSMBackend.DTOs;
using ITSMBackend.Services;

namespace ITSMBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServiceRequestsController : ControllerBase
{
    private readonly IServiceRequestService _service;

    public ServiceRequestsController(IServiceRequestService service)
    {
        _service = service;
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
        // TODO: Get userId from authentication context
        int userId = 1; // Placeholder
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

    [HttpGet("status/{status}")]
    public async Task<ActionResult<List<ServiceRequestDto>>> GetByStatus(string status)
    {
        var requests = await _service.GetByStatusAsync(status);
        return Ok(requests);
    }
}
