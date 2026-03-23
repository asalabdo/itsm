namespace ITSMBackend.Models;

public class ChangeRequest
{
    public int Id { get; set; }
    public string ChangeNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Proposed"; // Proposed, Approved, Implementing, Completed, Rolled Back
    public string Priority { get; set; } = "Medium"; // Low, Medium, High, Critical
    public string? ImpactAssessment { get; set; }
    public DateTime? ImplementationDate { get; set; }
    public DateTime? TestingDate { get; set; }
    public int? RequestedById { get; set; }
    public int? ApprovedById { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string? RollbackPlan { get; set; }
    
    public virtual User? RequestedBy { get; set; }
    public virtual User? ApprovedBy { get; set; }
}
