using Microsoft.AspNetCore.Mvc;
using ITSMBackend.DTOs;
using ITSMBackend.Services;

namespace ITSMBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkflowsController : ControllerBase
{
    private readonly IWorkflowService _service;

    public WorkflowsController(IWorkflowService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<WorkflowDto>>> GetAll()
    {
        var workflows = await _service.GetAllAsync();
        return Ok(workflows);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<WorkflowDto>> GetById(int id)
    {
        var workflow = await _service.GetByIdAsync(id);
        if (workflow == null)
            return NotFound();

        return Ok(workflow);
    }

    [HttpPost]
    public async Task<ActionResult<WorkflowDto>> Create([FromBody] CreateWorkflowDto dto)
    {
        // TODO: Get userId from authentication context
        int userId = 1; // Placeholder
        var workflow = await _service.CreateAsync(dto, userId);
        return CreatedAtAction(nameof(GetById), new { id = workflow.Id }, workflow);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<WorkflowDto>> Update(int id, [FromBody] UpdateWorkflowDto dto)
    {
        try
        {
            var workflow = await _service.UpdateAsync(id, dto);
            return Ok(workflow);
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

    [HttpPost("{id}/instances")]
    public async Task<ActionResult<WorkflowInstanceDto>> CreateInstance(int id)
    {
        try
        {
            // TODO: Get userId from authentication context
            int userId = 1; // Placeholder
            var instance = await _service.CreateInstanceAsync(id, userId);
            return CreatedAtAction(nameof(GetInstancesByWorkflowId), new { id }, instance);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("{id}/instances")]
    public async Task<ActionResult<List<WorkflowInstanceDto>>> GetInstancesByWorkflowId(int id)
    {
        var instances = await _service.GetInstancesAsync(id);
        return Ok(instances);
    }
}
