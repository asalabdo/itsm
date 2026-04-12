namespace ITSMBackend.Models;

public class ApprovalRequest
{
    public int Id { get; set; }
    public int ServiceRequestId { get; set; }
    public int ApproverId { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public string? Comments { get; set; }
    public DateTime? DecidedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual ServiceRequest ServiceRequest { get; set; } = null!;
    public virtual User Approver { get; set; } = null!;
}
