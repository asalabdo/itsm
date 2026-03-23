using Microsoft.AspNetCore.Mvc;
using ITSMBackend.DTOs;
using ITSMBackend.Services;

namespace ITSMBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChangeRequestsController : ControllerBase
{
    private readonly IChangeRequestService _service;

    public ChangeRequestsController(IChangeRequestService service)
    {
        _service = service;
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
        // TODO: Get userId from authentication context
        int userId = 1; // Placeholder
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
}
