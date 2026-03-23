namespace ITSMBackend.DTOs;

public class ChangeRequestDto
{
    public int Id { get; set; }
    public string ChangeNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string? ImpactAssessment { get; set; }
    public DateTime? ImplementationDate { get; set; }
    public DateTime? TestingDate { get; set; }
    public UserDto? RequestedBy { get; set; }
    public UserDto? ApprovedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateChangeRequestDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Priority { get; set; } = "Medium";
    public string? ImpactAssessment { get; set; }
    public DateTime? ImplementationDate { get; set; }
    public DateTime? TestingDate { get; set; }
    public string? RollbackPlan { get; set; }
}

public class UpdateChangeRequestDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public string? ImpactAssessment { get; set; }
    public DateTime? ImplementationDate { get; set; }
}
