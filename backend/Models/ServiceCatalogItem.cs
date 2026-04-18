namespace ITSMBackend.Models;

public class ServiceCatalogItem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DescriptionAr { get; set; } = string.Empty;
    public string Category { get; set; } = "General";
    public string CategoryAr { get; set; } = string.Empty;
    public string Icon { get; set; } = "Package";
    public string FormConfigJson { get; set; } = "[]";
    public bool RequiresApproval { get; set; } = false;
    public int DefaultSlaHours { get; set; } = 24;
    public bool IsActive { get; set; } = true;

    public virtual ICollection<ServiceRequest> ServiceRequests { get; set; } = new List<ServiceRequest>();
}
