using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ITSMBackend.Services;
using ITSMBackend.DTOs;
using Asp.Versioning;

namespace ITSMBackend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportingService _reportingService;

        public ReportsController(IReportingService reportingService)
        {
            _reportingService = reportingService;
        }

        [HttpGet("overview")]
        public async Task<ActionResult<AnalyticsOverviewDto>> GetOverview([FromQuery] int days = 30)
        {
            var overview = await _reportingService.GetAnalyticsOverviewAsync(days);
            return Ok(overview);
        }

        [HttpGet("sla-compliance")]
        public async Task<ActionResult<SlaComplianceDto>> GetSlaCompliance([FromQuery] int days = 30)
        {
            var report = await _reportingService.GetSlaComplianceReportAsync(days);
            return Ok(report);
        }

        [HttpGet("trends")]
        public async Task<ActionResult<List<TicketTrendDto>>> GetTrends([FromQuery] int days = 30)
        {
            var trends = await _reportingService.GetTicketVolumeTrendsAsync(days);
            return Ok(trends);
        }

        [HttpGet("technicians")]
        public async Task<ActionResult<List<TechnicianPerformanceDto>>> GetTechnicianPerformance([FromQuery] int days = 30)
        {
            var report = await _reportingService.GetTechnicianPerformanceReportAsync(days);
            return Ok(report);
        }

        [HttpGet("categories")]
        public async Task<ActionResult<List<CategoryDistributionDto>>> GetCategoryDistribution()
        {
            var distribution = await _reportingService.GetCategoryDistributionAsync();
            return Ok(distribution);
        }
    }
}
