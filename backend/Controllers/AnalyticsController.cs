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
public class AnalyticsController : ControllerBase
{
    private readonly IPredictiveAnalyticsService _analytics;

    public AnalyticsController(IPredictiveAnalyticsService analytics)
    {
        _analytics = analytics;
    }

    [HttpGet("advanced-hub")]
    public async Task<ActionResult<AdvancedAnalyticsDto>> GetAdvancedHub()
    {
        var data = await _analytics.GetAdvancedAnalyticsAsync();
        return Ok(data);
    }

    [HttpGet("insights")]
    public async Task<ActionResult<List<PredictiveInsightDto>>> GetInsights()
    {
        var insights = await _analytics.GetPredictiveInsightsAsync();
        return Ok(insights);
    }
}
