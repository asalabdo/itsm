namespace ITSMBackend.Models;

public class DashboardMetric
{
    public int Id { get; set; }
    public string MetricName { get; set; } = string.Empty;
    public string MetricType { get; set; } = string.Empty; // Ticket, Asset, Service, Performance
    public decimal Value { get; set; } // Metric value
    public decimal? TargetValue { get; set; } // Target value
    public string? Unit { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public DateTime? PreviousTimestamp { get; set; }
}

public class PerformanceMetric
{
    public int Id { get; set; }
    public string MetricName { get; set; } = string.Empty;
    public decimal Value { get; set; } // Metric value
    public decimal? PercentageChange { get; set; } // Percentage change
    public string Trend { get; set; } = "Stable"; // Up, Down, Stable
    public DateTime RecordedDate { get; set; } = DateTime.UtcNow;
    public string Category { get; set; } = string.Empty; // Service, Incident, Request, etc.
}
