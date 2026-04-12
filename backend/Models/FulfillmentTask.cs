namespace ITSMBackend.Models;

public class FulfillmentTask
{
    public int Id { get; set; }
    public int ServiceRequestId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, In Progress, Completed
    public int? AssignedToId { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual ServiceRequest ServiceRequest { get; set; } = null!;
    public virtual User? AssignedTo { get; set; }
}
