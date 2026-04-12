namespace ITSMBackend.Models;

public class RequestAuditLog
{
    public int Id { get; set; }
    public int ServiceRequestId { get; set; }
    public string Action { get; set; } = string.Empty; // StatusChange, AssignmentUpdate, TaskCompleted
    public string Details { get; set; } = string.Empty;
    public int? PerformedById { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public virtual ServiceRequest ServiceRequest { get; set; } = null!;
    public virtual User? PerformedBy { get; set; }
}
