namespace ITSMBackend.Models;

public class Workflow
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Draft"; // Draft, Published, Archived
    public int CreatedById { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string? WorkflowDefinition { get; set; } // JSON definition
    public int Version { get; set; } = 1;
    public string? TriggerType { get; set; }
    
    public virtual User CreatedBy { get; set; } = null!;
    public virtual ICollection<WorkflowStep> Steps { get; set; } = new List<WorkflowStep>();
    public virtual ICollection<WorkflowInstance> Instances { get; set; } = new List<WorkflowInstance>();
}

public class WorkflowStep
{
    public int Id { get; set; }
    public int WorkflowId { get; set; }
    public string StepName { get; set; } = string.Empty;
    public string StepType { get; set; } = string.Empty; // Approval, Task, Notification, etc.
    public int StepOrder { get; set; }
    public string? StepConfiguration { get; set; } // JSON configuration
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual Workflow Workflow { get; set; } = null!;
}

public class WorkflowInstance
{
    public int Id { get; set; }
    public int WorkflowId { get; set; }
    public string Status { get; set; } = "Active"; // Active, Completed, Failed
    public int? TriggeredById { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public string? ReferenceId { get; set; }
    
    public virtual Workflow Workflow { get; set; } = null!;
    public virtual User? TriggeredBy { get; set; }
    public virtual ICollection<WorkflowInstanceStep> Steps { get; set; } = new List<WorkflowInstanceStep>();
}

public class WorkflowInstanceStep
{
    public int Id { get; set; }
    public int InstanceId { get; set; }
    public int StepId { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, InProgress, Completed, Skipped
    public int? AssignedToId { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    
    public virtual WorkflowInstance Instance { get; set; } = null!;
    public virtual WorkflowStep Step { get; set; } = null!;
    public virtual User? AssignedTo { get; set; }
}
