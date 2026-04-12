using System;
using System.Collections.Generic;

namespace ITSMBackend.DTOs
{
    public class SlaComplianceDto
    {
        public decimal CompliancePercentage { get; set; }
        public int TotalTickets { get; set; }
        public int ResolvedWithinSla { get; set; }
        public int BreachedSla { get; set; }
    }

    public class TicketTrendDto
    {
        public string Date { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class TechnicianPerformanceDto
    {
        public int TechnicianId { get; set; }
        public string TechnicianName { get; set; } = string.Empty;
        public int ResolvedCount { get; set; }
        public decimal AvgResolutionTimeHours { get; set; }
        public decimal SlaComplianceRate { get; set; }
    }

    public class CategoryDistributionDto
    {
        public string Category { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Percentage { get; set; }
    }

    public class PriorityDistributionDto
    {
        public string Priority { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class AnalyticsOverviewDto
    {
        public SlaComplianceDto SlaCompliance { get; set; } = new();
        public List<TicketTrendDto> VolumeTrends { get; set; } = new();
        public List<CategoryDistributionDto> CategoryBreakdown { get; set; } = new();
        public List<PriorityDistributionDto> PriorityBreakdown { get; set; } = new();
        public List<TechnicianPerformanceDto> TopPerformers { get; set; } = new();
    }
}
