namespace ITSMBackend.DTOs;

public class DashboardSummaryDto
{
    public int TotalTickets { get; set; }
    public int OpenTickets { get; set; }
    public int ResolvedTickets { get; set; }
    public decimal AverageResolutionTime { get; set; }
    public int TotalAssets { get; set; }
    public int ActiveAssets { get; set; }
    public int PendingApprovals { get; set; }
    public List<DashboardMetricDto> RecentMetrics { get; set; } = new();
}

public class DashboardMetricDto
{
    public string MetricName { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public decimal? TargetValue { get; set; }
    public string? Unit { get; set; }
    public decimal? PercentageChange { get; set; }
}

public class PerformanceMetricDto
{
    public string MetricName { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public decimal? PercentageChange { get; set; }
    public string Trend { get; set; } = string.Empty;
    public DateTime RecordedDate { get; set; }
    public string Category { get; set; } = string.Empty;
}
