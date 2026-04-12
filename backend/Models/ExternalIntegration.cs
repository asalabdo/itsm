namespace ITSMBackend.Models;

public class ExternalIntegration
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty; // Slack, MS Teams, Jira
    public string ConfigurationJson { get; set; } = "{}"; // Encrypted/Secure settings
    public bool IsEnabled { get; set; } = true;
    public string EventSubscriptions { get; set; } = "[]"; // ["CriticalIncident", "NewServiceRequest"]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastSyncAt { get; set; }
}

public class IntegrationLog
{
    public int Id { get; set; }
    public int IntegrationId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Status { get; set; } = "Success"; // Success, Failed
    public string RequestPayload { get; set; } = string.Empty;
    public string ResponsePayload { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual ExternalIntegration Integration { get; set; } = null!;
}
