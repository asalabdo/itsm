namespace ITSMBackend.DTOs;

public class WorkflowDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int CreatedById { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int Version { get; set; }
    public List<WorkflowStepDto> Steps { get; set; } = new();
}

public class CreateWorkflowDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? WorkflowDefinition { get; set; }
    public string? TriggerType { get; set; }
}

public class UpdateWorkflowDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }
}

public class WorkflowStepDto
{
    public int Id { get; set; }
    public string StepName { get; set; } = string.Empty;
    public string StepType { get; set; } = string.Empty;
    public int StepOrder { get; set; }
    public string? StepConfiguration { get; set; }
}

public class WorkflowInstanceDto
{
    public int Id { get; set; }
    public int WorkflowId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public UserDto? TriggeredBy { get; set; }
}
