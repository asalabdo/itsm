using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ITSMBackend.DTOs;
using ITSMBackend.Services;

namespace ITSMBackend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProblemsController : ControllerBase
{
    private readonly IProblemManagementService _service;

    public ProblemsController(IProblemManagementService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProblemRecordDto>>> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProblemRecordDto>> GetById(int id)
    {
        var problem = await _service.GetByIdAsync(id);
        return problem == null ? NotFound() : Ok(problem);
    }

    [HttpPost]
    public async Task<ActionResult<ProblemRecordDto>> Create([FromBody] CreateProblemRecordDto dto)
    {
        var problem = await _service.CreateAsync(dto, GetCurrentUserId());
        return CreatedAtAction(nameof(GetById), new { id = problem.Id }, problem);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProblemRecordDto>> Update(int id, [FromBody] UpdateProblemRecordDto dto)
    {
        try
        {
            return Ok(await _service.UpdateAsync(id, dto));
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost("{id:int}/link-ticket")]
    public async Task<ActionResult<ProblemRecordDto>> LinkTicket(int id, [FromBody] LinkProblemTicketDto dto)
    {
        try
        {
            return Ok(await _service.LinkTicketAsync(id, dto.TicketId));
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claim, out var userId) ? userId : 1;
    }
}
