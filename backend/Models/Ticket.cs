namespace ITSMBackend.Models;

public class Ticket
{
    public int Id { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Priority { get; set; } = "Medium"; // Low, Medium, High, Critical
    public int? PriorityId { get; set; }
    public string Status { get; set; } = "Open"; // Open, In Progress, Resolved, Closed
    public int? StatusId { get; set; }
    public string Category { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public int? AssignedToId { get; set; }
    public int? RequestedById { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public decimal? Urgency { get; set; } // 0-1 scale
    public decimal? Impact { get; set; } // 0-1 scale
    public string? ResolutionNotes { get; set; }
    public DateTime? SlaDueDate { get; set; }
    public string? SlaStatus { get; set; } // on_track, at_risk, breached
    public int? SlaId { get; set; }
    public string? ExternalId { get; set; }
    public string? ExternalSystem { get; set; }
    public string? Subcategory { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public int? TenantId { get; set; }
    
    public virtual User? AssignedTo { get; set; }
    public virtual User? RequestedBy { get; set; }
    public virtual ServiceLevelAgreement? SLA { get; set; }
    public virtual TicketPriorityLookup? PriorityLookup { get; set; }
    public virtual TicketStatusLookup? StatusLookup { get; set; }
    public virtual TicketCategoryLookup? CategoryLookup { get; set; }
    public virtual ICollection<TicketComment> Comments { get; set; } = new List<TicketComment>();
    public virtual ICollection<TicketActivity> Activities { get; set; } = new List<TicketActivity>();
    public virtual ICollection<TicketAttachment> Attachments { get; set; } = new List<TicketAttachment>();
    public virtual ICollection<TicketStatusHistory> StatusHistory { get; set; } = new List<TicketStatusHistory>();
    public virtual ICollection<TicketAssignment> Assignments { get; set; } = new List<TicketAssignment>();
    public virtual ICollection<TicketTag> TicketTags { get; set; } = new List<TicketTag>();
}

public class TicketComment
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public int UserId { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual Ticket Ticket { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}

public class TicketActivity
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public int UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    public virtual Ticket Ticket { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}

public class TicketAttachment
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public int UserId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = "application/octet-stream";
    public long ContentLength { get; set; }
    public byte[] FileData { get; set; } = [];
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual Ticket Ticket { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
