namespace ITSMBackend.Models;

public class ServiceLevelAgreement
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public int ResponseTimeMinutes { get; set; }
    public int ResolutionTimeMinutes { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}

public class TicketStatusHistory
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public string? OldStatus { get; set; }
    public string? NewStatus { get; set; }
    public int? ChangedById { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

    public virtual Ticket Ticket { get; set; } = null!;
    public virtual User? ChangedBy { get; set; }
}

public class TicketPriorityLookup
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Level { get; set; }
    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}

public class TicketStatusLookup
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}

public class TicketCategoryLookup
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? ParentId { get; set; }

    public virtual TicketCategoryLookup? Parent { get; set; }
    public virtual ICollection<TicketCategoryLookup> Children { get; set; } = new List<TicketCategoryLookup>();
    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}

public class TicketAssignment
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public int AssignedToId { get; set; }
    public int AssignedById { get; set; }
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    public virtual Ticket Ticket { get; set; } = null!;
    public virtual User AssignedTo { get; set; } = null!;
    public virtual User AssignedBy { get; set; } = null!;
}

public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public virtual ICollection<TicketTag> TicketTags { get; set; } = new List<TicketTag>();
}

public class TicketTag
{
    public int TicketId { get; set; }
    public int TagId { get; set; }

    public virtual Ticket Ticket { get; set; } = null!;
    public virtual Tag Tag { get; set; } = null!;
}

public class RoleDefinition
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    public virtual ICollection<UserRoleLink> UserRoles { get; set; } = new List<UserRoleLink>();
}

public class PermissionDefinition
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

public class RolePermission
{
    public int RoleId { get; set; }
    public int PermissionId { get; set; }

    public virtual RoleDefinition Role { get; set; } = null!;
    public virtual PermissionDefinition Permission { get; set; } = null!;
}

public class UserRoleLink
{
    public int UserId { get; set; }
    public int RoleId { get; set; }

    public virtual User User { get; set; } = null!;
    public virtual RoleDefinition Role { get; set; } = null!;
}
