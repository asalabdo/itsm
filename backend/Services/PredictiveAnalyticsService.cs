using Microsoft.EntityFrameworkCore;
using ITSMBackend.Data;
using ITSMBackend.DTOs;
using ITSMBackend.Models;

namespace ITSMBackend.Services;

public interface IPredictiveAnalyticsService
{
    Task<AdvancedAnalyticsDto> GetAdvancedAnalyticsAsync();
    Task<List<PredictiveInsightDto>> GetPredictiveInsightsAsync();
    Task RecordDataPointAsync(string category, string subCategory, decimal value, string? metadataJson = null);
}

public class PredictiveAnalyticsService : IPredictiveAnalyticsService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<PredictiveAnalyticsService> _logger;

    public PredictiveAnalyticsService(ApplicationDbContext context, ILogger<PredictiveAnalyticsService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<AdvancedAnalyticsDto> GetAdvancedAnalyticsAsync()
    {
        var heatmapData = await GenerateHeatmapDataAsync();
        var insights = await GetPredictiveInsightsAsync();

        var totalActiveTickets = await _context.Tickets.CountAsync(t => t.Status != "Resolved" && t.Status != "Closed");
        var atRiskCount = await _context.Tickets.CountAsync(t =>
            t.SlaDueDate.HasValue && t.SlaStatus == "at_risk" &&
            t.Status != "Resolved" && t.Status != "Closed");

        return new AdvancedAnalyticsDto
        {
            HeatmapData = heatmapData,
            Insights = insights,
            AtRiskSlaCount = atRiskCount,
            ProjectedSlaBreachRate = totalActiveTickets > 0 ? (decimal)atRiskCount / totalActiveTickets * 100 : 0
        };
    }

    public async Task<List<PredictiveInsightDto>> GetPredictiveInsightsAsync()
    {
        var insights = new List<PredictiveInsightDto>();

        var criticalTickets = await _context.Tickets.CountAsync(t => t.Priority == "Critical" && t.Status != "Closed");
        if (criticalTickets > 3)
        {
            insights.Add(new PredictiveInsightDto
            {
                Title = "Critical Volume Warning",
                Message = $"High volume of Critical tickets detected ({criticalTickets}). Potential service-wide impact.",
                Severity = "Critical"
            });
        }

        var networkIncidents = await _context.Tickets.CountAsync(t => t.Category == "Network" && t.CreatedAt > DateTime.UtcNow.AddHours(-24));
        if (networkIncidents > 5)
        {
            insights.Add(new PredictiveInsightDto
            {
                Title = "Recurring Network Patterns",
                Message = $"Spike in Network incidents ({networkIncidents} in last 24h). Suggests a potential router or DNS configuration issue.",
                Severity = "Warning"
            });
        }

        var now = DateTime.UtcNow;
        var thisWeekStart = now.Date.AddDays(-7);
        var previousWeekStart = now.Date.AddDays(-14);

        var thisWeekResolved = await _context.Tickets
            .Where(t => t.Status == "Resolved" && t.ResolvedAt.HasValue && t.CreatedAt >= thisWeekStart)
            .Select(t => new { t.CreatedAt, ResolvedAt = t.ResolvedAt!.Value })
            .ToListAsync();

        var previousWeekResolved = await _context.Tickets
            .Where(t => t.Status == "Resolved" && t.ResolvedAt.HasValue && t.CreatedAt >= previousWeekStart && t.CreatedAt < thisWeekStart)
            .Select(t => new { t.CreatedAt, ResolvedAt = t.ResolvedAt!.Value })
            .ToListAsync();

        var thisWeekMttr = thisWeekResolved.Any()
            ? thisWeekResolved.Average(t => (t.ResolvedAt - t.CreatedAt).TotalHours)
            : 0;
        var previousWeekMttr = previousWeekResolved.Any()
            ? previousWeekResolved.Average(t => (t.ResolvedAt - t.CreatedAt).TotalHours)
            : 0;

        if (thisWeekResolved.Any())
        {
            var mttrDeltaPercent = previousWeekMttr > 0
                ? ((previousWeekMttr - thisWeekMttr) / previousWeekMttr) * 100
                : 0;
            var trendWord = mttrDeltaPercent >= 0 ? "improved" : "declined";
            var absChange = Math.Abs(mttrDeltaPercent);

            insights.Add(new PredictiveInsightDto
            {
                Title = "MTTR Trend",
                Message = previousWeekResolved.Any()
                    ? $"MTTR has {trendWord} by {absChange:F1}% this week compared to the previous week."
                    : $"Current week MTTR is {thisWeekMttr:F1}h based on resolved tickets.",
                Severity = mttrDeltaPercent < 0 ? "Warning" : "Info"
            });
        }

        return insights;
    }

    public async Task RecordDataPointAsync(string category, string subCategory, decimal value, string? metadataJson = null)
    {
        _context.DataPoints.Add(new DataPoint
        {
            Category = category,
            SubCategory = subCategory,
            Value = value,
            Timestamp = DateTime.UtcNow,
            MetadataJson = metadataJson
        });
        await _context.SaveChangesAsync();
    }

    private async Task<List<HeatmapDataPointDto>> GenerateHeatmapDataAsync()
    {
        var utcToday = DateTime.UtcNow.Date;
        var startDate = utcToday.AddDays(-6);
        var endDateExclusive = utcToday.AddDays(1);

        var groupedCounts = await _context.Tickets
            .Where(t => t.CreatedAt >= startDate && t.CreatedAt < endDateExclusive)
            .GroupBy(t => new { Date = t.CreatedAt.Date, Category = t.Category ?? "Uncategorized" })
            .Select(g => new
            {
                g.Key.Date,
                g.Key.Category,
                Count = g.Count()
            })
            .ToListAsync();

        var categories = groupedCounts
            .Select(x => x.Category)
            .Distinct()
            .OrderBy(x => x)
            .ToList();

        if (!categories.Any())
        {
            categories.Add("Uncategorized");
        }

        var countLookup = groupedCounts.ToDictionary(
            x => $"{x.Date:yyyy-MM-dd}|{x.Category}",
            x => x.Count);

        var result = new List<HeatmapDataPointDto>();
        for (var date = startDate; date < endDateExclusive; date = date.AddDays(1))
        {
            var dataPoint = new HeatmapDataPointDto { Label = date.ToString("MMM dd") };
            foreach (var category in categories)
            {
                countLookup.TryGetValue($"{date:yyyy-MM-dd}|{category}", out var count);
                dataPoint.Entries.Add(new HeatmapEntryDto { Key = category, Value = count });
            }
            result.Add(dataPoint);
        }

        return result;
    }
}
