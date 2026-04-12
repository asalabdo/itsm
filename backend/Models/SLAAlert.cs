namespace ITSMBackend.Models;

public class SLAAlert
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public string AlertLevel { get; set; } = "warning"; // warning, critical, breached
    public DateTime TriggeredAt { get; set; } = DateTime.UtcNow;
    public int? AcknowledgedById { get; set; }
    public DateTime? AcknowledgedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string Reason { get; set; } = string.Empty; // e.g., "SLA due date approaching", "SLA breached"
    public bool IsActive { get; set; } = true;

    public virtual Ticket Ticket { get; set; } = null!;
    public virtual User? AcknowledgedBy { get; set; }
}