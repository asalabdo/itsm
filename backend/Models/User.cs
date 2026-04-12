namespace ITSMBackend.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.EndUser;
    public string Department { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; } = true;
    public bool EmailUpdatesEnabled { get; set; } = true;
    public bool SmsAlertsEnabled { get; set; } = false;
    public bool PushNotificationsEnabled { get; set; } = true;
    public bool WeeklyDigestEnabled { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public int? TenantId { get; set; }
    
    // External Integration Fields
    public string? ExternalId { get; set; }
    public string? ExternalSource { get; set; }
    
    public virtual ICollection<Ticket> AssignedTickets { get; set; } = new List<Ticket>();
    public virtual ICollection<Ticket> RequestedTickets { get; set; } = new List<Ticket>();
    public virtual ICollection<TicketComment> Comments { get; set; } = new List<TicketComment>();
    public virtual ICollection<TicketActivity> Activities { get; set; } = new List<TicketActivity>();
    public virtual ICollection<TicketStatusHistory> StatusChanges { get; set; } = new List<TicketStatusHistory>();
    public virtual ICollection<TicketAssignment> AssignedTicketRecords { get; set; } = new List<TicketAssignment>();
    public virtual ICollection<UserRoleLink> UserRoles { get; set; } = new List<UserRoleLink>();
}
