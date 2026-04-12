namespace ITSMBackend.DTOs;

public class AutomationRuleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string TargetEntity { get; set; } = string.Empty;
    public string TriggerEvent { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string ConditionsJson { get; set; } = "{}";
    public string ActionsJson { get; set; } = "[]";
    public DateTime CreatedAt { get; set; }
}

public class CreateAutomationRuleDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string TargetEntity { get; set; } = string.Empty;
    public string TriggerEvent { get; set; } = string.Empty;
    public string ConditionsJson { get; set; } = "{}";
    public string ActionsJson { get; set; } = "[]";
}

public class AutomationExecutionLogDto
{
    public int Id { get; set; }
    public string RuleName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public string? ActionSummary { get; set; }
    public DateTime ExecutedAt { get; set; }
}
