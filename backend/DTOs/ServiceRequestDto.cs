namespace ITSMBackend.DTOs;

public class ServiceCatalogItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DescriptionAr { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string CategoryAr { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string FormConfigJson { get; set; } = "[]";
    public bool RequiresApproval { get; set; }
    public int DefaultSlaHours { get; set; }
    public int RequestCount { get; set; }
}

public class UpdateServiceRequestDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public int? AssignedToId { get; set; }
}

public class CreateServiceRequestDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Priority { get; set; } = "Medium";
    public int CatalogItemId { get; set; }
    public string? CustomDataJson { get; set; }
}

public class ApprovalRequestDto
{
    public int Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Comments { get; set; }
    public string ApproverName { get; set; } = string.Empty;
    public DateTime? DecidedAt { get; set; }
}

public class FulfillmentTaskDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? AssignedToName { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class ServiceRequestDto
{
    public int Id { get; set; }
    public string RequestNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string WorkflowStage { get; set; } = string.Empty;
    public string CatalogItemName { get; set; } = string.Empty;
    public string CatalogItemNameAr { get; set; } = string.Empty;
    public int? CatalogItemId { get; set; }
    public int? RequestedById { get; set; }
    public int? AssignedToId { get; set; }
    public string? ExternalId { get; set; }
    public string? ExternalSystem { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? SlaDueDate { get; set; }
    public bool IsSlaBreached { get; set; }
    public UserDto? RequestedBy { get; set; }
    public UserDto? AssignedTo { get; set; }
    public DateTime? CompletionDate { get; set; }
    
    public List<ApprovalRequestDto> Approvals { get; set; } = new();
    public List<FulfillmentTaskDto> Tasks { get; set; } = new();
}
