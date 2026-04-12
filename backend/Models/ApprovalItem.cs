namespace ITSMBackend.Models;

public class ApprovalItem
{
    public int Id { get; set; }
    public string ItemType { get; set; } = string.Empty; // Change, ServiceRequest, Incident
    public int ReferenceId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Escalated
    public int? AssignedToId { get; set; }
    public int? RequestedById { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
    public string? ApprovalNotes { get; set; }
    public int Priority { get; set; } = 2; // 1 = High, 2 = Medium, 3 = Low
    
    public virtual User? AssignedTo { get; set; }
    public virtual User? RequestedBy { get; set; }
}
