using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ITSMBackend.Data;
using ITSMBackend.DTOs;
using ITSMBackend.Models;

namespace ITSMBackend.Services;

public interface IUserService
{
    Task<List<UserDto>> GetAllUsersAsync();
    Task<UserDto?> GetUserByIdAsync(int id);
    Task<UserDto?> GetUserByUsernameAsync(string username);
    Task<UserDto> CreateUserAsync(CreateUserDto dto);
    Task<UserDto> UpdateUserAsync(int id, UpdateUserDto dto);
    Task<List<UserDto>> GetUsersByRoleAsync(string role);
}

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UserService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<UserDto>> GetAllUsersAsync()
    {
        var users = await _context.Users
            .Where(u => u.IsActive)
            .OrderBy(u => u.FirstName)
            .ToListAsync();

        return _mapper.Map<List<UserDto>>(users);
    }

    public async Task<UserDto?> GetUserByIdAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        return user == null ? null : _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto?> GetUserByUsernameAsync(string username)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        return user == null ? null : _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto dto)
    {
        var user = _mapper.Map<User>(dto);
        user.CreatedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;
        user.IsActive = true;

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> UpdateUserAsync(int id, UpdateUserDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            throw new ArgumentException("User not found");

        _mapper.Map(dto, user);
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<UserDto>(user);
    }

    public async Task<List<UserDto>> GetUsersByRoleAsync(string role)
    {
        var users = await _context.Users
            .Where(u => u.Role == role && u.IsActive)
            .OrderBy(u => u.FirstName)
            .ToListAsync();

        return _mapper.Map<List<UserDto>>(users);
    }
}
