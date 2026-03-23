namespace ITSMBackend.DTOs;

public class ApprovalItemDto
{
    public int Id { get; set; }
    public string ItemType { get; set; } = string.Empty;
    public int ReferenceId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public UserDto? AssignedTo { get; set; }
    public UserDto? RequestedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public int Priority { get; set; }
}

public class UpdateApprovalItemDto
{
    public string? Status { get; set; }
    public string? ApprovalNotes { get; set; }
    public int? AssignedToId { get; set; }
}
