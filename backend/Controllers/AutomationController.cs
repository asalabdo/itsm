using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Asp.Versioning;
using System.Collections.Generic;
using System.Threading.Tasks;
using ITSMBackend.DTOs;
using ITSMBackend.Services;

namespace ITSMBackend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AutomationController : ControllerBase
{
    private readonly IWorkflowEngineService _engine;

    public AutomationController(IWorkflowEngineService engine)
    {
        _engine = engine;
    }

    [HttpGet("rules")]
    public async Task<ActionResult<List<AutomationRuleDto>>> GetRules()
    {
        var rules = await _engine.GetRulesAsync();
        return Ok(rules);
    }

    [HttpPost("rules")]
    public async Task<ActionResult<AutomationRuleDto>> CreateRule([FromBody] CreateAutomationRuleDto dto)
    {
        var rule = await _engine.CreateRuleAsync(dto);
        return Ok(rule);
    }

    [HttpGet("logs")]
    public async Task<ActionResult<List<AutomationExecutionLogDto>>> GetLogs([FromQuery] int limit = 50)
    {
        var logs = await _engine.GetExecutionLogsAsync(limit);
        return Ok(logs);
    }
}
