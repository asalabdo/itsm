namespace ITSMBackend.Models;

public class DataPoint
{
    public int Id { get; set; }
    public string Category { get; set; } = string.Empty; // Incident, SLA, Asset
    public string? SubCategory { get; set; } // e.g., Network, Hardware
    public decimal Value { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? MetadataJson { get; set; } // Extra details for drill-down
}
