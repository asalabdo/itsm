using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ITSMBackend.Data;
using ITSMBackend.DTOs;
using ITSMBackend.Models;

namespace ITSMBackend.Services;

public interface IUserService
{
    Task<LoginResponseDto?> AuthenticateAsync(string username, string password);
    Task<List<UserDto>> GetAllUsersAsync();
    Task<UserDto?> GetUserByIdAsync(int id);
    Task<UserDto?> GetUserByUsernameAsync(string username);
    Task<UserDto> CreateUserAsync(CreateUserDto dto);
    Task<UserDto> UpdateUserAsync(int id, UpdateUserDto dto);
    Task<List<UserDto>> GetUsersByRoleAsync(string role);
    Task<int> EnsureUserExistsAsync(int externalId, string source = "ERP");
    Task<int> EnsureUserExistsAsync(UserDto user, string source = "ERP");
}

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IConfiguration _configuration;
    private readonly IErpIntegrationService _erpService;

    public UserService(ApplicationDbContext context, IMapper mapper, IConfiguration configuration, IErpIntegrationService erpService)
    {
        _context = context;
        _mapper = mapper;
        _configuration = configuration;
        _erpService = erpService;
    }

    public async Task<LoginResponseDto?> AuthenticateAsync(string username, string password)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username && u.IsActive);
        if (user == null || !IsPasswordValid(password, user.PasswordHash))
            return null;

        var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        var key = System.Text.Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "your-super-secret-key-here-make-it-long-and-secure");
        var expires = DateTime.UtcNow.AddDays(7);
        
        var tokenDescriptor = new Microsoft.IdentityModel.Tokens.SecurityTokenDescriptor
        {
            Subject = new System.Security.Claims.ClaimsIdentity(new[]
            {
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, user.Id.ToString()),
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, user.Role.ToString()),
                new System.Security.Claims.Claim("Username", user.Username)
            }),
            Expires = expires,
            SigningCredentials = new Microsoft.IdentityModel.Tokens.SigningCredentials(
                new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key), 
                Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256Signature),
            Issuer = _configuration["Jwt:Issuer"] ?? "ITSMSystem",
            Audience = _configuration["Jwt:Audience"] ?? "ITSMUsers"
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return new LoginResponseDto
        {
            User = _mapper.Map<UserDto>(user),
            Token = tokenHandler.WriteToken(token),
            ExpiresAt = expires
        };
    }

    private static bool IsPasswordValid(string password, string? passwordHash)
    {
        if (string.IsNullOrWhiteSpace(passwordHash))
            return false;

        try
        {
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }
        catch
        {
            return false;
        }
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
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
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

        if (dto.FirstName != null)
            user.FirstName = dto.FirstName;

        if (dto.LastName != null)
            user.LastName = dto.LastName;

        if (dto.Email != null)
            user.Email = dto.Email;

        if (dto.Department != null)
            user.Department = dto.Department;

        if (dto.JobTitle != null)
            user.JobTitle = dto.JobTitle;

        if (dto.PhoneNumber != null)
            user.PhoneNumber = dto.PhoneNumber;

        if (!string.IsNullOrWhiteSpace(dto.Role) && Enum.TryParse<UserRole>(dto.Role, true, out var parsedRole))
            user.Role = parsedRole;

        if (dto.IsActive.HasValue)
            user.IsActive = dto.IsActive.Value;

        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<UserDto>(user);
    }

    public async Task<List<UserDto>> GetUsersByRoleAsync(string role)
    {
        if (!Enum.TryParse<UserRole>(role, out var userRole))
            return new List<UserDto>();

        var users = await _context.Users
            .Where(u => u.Role == userRole && u.IsActive)
            .OrderBy(u => u.FirstName)
            .ToListAsync();

        return _mapper.Map<List<UserDto>>(users);
    }

    public async Task<int> EnsureUserExistsAsync(int externalId, string source = "ERP")
    {
        var extIdStr = externalId.ToString();

        // 1. Check by ExternalId reference first so ERP users stay tied to the synced record.
        var localUserByExtId = await _context.Users
            .FirstOrDefaultAsync(u => u.ExternalId == extIdStr && u.ExternalSource == source);
        if (localUserByExtId != null)
        {
            var existingErpEmployee = await _erpService.GetEmployeeByIdAsync(externalId);
            if (existingErpEmployee != null)
            {
                ApplyErpData(localUserByExtId, existingErpEmployee, externalId, source);
                await _context.SaveChangesAsync();
            }

            return localUserByExtId.Id;
        }

        // 2. Allow an existing synced local primary key to be refreshed too.
        var localUserById = await _context.Users.FirstOrDefaultAsync(u =>
            u.Id == externalId &&
            (u.ExternalId == extIdStr || u.ExternalSource == source));
        if (localUserById != null)
        {
            var existingErpEmployee = await _erpService.GetEmployeeByIdAsync(externalId);
            if (existingErpEmployee != null)
            {
                ApplyErpData(localUserById, existingErpEmployee, externalId, source);
                await _context.SaveChangesAsync();
            }

            return localUserById.Id;
        }

        // 3. Fetch from ERP
        var erpEmployee = await _erpService.GetEmployeeByIdAsync(externalId);

        // 4. Create local user from ERP data when available, otherwise fall back to a safe placeholder
        // so ticket assignment never fails just because ERP data is missing for that user.
        var newUser = new User
        {
            Username = NormalizeUserName(erpEmployee?.UserName, externalId),
            FirstName = NormalizePersonName(erpEmployee?.Name, externalId),
            LastName = NormalizePersonName(erpEmployee?.Surname, externalId, allowEmpty: true) ?? string.Empty,
            Email = NormalizeEmail(erpEmployee?.EmailAddress, externalId),
            Department = erpEmployee?.OrganizationUnitName ?? string.Empty,
            JobTitle = erpEmployee?.JobTitle ?? string.Empty,
            PhoneNumber = NormalizePhoneNumber(erpEmployee?.PhoneNumber),
            Role = UserRole.Technician, // Default to Technician for assignments
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()), // Random password
            ExternalId = extIdStr,
            ExternalSource = source,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsActive = true
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        return newUser.Id;
    }

    public async Task<int> EnsureUserExistsAsync(UserDto user, string source = "ERP")
    {
        if (user == null)
        {
            throw new ArgumentNullException(nameof(user));
        }

        if (user.Id <= 0)
        {
            throw new ArgumentException("Assigned user must include a valid id");
        }

        var extIdStr = user.Id.ToString();

        var localUserByExtId = await _context.Users
            .FirstOrDefaultAsync(u => u.ExternalId == extIdStr && u.ExternalSource == source);
        if (localUserByExtId != null)
        {
            ApplyAssignedUserData(localUserByExtId, user, source);
            await _context.SaveChangesAsync();
            return localUserByExtId.Id;
        }

        var localUserById = await _context.Users.FirstOrDefaultAsync(u =>
            u.Id == user.Id &&
            (u.ExternalId == extIdStr || u.ExternalSource == source));
        if (localUserById != null)
        {
            ApplyAssignedUserData(localUserById, user, source);
            await _context.SaveChangesAsync();
            return localUserById.Id;
        }

        var newUser = new User
        {
            Username = NormalizeUserName(user.Username, user.Id),
            FirstName = NormalizePersonName(user.FirstName ?? user.FullName, user.Id),
            LastName = NormalizePersonName(user.LastName, user.Id, allowEmpty: true) ?? string.Empty,
            Email = NormalizeEmail(user.Email, user.Id),
            Department = NormalizeText(user.Department) ?? string.Empty,
            JobTitle = NormalizeText(user.JobTitle) ?? string.Empty,
            PhoneNumber = NormalizePhoneNumber(user.PhoneNumber),
            Role = ParseRole(user.Role),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
            ExternalId = extIdStr,
            ExternalSource = source,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsActive = user.IsActive,
            AvatarUrl = user.AvatarUrl
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        return newUser.Id;
    }

    private void ApplyErpData(User user, ErpEmployee employee, int externalId, string source)
    {
        user.Username = NormalizeUserName(employee.UserName, externalId);
        user.FirstName = NormalizePersonName(employee.Name, externalId);
        user.LastName = NormalizePersonName(employee.Surname, externalId, allowEmpty: true) ?? string.Empty;
        user.Email = NormalizeEmail(employee.EmailAddress, externalId);
        user.Department = employee.OrganizationUnitName ?? string.Empty;
        user.JobTitle = employee.JobTitle ?? string.Empty;
        user.PhoneNumber = NormalizePhoneNumber(employee.PhoneNumber);
        user.ExternalId = externalId.ToString();
        user.ExternalSource = source;
        user.UpdatedAt = DateTime.UtcNow;
        user.IsActive = true;
    }

    private void ApplyAssignedUserData(User user, UserDto payload, string source)
    {
        user.Username = NormalizeUserName(payload.Username, payload.Id);
        user.FirstName = NormalizePersonName(payload.FirstName ?? payload.FullName, payload.Id);
        user.LastName = NormalizePersonName(payload.LastName, payload.Id, allowEmpty: true) ?? string.Empty;
        user.Email = NormalizeEmail(payload.Email, payload.Id);
        user.Department = NormalizeText(payload.Department) ?? string.Empty;
        user.JobTitle = NormalizeText(payload.JobTitle) ?? string.Empty;
        user.PhoneNumber = NormalizePhoneNumber(payload.PhoneNumber);
        user.Role = ParseRole(payload.Role);
        user.ExternalId = payload.Id.ToString();
        user.ExternalSource = source;
        user.UpdatedAt = DateTime.UtcNow;
        user.IsActive = payload.IsActive;
        user.AvatarUrl = payload.AvatarUrl;
    }

    private static string NormalizeUserName(string? userName, int externalId)
    {
        var normalized = NormalizeText(userName);
        return !string.IsNullOrWhiteSpace(normalized) ? normalized : $"user_{externalId}";
    }

    private static string NormalizePersonName(string? value, int externalId, bool allowEmpty = false)
    {
        var normalized = NormalizeText(value);
        if (!string.IsNullOrWhiteSpace(normalized))
        {
            return normalized;
        }

        return allowEmpty ? string.Empty : $"ERP User {externalId}";
    }

    private static string NormalizeEmail(string? email, int externalId)
    {
        var normalized = NormalizeText(email);
        if (!string.IsNullOrWhiteSpace(normalized))
        {
            return normalized!;
        }

        return $"erp-{externalId}@sync.local";
    }

    private static string? NormalizePhoneNumber(string? phoneNumber)
    {
        var normalized = NormalizeText(phoneNumber);
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }

    private static string? NormalizeText(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return value.Trim();
    }

    private static UserRole ParseRole(string? role)
    {
        return role?.Trim().ToLowerInvariant() switch
        {
            "admin" or "administrator" => UserRole.Administrator,
            "manager" => UserRole.Manager,
            "technician" or "agent" => UserRole.Technician,
            "enduser" or "user" => UserRole.EndUser,
            _ => UserRole.Technician,
        };
    }
}
