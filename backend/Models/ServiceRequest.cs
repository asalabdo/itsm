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
    public int? RequestedById { get; set; }
    public int? AssignedToId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletionDate { get; set; }
    public decimal? EstimatedHours { get; set; } // Hours
    public decimal? ActualHours { get; set; } // Hours
    
    public virtual User? RequestedBy { get; set; }
    public virtual User? AssignedTo { get; set; }
}
