namespace ITSMBackend.Models;

public class AutomationRule
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string TargetEntity { get; set; } = string.Empty; // Ticket, ChangeRequest, Asset
    public string TriggerEvent { get; set; } = string.Empty; // OnCreate, OnUpdate, OnStatusChange
    public bool IsActive { get; set; } = true;

    // JSON definition of conditions (e.g., {"Priority": "Critical", "Impact": "High"})
    public string ConditionsJson { get; set; } = "{}";

    // JSON definition of actions (e.g., [{"Action": "SetField", "Field": "AssignedToId", "Value": "5"}])
    public string ActionsJson { get; set; } = "[]";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class AutomationExecutionLog
{
    public int Id { get; set; }
    public int RuleId { get; set; }
    public string EntityId { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public string? ActionSummary { get; set; }
    public DateTime ExecutedAt { get; set; } = DateTime.UtcNow;

    public virtual AutomationRule Rule { get; set; } = null!;
}
