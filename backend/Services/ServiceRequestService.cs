using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ITSMBackend.Data;
using ITSMBackend.DTOs;
using ITSMBackend.Models;

namespace ITSMBackend.Services;

public interface IServiceRequestService
{
    Task<List<ServiceRequestDto>> GetAllAsync();
    Task<ServiceRequestDto?> GetByIdAsync(int id);
    Task<ServiceRequestDto> CreateAsync(CreateServiceRequestDto dto, int userId);
    Task<ServiceRequestDto> UpdateAsync(int id, UpdateServiceRequestDto dto);
    Task DeleteAsync(int id);
    Task<List<ServiceRequestDto>> GetByStatusAsync(string status);
}

public class ServiceRequestService : IServiceRequestService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ServiceRequestService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ServiceRequestDto>> GetAllAsync()
    {
        var requests = await _context.ServiceRequests
            .Include(sr => sr.RequestedBy)
            .Include(sr => sr.AssignedTo)
            .OrderByDescending(sr => sr.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<ServiceRequestDto>>(requests);
    }

    public async Task<ServiceRequestDto?> GetByIdAsync(int id)
    {
        var request = await _context.ServiceRequests
            .Include(sr => sr.RequestedBy)
            .Include(sr => sr.AssignedTo)
            .FirstOrDefaultAsync(sr => sr.Id == id);

        return request == null ? null : _mapper.Map<ServiceRequestDto>(request);
    }

    public async Task<ServiceRequestDto> CreateAsync(CreateServiceRequestDto dto, int userId)
    {
        var request = _mapper.Map<ServiceRequest>(dto);
        request.RequestNumber = $"REQ-{DateTime.UtcNow.Ticks}";
        request.RequestedById = userId;
        request.Status = "Open";
        request.CreatedAt = DateTime.UtcNow;
        request.UpdatedAt = DateTime.UtcNow;

        _context.ServiceRequests.Add(request);
        await _context.SaveChangesAsync();

        await _context.Entry(request).Reference(sr => sr.RequestedBy).LoadAsync();
        await _context.Entry(request).Reference(sr => sr.AssignedTo).LoadAsync();

        return _mapper.Map<ServiceRequestDto>(request);
    }

    public async Task<ServiceRequestDto> UpdateAsync(int id, UpdateServiceRequestDto dto)
    {
        var request = await _context.ServiceRequests.FindAsync(id);
        if (request == null)
            throw new ArgumentException("Service request not found");

        _mapper.Map(dto, request);
        request.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _context.Entry(request).Reference(sr => sr.RequestedBy).LoadAsync();
        await _context.Entry(request).Reference(sr => sr.AssignedTo).LoadAsync();

        return _mapper.Map<ServiceRequestDto>(request);
    }

    public async Task DeleteAsync(int id)
    {
        var request = await _context.ServiceRequests.FindAsync(id);
        if (request == null)
            throw new ArgumentException("Service request not found");

        _context.ServiceRequests.Remove(request);
        await _context.SaveChangesAsync();
    }

    public async Task<List<ServiceRequestDto>> GetByStatusAsync(string status)
    {
        var requests = await _context.ServiceRequests
            .Where(sr => sr.Status == status)
            .Include(sr => sr.RequestedBy)
            .Include(sr => sr.AssignedTo)
            .OrderByDescending(sr => sr.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<ServiceRequestDto>>(requests);
    }
}
