using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ITSMBackend.Data;
using ITSMBackend.DTOs;
using ITSMBackend.Models;

namespace ITSMBackend.Services;

public interface ITicketService
{
    Task<List<TicketDto>> GetAllTicketsAsync();
    Task<TicketDetailDto?> GetTicketByIdAsync(int id);
    Task<TicketDto> CreateTicketAsync(CreateTicketDto dto, int requestedById);
    Task<TicketDto> UpdateTicketAsync(int id, UpdateTicketDto dto);
    Task DeleteTicketAsync(int id);
    Task<List<TicketDto>> GetTicketsByStatusAsync(string status);
    Task<List<TicketDto>> GetTicketsByAssigneeAsync(int userId);
    Task AddCommentAsync(int ticketId, int userId, string comment);
    Task<int> GetOpenTicketsCountAsync();
}

public class TicketService : ITicketService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public TicketService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<TicketDto>> GetAllTicketsAsync()
    {
        var tickets = await _context.Tickets
            .Include(t => t.AssignedTo)
            .Include(t => t.RequestedBy)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<TicketDto>>(tickets);
    }

    public async Task<TicketDetailDto?> GetTicketByIdAsync(int id)
    {
        var ticket = await _context.Tickets
            .Include(t => t.AssignedTo)
            .Include(t => t.RequestedBy)
            .Include(t => t.Comments).ThenInclude(c => c.User)
            .Include(t => t.Activities).ThenInclude(a => a.User)
            .FirstOrDefaultAsync(t => t.Id == id);

        return ticket == null ? null : _mapper.Map<TicketDetailDto>(ticket);
    }

    public async Task<TicketDto> CreateTicketAsync(CreateTicketDto dto, int requestedById)
    {
        if (requestedById <= 0)
        {
            var defaultUser = await _context.Users.FirstOrDefaultAsync();
            requestedById = defaultUser?.Id ?? 1;
        }

        var ticket = _mapper.Map<Ticket>(dto);
        ticket.RequestedById = requestedById;
        ticket.TicketNumber = $"TKT-{DateTime.UtcNow.Ticks}";
        ticket.Status = "Open";
        ticket.CreatedAt = DateTime.UtcNow;
        ticket.UpdatedAt = DateTime.UtcNow;

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        return _mapper.Map<TicketDto>(ticket);
    }

    public async Task<TicketDto> UpdateTicketAsync(int id, UpdateTicketDto dto)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null)
            throw new ArgumentException("Ticket not found");

        _mapper.Map(dto, ticket);
        ticket.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _context.Entry(ticket).Reference(t => t.AssignedTo).LoadAsync();
        await _context.Entry(ticket).Reference(t => t.RequestedBy).LoadAsync();

        return _mapper.Map<TicketDto>(ticket);
    }

    public async Task DeleteTicketAsync(int id)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null)
            throw new ArgumentException("Ticket not found");

        _context.Tickets.Remove(ticket);
        await _context.SaveChangesAsync();
    }

    public async Task<List<TicketDto>> GetTicketsByStatusAsync(string status)
    {
        var tickets = await _context.Tickets
            .Where(t => t.Status == status)
            .Include(t => t.AssignedTo)
            .Include(t => t.RequestedBy)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<TicketDto>>(tickets);
    }

    public async Task<List<TicketDto>> GetTicketsByAssigneeAsync(int userId)
    {
        var tickets = await _context.Tickets
            .Where(t => t.AssignedToId == userId)
            .Include(t => t.AssignedTo)
            .Include(t => t.RequestedBy)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<TicketDto>>(tickets);
    }

    public async Task AddCommentAsync(int ticketId, int userId, string comment)
    {
        var ticketComment = new TicketComment
        {
            TicketId = ticketId,
            UserId = userId,
            Comment = comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.TicketComments.Add(ticketComment);

        var ticket = await _context.Tickets.FindAsync(ticketId);
        if (ticket != null)
        {
            ticket.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }

    public async Task<int> GetOpenTicketsCountAsync()
    {
        return await _context.Tickets
            .Where(t => t.Status == "Open")
            .CountAsync();
    }
}
