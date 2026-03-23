using Microsoft.AspNetCore.Mvc;
using ITSMBackend.DTOs;
using ITSMBackend.Services;

namespace ITSMBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetDashboardSummary()
    {
        var summary = await _dashboardService.GetDashboardSummaryAsync();
        return Ok(summary);
    }

    [HttpGet("metrics/{category}")]
    public async Task<ActionResult<List<PerformanceMetricDto>>> GetPerformanceMetrics(string category)
    {
        var metrics = await _dashboardService.GetPerformanceMetricsAsync(category);
        return Ok(metrics);
    }

    [HttpGet("all-metrics")]
    public async Task<ActionResult<List<DashboardMetricDto>>> GetMetrics()
    {
        var metrics = await _dashboardService.GetMetricsAsync();
        return Ok(metrics);
    }
}
