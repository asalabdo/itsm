namespace ITSMBackend.Models;

public class ServiceRequest
{
    public int Id { get; set; }
    public string RequestNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Open"; // Open, In Progress, Fulfilled, Closed
    public string Priority { get; set; } = "Medium";
    public string ServiceType { get; set; } = string.Empty;
    public int? CatalogItemId { get; set; }
    public string? CustomDataJson { get; set; } // Responses from dynamic form
    public DateTime? SlaDueDate { get; set; }
    public bool IsSlaBreached { get; set; } = false;
    public string WorkflowStage { get; set; } = "Submission"; // Submission, Approval, Fulfillment, Review

    public int? RequestedById { get; set; }
    public int? AssignedToId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletionDate { get; set; }
    public decimal? EstimatedHours { get; set; }
    public decimal? ActualHours { get; set; }
    
    public virtual ServiceCatalogItem? CatalogItem { get; set; }
    public virtual User? RequestedBy { get; set; }
    public virtual User? AssignedTo { get; set; }
    public virtual ICollection<ApprovalRequest> Approvals { get; set; } = new List<ApprovalRequest>();
    public virtual ICollection<FulfillmentTask> Tasks { get; set; } = new List<FulfillmentTask>();
    public virtual ICollection<RequestAuditLog> AuditLogs { get; set; } = new List<RequestAuditLog>();
}
