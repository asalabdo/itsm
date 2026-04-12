namespace ITSMBackend.DTOs;

public class ProblemRecordDto
{
    public int Id { get; set; }
    public string ProblemNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string RootCause { get; set; } = string.Empty;
    public string Workaround { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public List<TicketDto> LinkedTickets { get; set; } = new();
}

public class CreateProblemRecordDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string RootCause { get; set; } = string.Empty;
    public string Workaround { get; set; } = string.Empty;
    public string Priority { get; set; } = "Medium";
    public string Category { get; set; } = string.Empty;
}

public class UpdateProblemRecordDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? RootCause { get; set; }
    public string? Workaround { get; set; }
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public string? Category { get; set; }
}

public class LinkProblemTicketDto
{
    public int TicketId { get; set; }
}
