namespace ITSMBackend.Models;

public class ProblemRecord
{
    public int Id { get; set; }
    public string ProblemNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string RootCause { get; set; } = string.Empty;
    public string Workaround { get; set; } = string.Empty;
    public string Status { get; set; } = "Investigating"; // Investigating, Known Error, Resolved, Closed
    public string Priority { get; set; } = "Medium";
    public string Category { get; set; } = string.Empty;
    public int CreatedById { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }

    public virtual User CreatedBy { get; set; } = null!;
    public virtual ICollection<ProblemTicketLink> LinkedTickets { get; set; } = new List<ProblemTicketLink>();
}

public class ProblemTicketLink
{
    public int Id { get; set; }
    public int ProblemRecordId { get; set; }
    public int TicketId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual ProblemRecord ProblemRecord { get; set; } = null!;
    public virtual Ticket Ticket { get; set; } = null!;
}
