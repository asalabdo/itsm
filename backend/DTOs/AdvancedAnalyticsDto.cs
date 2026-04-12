namespace ITSMBackend.DTOs;

public class HeatmapDataPointDto
{
    public string Label { get; set; } = string.Empty; // Hour or Category
    public List<HeatmapEntryDto> Entries { get; set; } = new();
}

public class HeatmapEntryDto
{
    public string Key { get; set; } = string.Empty;
    public int Value { get; set; }
}

public class PredictiveInsightDto
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Severity { get; set; } = "Info"; // Info, Warning, Critical
    public string? ActionLink { get; set; }
}

public class AdvancedAnalyticsDto
{
    public List<HeatmapDataPointDto> HeatmapData { get; set; } = new();
    public List<PredictiveInsightDto> Insights { get; set; } = new();
    public decimal ProjectedSlaBreachRate { get; set; }
    public int AtRiskSlaCount { get; set; }
}
