using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ITSMBackend.Data;
using ITSMBackend.DTOs;
using ITSMBackend.Models;

namespace ITSMBackend.Services;

public interface IApprovalService
{
    Task<List<ApprovalItemDto>> GetAllApprovalsAsync();
    Task<List<ApprovalItemDto>> GetPendingApprovalsAsync();
    Task<List<ApprovalItemDto>> GetApprovalsForUserAsync(int userId);
    Task<ApprovalItemDto?> GetApprovalByIdAsync(int id);
    Task<ApprovalItemDto> UpdateApprovalAsync(int id, UpdateApprovalItemDto dto);
}

public class ApprovalService : IApprovalService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ApprovalService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ApprovalItemDto>> GetAllApprovalsAsync()
    {
        var items = await _context.ApprovalItems
            .Include(a => a.AssignedTo)
            .Include(a => a.RequestedBy)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<ApprovalItemDto>>(items);
    }

    public async Task<List<ApprovalItemDto>> GetPendingApprovalsAsync()
    {
        var items = await _context.ApprovalItems
            .Where(a => a.Status == "Pending")
            .Include(a => a.AssignedTo)
            .Include(a => a.RequestedBy)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<ApprovalItemDto>>(items);
    }

    public async Task<List<ApprovalItemDto>> GetApprovalsForUserAsync(int userId)
    {
        var items = await _context.ApprovalItems
            .Where(a => a.AssignedToId == userId)
            .Include(a => a.AssignedTo)
            .Include(a => a.RequestedBy)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<ApprovalItemDto>>(items);
    }

    public async Task<ApprovalItemDto?> GetApprovalByIdAsync(int id)
    {
        var item = await _context.ApprovalItems
            .Include(a => a.AssignedTo)
            .Include(a => a.RequestedBy)
            .FirstOrDefaultAsync(a => a.Id == id);

        return item == null ? null : _mapper.Map<ApprovalItemDto>(item);
    }

    public async Task<ApprovalItemDto> UpdateApprovalAsync(int id, UpdateApprovalItemDto dto)
    {
        var item = await _context.ApprovalItems.FindAsync(id);
        if (item == null)
            throw new ArgumentException("Approval item not found");

        _mapper.Map(dto, item);
        item.ResolvedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _context.Entry(item).Reference(a => a.AssignedTo).LoadAsync();
        await _context.Entry(item).Reference(a => a.RequestedBy).LoadAsync();

        return _mapper.Map<ApprovalItemDto>(item);
    }
}
