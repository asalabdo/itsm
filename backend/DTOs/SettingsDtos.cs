namespace ITSMBackend.DTOs;

public class SettingsProfileDto
{
    public string DisplayName { get; set; } = "IT Service Manager";
    public string Role { get; set; } = "Operations Center";
    public string Theme { get; set; } = "System";
    public string Language { get; set; } = "en";
    public string DefaultLandingPage { get; set; } = "/it-operations-command-center";
    public string NotificationEmail { get; set; } = "admin@itsm.local";
    public bool EmailNotifications { get; set; } = true;
    public bool PushNotifications { get; set; } = true;
    public bool AutoRefreshEnabled { get; set; } = true;
    public int AutoRefreshSeconds { get; set; } = 60;
    public int SlaWarningMinutes { get; set; } = 120;
    public int EscalationMinutes { get; set; } = 30;
    public List<string> EnabledModules { get; set; } = ["Incidents", "Changes", "Assets", "Requests", "Knowledge Base"];
    public NotificationPreferencesDto NotificationPreferences { get; set; } = new();
    public List<IntegrationSettingsDto> Integrations { get; set; } = [];
}

public class NotificationPreferencesDto
{
    public bool EmailUpdates { get; set; } = true;
    public bool SmsAlerts { get; set; } = false;
    public bool PushNotifications { get; set; } = true;
    public bool WeeklyDigest { get; set; } = true;
}

public class IntegrationSettingsDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty;
    public bool IsEnabled { get; set; } = true;
    public string ConfigurationJson { get; set; } = "{}";
    public string EventSubscriptions { get; set; } = "[]";
}
