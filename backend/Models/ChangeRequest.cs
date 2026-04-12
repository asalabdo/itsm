namespace ITSMBackend.Models;

public class ChangeRequest
{
    public int Id { get; set; }
    public string ChangeNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Proposed"; // Proposed, Approved, Implementing, Completed, Rolled Back
    public string Priority { get; set; } = "Medium"; // Low, Medium, High, Critical
    public string RiskLevel { get; set; } = "Low"; // Low, Medium, High
    public string Category { get; set; } = "Normal"; // Standard, Normal, Emergency
    public string? ImplementationPlan { get; set; }
    public string? BackoutPlan { get; set; }
    public string? TestingPlan { get; set; }
    public int? RequestedById { get; set; }
    public int? ApprovedById { get; set; }
    public DateTime? ScheduledStartDate { get; set; }
    public DateTime? ScheduledEndDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual User? RequestedBy { get; set; }
    public virtual User? ApprovedBy { get; set; }
}
