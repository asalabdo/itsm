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
}
