namespace ITSMBackend.Models;

public class ServiceCatalogItem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "General"; // Hardware, Software, Access, etc.
    public string Icon { get; set; } = "Package"; // Lucide icon name
    public string FormConfigJson { get; set; } = "[]"; // Dynamic form fields
    public bool RequiresApproval { get; set; } = false;
    public int DefaultSlaHours { get; set; } = 24;
    public bool IsActive { get; set; } = true;

    public virtual ICollection<ServiceRequest> ServiceRequests { get; set; } = new List<ServiceRequest>();
}
