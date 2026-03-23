using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ITSMBackend.Data;
using ITSMBackend.DTOs;
using ITSMBackend.Models;

namespace ITSMBackend.Services;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetDashboardSummaryAsync();
    Task<List<PerformanceMetricDto>> GetPerformanceMetricsAsync(string category);
    Task<List<DashboardMetricDto>> GetMetricsAsync();
}

public class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public DashboardService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync()
    {
        var totalTickets = await _context.Tickets.CountAsync();
        var openTickets = await _context.Tickets.CountAsync(t => t.Status == "Open");
        var resolvedTickets = await _context.Tickets.CountAsync(t => t.Status == "Resolved");
        var totalAssets = await _context.Assets.CountAsync();
        var activeAssets = await _context.Assets.CountAsync(a => a.Status == "Active");
        var pendingApprovals = await _context.ApprovalItems.CountAsync(a => a.Status == "Pending");

        var resolvedTicketsList = await _context.Tickets
            .Where(t => t.Status == "Resolved" && t.ResolvedAt.HasValue && t.CreatedAt != DateTime.MinValue)
            .ToListAsync();

        var avgResolutionTime = resolvedTicketsList.Count > 0
            ? resolvedTicketsList
                .Where(t => t.ResolvedAt.HasValue)
                .Average(t => (t.ResolvedAt!.Value - t.CreatedAt).TotalHours)
            : 0;

        var recentMetrics = await _context.DashboardMetrics
            .OrderByDescending(m => m.Timestamp)
            .Take(5)
            .ToListAsync();

        return new DashboardSummaryDto
        {
            TotalTickets = totalTickets,
            OpenTickets = openTickets,
            ResolvedTickets = resolvedTickets,
            AverageResolutionTime = (decimal)avgResolutionTime,
            TotalAssets = totalAssets,
            ActiveAssets = activeAssets,
            PendingApprovals = pendingApprovals,
            RecentMetrics = _mapper.Map<List<DashboardMetricDto>>(recentMetrics)
        };
    }

    public async Task<List<PerformanceMetricDto>> GetPerformanceMetricsAsync(string category)
    {
        var metrics = await _context.PerformanceMetrics
            .Where(m => m.Category == category)
            .OrderByDescending(m => m.RecordedDate)
            .Take(10)
            .ToListAsync();

        return _mapper.Map<List<PerformanceMetricDto>>(metrics);
    }

    public async Task<List<DashboardMetricDto>> GetMetricsAsync()
    {
        var metrics = await _context.DashboardMetrics
            .OrderByDescending(m => m.Timestamp)
            .Take(20)
            .ToListAsync();

        return _mapper.Map<List<DashboardMetricDto>>(metrics);
    }
}
