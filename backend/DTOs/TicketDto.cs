namespace ITSMBackend.DTOs;

public class CreateTicketDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Priority { get; set; } = "Medium";
    public string Category { get; set; } = string.Empty;
    public int? AssignedToId { get; set; }
    public DateTime? DueDate { get; set; }
    public int? RequestedById { get; set; }
    public decimal? Urgency { get; set; }
    public decimal? Impact { get; set; }
}

public class UpdateTicketDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Priority { get; set; }
    public string? Status { get; set; }
    public string? Category { get; set; }
    public int? AssignedToId { get; set; }
    public UserDto? AssignedTo { get; set; }
    public DateTime? DueDate { get; set; }
    public string? ResolutionNotes { get; set; }
    public decimal? Urgency { get; set; }
    public decimal? Impact { get; set; }
}

public class TicketDto
{
    public int Id { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public UserDto? AssignedTo { get; set; }
    public UserDto? RequestedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? SlaDueDate { get; set; }
    public string? SlaStatus { get; set; }   // on_track | at_risk | breached
    public int? SlaRemainingMinutes { get; set; }
    public decimal? Urgency { get; set; }
    public decimal? Impact { get; set; }
    public string? ResolutionNotes { get; set; }
    public int CommentCount { get; set; }
    public int ActivityCount { get; set; }
}

public class TicketDetailDto : TicketDto
{
    public List<TicketCommentDto> Comments { get; set; } = new();
    public List<TicketActivityDto> Activities { get; set; } = new();
    public List<TicketAttachmentDto> Attachments { get; set; } = new();
}

public class TicketCommentDto
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public UserDto User { get; set; } = null!;
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class TicketActivityDto
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public UserDto User { get; set; } = null!;
    public string Action { get; set; } = string.Empty;
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public DateTime Timestamp { get; set; }
}

public class TicketAttachmentDto
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long ContentLength { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class TicketFilterDto
{
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public string? Category { get; set; }
    public int? AssignedToId { get; set; }
    public int? RequestedById { get; set; }
    public string? Search { get; set; }
    public string? SlaStatus { get; set; }
    public DateTime? CreatedFrom { get; set; }
    public DateTime? CreatedTo { get; set; }
}

public class TicketStatsDto
{
    public int Total { get; set; }
    public int Open { get; set; }
    public int InProgress { get; set; }
    public int Resolved { get; set; }
    public int Closed { get; set; }
    public int SlaBreached { get; set; }
    public int SlaAtRisk { get; set; }
    public int Critical { get; set; }
    public int High { get; set; }
    public int Medium { get; set; }
    public int Low { get; set; }
}
