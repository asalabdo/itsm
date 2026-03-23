namespace ITSMBackend.DTOs;

public class ServiceRequestDto
{
    public int Id { get; set; }
    public string RequestNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string ServiceType { get; set; } = string.Empty;
    public UserDto? RequestedBy { get; set; }
    public UserDto? AssignedTo { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? CompletionDate { get; set; }
}

public class CreateServiceRequestDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ServiceType { get; set; } = string.Empty;
    public string Priority { get; set; } = "Medium";
}

public class UpdateServiceRequestDto
{
    public string? Title { get; set; }
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public int? AssignedToId { get; set; }
}
