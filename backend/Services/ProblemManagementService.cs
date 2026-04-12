using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ITSMBackend.Data;
using ITSMBackend.DTOs;
using ITSMBackend.Models;

namespace ITSMBackend.Services;

public interface IProblemManagementService
{
    Task<List<ProblemRecordDto>> GetAllAsync();
    Task<ProblemRecordDto?> GetByIdAsync(int id);
    Task<ProblemRecordDto> CreateAsync(CreateProblemRecordDto dto, int userId);
    Task<ProblemRecordDto> UpdateAsync(int id, UpdateProblemRecordDto dto);
    Task<ProblemRecordDto> LinkTicketAsync(int problemId, int ticketId);
    Task<ProblemRecordDto> CreateFromTicketsAsync(IEnumerable<int> ticketIds, string title, string description, int userId, string priority, string category);
}

public class ProblemManagementService : IProblemManagementService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ProblemManagementService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ProblemRecordDto>> GetAllAsync()
    {
        var problems = await _context.ProblemRecords
            .Include(p => p.LinkedTickets)
                .ThenInclude(l => l.Ticket)
                    .ThenInclude(t => t.AssignedTo)
            .Include(p => p.LinkedTickets)
                .ThenInclude(l => l.Ticket)
                    .ThenInclude(t => t.RequestedBy)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return problems.Select(MapProblem).ToList();
    }

    public async Task<ProblemRecordDto?> GetByIdAsync(int id)
    {
        var problem = await _context.ProblemRecords
            .Include(p => p.LinkedTickets)
                .ThenInclude(l => l.Ticket)
                    .ThenInclude(t => t.AssignedTo)
            .Include(p => p.LinkedTickets)
                .ThenInclude(l => l.Ticket)
                    .ThenInclude(t => t.RequestedBy)
            .FirstOrDefaultAsync(p => p.Id == id);

        return problem == null ? null : MapProblem(problem);
    }

    public async Task<ProblemRecordDto> CreateAsync(CreateProblemRecordDto dto, int userId)
    {
        var problem = _mapper.Map<ProblemRecord>(dto);
        problem.ProblemNumber = GenerateProblemNumber();
        problem.CreatedById = userId > 0 ? userId : 1;
        problem.CreatedAt = DateTime.UtcNow;
        problem.UpdatedAt = DateTime.UtcNow;

        _context.ProblemRecords.Add(problem);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(problem.Id))!;
    }

    public async Task<ProblemRecordDto> UpdateAsync(int id, UpdateProblemRecordDto dto)
    {
        var problem = await _context.ProblemRecords.FindAsync(id)
            ?? throw new ArgumentException("Problem record not found");

        if (dto.Title != null) problem.Title = dto.Title;
        if (dto.Description != null) problem.Description = dto.Description;
        if (dto.RootCause != null) problem.RootCause = dto.RootCause;
        if (dto.Workaround != null) problem.Workaround = dto.Workaround;
        if (dto.Status != null) problem.Status = dto.Status;
        if (dto.Priority != null) problem.Priority = dto.Priority;
        if (dto.Category != null) problem.Category = dto.Category;
        if (string.Equals(dto.Status, "Resolved", StringComparison.OrdinalIgnoreCase))
        {
            problem.ResolvedAt = DateTime.UtcNow;
        }

        problem.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(problem.Id))!;
    }

    public async Task<ProblemRecordDto> LinkTicketAsync(int problemId, int ticketId)
    {
        var existingLink = await _context.ProblemTicketLinks.FirstOrDefaultAsync(l => l.ProblemRecordId == problemId && l.TicketId == ticketId);
        if (existingLink == null)
        {
            var link = new ProblemTicketLink
            {
                ProblemRecordId = problemId,
                TicketId = ticketId,
                CreatedAt = DateTime.UtcNow
            };
            _context.ProblemTicketLinks.Add(link);
            await _context.SaveChangesAsync();
        }

        return (await GetByIdAsync(problemId))!;
    }

    public async Task<ProblemRecordDto> CreateFromTicketsAsync(IEnumerable<int> ticketIds, string title, string description, int userId, string priority, string category)
    {
        var distinctTicketIds = ticketIds.Distinct().ToList();
        var problem = await CreateAsync(new CreateProblemRecordDto
        {
            Title = title,
            Description = description,
            RootCause = string.Empty,
            Workaround = string.Empty,
            Priority = priority,
            Category = category
        }, userId);

        foreach (var ticketId in distinctTicketIds)
        {
            await LinkTicketAsync(problem.Id, ticketId);
        }

        return (await GetByIdAsync(problem.Id))!;
    }

    private ProblemRecordDto MapProblem(ProblemRecord problem)
    {
        var dto = _mapper.Map<ProblemRecordDto>(problem);
        dto.LinkedTickets = problem.LinkedTickets
            .Where(link => link.Ticket != null)
            .Select(link => _mapper.Map<TicketDto>(link.Ticket))
            .ToList();
        return dto;
    }

    private static string GenerateProblemNumber()
    {
        return $"PRB-{DateTime.UtcNow:yyyy}-{DateTime.UtcNow.Ticks % 100000:D5}";
    }
}
