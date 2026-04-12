using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ITSMBackend.Data;
using ITSMBackend.DTOs;
using ITSMBackend.Models;

namespace ITSMBackend.Services
{
    public interface IReportingService
    {
        Task<AnalyticsOverviewDto> GetAnalyticsOverviewAsync(int days);
        Task<SlaComplianceDto> GetSlaComplianceReportAsync(int days);
        Task<List<TicketTrendDto>> GetTicketVolumeTrendsAsync(int days);
        Task<List<TechnicianPerformanceDto>> GetTechnicianPerformanceReportAsync(int days);
        Task<List<CategoryDistributionDto>> GetCategoryDistributionAsync();
    }

    public class ReportingService : IReportingService
    {
        private readonly ApplicationDbContext _context;

        public ReportingService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<AnalyticsOverviewDto> GetAnalyticsOverviewAsync(int days)
        {
            var startDate = DateTime.UtcNow.AddDays(-days);

            return new AnalyticsOverviewDto
            {
                SlaCompliance = await GetSlaComplianceReportAsync(days),
                VolumeTrends = await GetTicketVolumeTrendsAsync(days),
                CategoryBreakdown = await GetCategoryDistributionAsync(),
                PriorityBreakdown = await GetPriorityDistributionAsync(),
                TopPerformers = await GetTechnicianPerformanceReportAsync(days)
            };
        }

        public async Task<SlaComplianceDto> GetSlaComplianceReportAsync(int days)
        {
            var startDate = DateTime.UtcNow.AddDays(-days);
            var tickets = await _context.Tickets
                .Where(t => t.CreatedAt >= startDate && t.Status == "Resolved")
                .ToListAsync();

            if (!tickets.Any()) return new SlaComplianceDto();

            int total = tickets.Count;
            int withinSla = tickets.Count(t => t.ResolvedAt <= t.SlaDueDate || t.SlaStatus != "breached");
            
            return new SlaComplianceDto
            {
                TotalTickets = total,
                ResolvedWithinSla = withinSla,
                BreachedSla = total - withinSla,
                CompliancePercentage = total > 0 ? (decimal)withinSla / total * 100 : 0
            };
        }

        public async Task<List<TicketTrendDto>> GetTicketVolumeTrendsAsync(int days)
        {
            var startDate = DateTime.UtcNow.AddDays(-days);
            var grouped = await _context.Tickets
                .Where(t => t.CreatedAt >= startDate)
                .GroupBy(t => t.CreatedAt.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .OrderBy(d => d.Date)
                .ToListAsync();

            return grouped
                .Select(d => new TicketTrendDto
                {
                    Date = d.Date.ToString("yyyy-MM-dd"),
                    Count = d.Count
                })
                .ToList();
        }

        public async Task<List<CategoryDistributionDto>> GetCategoryDistributionAsync()
        {
            var total = await _context.Tickets.CountAsync();
            if (total == 0) return new List<CategoryDistributionDto>();

            var data = await _context.Tickets
                .GroupBy(t => t.Category)
                .Select(g => new CategoryDistributionDto
                {
                    Category = string.IsNullOrEmpty(g.Key) ? "Uncategorized" : g.Key,
                    Count = g.Count(),
                    Percentage = (decimal)g.Count() / total * 100
                })
                .OrderByDescending(c => c.Count)
                .ToListAsync();

            return data;
        }

        private async Task<List<PriorityDistributionDto>> GetPriorityDistributionAsync()
        {
            return await _context.Tickets
                .GroupBy(t => t.Priority)
                .Select(g => new PriorityDistributionDto
                {
                    Priority = g.Key,
                    Count = g.Count()
                })
                .OrderBy(p => p.Priority)
                .ToListAsync();
        }

        public async Task<List<TechnicianPerformanceDto>> GetTechnicianPerformanceReportAsync(int days)
        {
            var startDate = DateTime.UtcNow.AddDays(-days);
            
            var performance = await _context.Tickets
                .Where(t => t.CreatedAt >= startDate && t.AssignedToId.HasValue && t.Status == "Resolved")
                .GroupBy(t => new { t.AssignedToId, Name = t.AssignedTo!.Username })
                .Select(g => new TechnicianPerformanceDto
                {
                    TechnicianId = g.Key.AssignedToId!.Value,
                    TechnicianName = g.Key.Name,
                    ResolvedCount = g.Count(),
                    AvgResolutionTimeHours = (decimal)g.Average(t => (t.ResolvedAt!.Value - t.CreatedAt).TotalHours),
                    SlaComplianceRate = (decimal)g.Count(t => t.ResolvedAt <= t.SlaDueDate) / g.Count() * 100
                })
                .OrderByDescending(p => p.ResolvedCount)
                .Take(10)
                .ToListAsync();

            return performance;
        }
    }
}
