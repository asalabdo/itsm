using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ITSMBackend.Data;
using ITSMBackend.DTOs;
using ITSMBackend.Models;

namespace ITSMBackend.Services;

public interface IChangeRequestService
{
    Task<List<ChangeRequestDto>> GetAllAsync();
    Task<ChangeRequestDto?> GetByIdAsync(int id);
    Task<ChangeRequestDto> CreateAsync(CreateChangeRequestDto dto, int userId);
    Task<ChangeRequestDto> UpdateAsync(int id, UpdateChangeRequestDto dto);
    Task DeleteAsync(int id);
    Task<List<ChangeRequestDto>> GetByStatusAsync(string status);
    Task<ChangeRequestDto> SubmitForApprovalAsync(int id);
    Task<ChangeRequestDto> ApproveChangeAsync(int id, int approverId, string notes);
    Task<ChangeRequestDto> RejectChangeAsync(int id, int approverId, string notes);
}

public class ChangeRequestService : IChangeRequestService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ChangeRequestService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ChangeRequestDto>> GetAllAsync()
    {
        var changes = await _context.ChangeRequests
            .Include(c => c.RequestedBy)
            .Include(c => c.ApprovedBy)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<ChangeRequestDto>>(changes);
    }

    public async Task<ChangeRequestDto?> GetByIdAsync(int id)
    {
        var change = await _context.ChangeRequests
            .Include(c => c.RequestedBy)
            .Include(c => c.ApprovedBy)
            .FirstOrDefaultAsync(c => c.Id == id);

        return change == null ? null : _mapper.Map<ChangeRequestDto>(change);
    }

    public async Task<ChangeRequestDto> CreateAsync(CreateChangeRequestDto dto, int userId)
    {
        var change = _mapper.Map<ChangeRequest>(dto);
        change.ChangeNumber = $"CHG-{DateTime.UtcNow.Ticks}";
        change.RequestedById = userId;
        change.Status = "Proposed";
        change.CreatedAt = DateTime.UtcNow;
        change.UpdatedAt = DateTime.UtcNow;

        _context.ChangeRequests.Add(change);
        await _context.SaveChangesAsync();

        await _context.Entry(change).Reference(c => c.RequestedBy).LoadAsync();
        await _context.Entry(change).Reference(c => c.ApprovedBy).LoadAsync();

        return _mapper.Map<ChangeRequestDto>(change);
    }

    public async Task<ChangeRequestDto> UpdateAsync(int id, UpdateChangeRequestDto dto)
    {
        var change = await _context.ChangeRequests.FindAsync(id);
        if (change == null)
            throw new ArgumentException("Change request not found");

        _mapper.Map(dto, change);
        change.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _context.Entry(change).Reference(c => c.RequestedBy).LoadAsync();
        await _context.Entry(change).Reference(c => c.ApprovedBy).LoadAsync();

        return _mapper.Map<ChangeRequestDto>(change);
    }

    public async Task DeleteAsync(int id)
    {
        var change = await _context.ChangeRequests.FindAsync(id);
        if (change == null)
            throw new ArgumentException("Change request not found");

        _context.ChangeRequests.Remove(change);
        await _context.SaveChangesAsync();
    }

    public async Task<List<ChangeRequestDto>> GetByStatusAsync(string status)
    {
        var changes = await _context.ChangeRequests
            .Where(c => c.Status == status)
            .Include(c => c.RequestedBy)
            .Include(c => c.ApprovedBy)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<ChangeRequestDto>>(changes);
    }

    public async Task<ChangeRequestDto> SubmitForApprovalAsync(int id)
    {
        var change = await _context.ChangeRequests.FindAsync(id);
        if (change == null) throw new ArgumentException("Change request not found");

        change.Status = "Pending Approval";
        change.UpdatedAt = DateTime.UtcNow;

        // Create approval item
        var approval = new ApprovalItem
        {
            ItemType = "Change",
            ReferenceId = change.Id,
            Title = $"Approval Required: {change.ChangeNumber}",
            Description = $"Please review and approve the change request: {change.Title}",
            Status = "Pending",
            RequestedById = change.RequestedById,
            Priority = change.Priority == "Critical" ? 1 : (change.Priority == "High" ? 1 : 2),
            CreatedAt = DateTime.UtcNow
        };

        _context.ApprovalItems.Add(approval);
        await _context.SaveChangesAsync();

        return _mapper.Map<ChangeRequestDto>(change);
    }

    public async Task<ChangeRequestDto> ApproveChangeAsync(int id, int approverId, string notes)
    {
        var change = await _context.ChangeRequests.FindAsync(id);
        if (change == null) throw new ArgumentException("Change request not found");

        change.Status = "Approved";
        change.ApprovedById = approverId;
        change.UpdatedAt = DateTime.UtcNow;

        // Update linked approval item
        var approval = await _context.ApprovalItems
            .FirstOrDefaultAsync(a => a.ItemType == "Change" && a.ReferenceId == id && a.Status == "Pending");
        
        if (approval != null)
        {
            approval.Status = "Approved";
            approval.ResolvedAt = DateTime.UtcNow;
            approval.ApprovalNotes = notes;
            approval.AssignedToId = approverId;
        }

        await _context.SaveChangesAsync();
        return _mapper.Map<ChangeRequestDto>(change);
    }

    public async Task<ChangeRequestDto> RejectChangeAsync(int id, int approverId, string notes)
    {
        var change = await _context.ChangeRequests.FindAsync(id);
        if (change == null) throw new ArgumentException("Change request not found");

        change.Status = "Rejected";
        change.UpdatedAt = DateTime.UtcNow;

        // Update linked approval item
        var approval = await _context.ApprovalItems
            .FirstOrDefaultAsync(a => a.ItemType == "Change" && a.ReferenceId == id && a.Status == "Pending");
        
        if (approval != null)
        {
            approval.Status = "Rejected";
            approval.ResolvedAt = DateTime.UtcNow;
            approval.ApprovalNotes = notes;
            approval.AssignedToId = approverId;
        }

        await _context.SaveChangesAsync();
        return _mapper.Map<ChangeRequestDto>(change);
    }
}
