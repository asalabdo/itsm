namespace ITSMBackend.DTOs;

public class SlaPolicyDto
{
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? ServiceId { get; set; }
    public string Priority { get; set; } = string.Empty;
    public string PriorityEn { get; set; } = string.Empty;
    public string PriorityAr { get; set; } = string.Empty;
    public string Impact { get; set; } = string.Empty;
    public string ImpactEn { get; set; } = string.Empty;
    public string ImpactAr { get; set; } = string.Empty;
    public string Urgency { get; set; } = string.Empty;
    public string UrgencyEn { get; set; } = string.Empty;
    public string UrgencyAr { get; set; } = string.Empty;
    public int ResponseHours { get; set; }
    public int ResolutionHours { get; set; }
    public int EscalationMinutes { get; set; }
    public string Owner { get; set; } = string.Empty;
    public string OwnerEn { get; set; } = string.Empty;
    public string OwnerAr { get; set; } = string.Empty;
    public string TicketRoute { get; set; } = "/ticket-management-center";
    public string IncidentRoute { get; set; } = "/incident-management-workflow";
    public string Notes { get; set; } = string.Empty;
    public string NotesEn { get; set; } = string.Empty;
    public string NotesAr { get; set; } = string.Empty;
}

public class SlaPriorityDto
{
    public string Key { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string LabelEn { get; set; } = string.Empty;
    public string LabelAr { get; set; } = string.Empty;
    public string Impact { get; set; } = string.Empty;
    public string ImpactEn { get; set; } = string.Empty;
    public string ImpactAr { get; set; } = string.Empty;
    public string Urgency { get; set; } = string.Empty;
    public string UrgencyEn { get; set; } = string.Empty;
    public string UrgencyAr { get; set; } = string.Empty;
    public int ResponseHours { get; set; }
    public int ResolutionHours { get; set; }
    public int EscalationMinutes { get; set; }
    public string Description { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;
    public string DescriptionAr { get; set; } = string.Empty;
    public string TicketRoute { get; set; } = "/ticket-management-center";
}

public class SlaEscalationDto
{
    public string Level { get; set; } = string.Empty;
    public string Trigger { get; set; } = string.Empty;
    public string TriggerEn { get; set; } = string.Empty;
    public string TriggerAr { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string ActionEn { get; set; } = string.Empty;
    public string ActionAr { get; set; } = string.Empty;
    public string Owner { get; set; } = string.Empty;
    public string OwnerEn { get; set; } = string.Empty;
    public string OwnerAr { get; set; } = string.Empty;
    public int TriggerMinutes { get; set; }
    public string Route { get; set; } = "/ticket-management-center";
}

public class TicketSlaSummaryDto
{
    public int TicketId { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string PriorityEn { get; set; } = string.Empty;
    public string PriorityAr { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Subcategory { get; set; }
    public string PolicyName { get; set; } = string.Empty;
    public string PolicyNameEn { get; set; } = string.Empty;
    public string PolicyNameAr { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public int? RemainingMinutes { get; set; }
    public string? SlaStatus { get; set; }
    public int ResponseHours { get; set; }
    public int ResolutionHours { get; set; }
    public int EscalationMinutes { get; set; }
    public string TicketRoute { get; set; } = "/ticket-details";
    public string IncidentRoute { get; set; } = "/incident-management-workflow";
}

public class SlaLookupDto
{
    public string Scope { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string ScopeEn { get; set; } = string.Empty;
    public string ScopeAr { get; set; } = string.Empty;
    public string CategoryEn { get; set; } = string.Empty;
    public string CategoryAr { get; set; } = string.Empty;
    public string? ServiceId { get; set; }
    public string Priority { get; set; } = string.Empty;
    public string PriorityEn { get; set; } = string.Empty;
    public string PriorityAr { get; set; } = string.Empty;
    public string Impact { get; set; } = string.Empty;
    public string ImpactEn { get; set; } = string.Empty;
    public string ImpactAr { get; set; } = string.Empty;
    public string Urgency { get; set; } = string.Empty;
    public string UrgencyEn { get; set; } = string.Empty;
    public string UrgencyAr { get; set; } = string.Empty;
    public string PolicyName { get; set; } = string.Empty;
    public string PolicyNameEn { get; set; } = string.Empty;
    public string PolicyNameAr { get; set; } = string.Empty;
    public int ResponseHours { get; set; }
    public int ResolutionHours { get; set; }
    public int EscalationMinutes { get; set; }
    public string TicketRoute { get; set; } = "/ticket-management-center";
    public string IncidentRoute { get; set; } = "/incident-management-workflow";
    public string Guidance { get; set; } = string.Empty;
    public string GuidanceEn { get; set; } = string.Empty;
    public string GuidanceAr { get; set; } = string.Empty;
}
