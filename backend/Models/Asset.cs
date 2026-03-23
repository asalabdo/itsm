namespace ITSMBackend.Models;

public class Asset
{
    public int Id { get; set; }
    public string AssetTag { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string AssetType { get; set; } = string.Empty; // Hardware, Software, License
    public string Status { get; set; } = "Active"; // Active, Retired, In Maintenance, Available
    public string SerialNumber { get; set; } = string.Empty;
    public string? Model { get; set; }
    public string? Manufacturer { get; set; }
    public decimal? CostAmount { get; set; } // Currency amount
    public DateTime? PurchaseDate { get; set; }
    public DateTime? DecommissionDate { get; set; }
    public int? OwnerId { get; set; }
    public string Location { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string? Description { get; set; }
    
    public virtual User? Owner { get; set; }
    public virtual ICollection<AssetHistory> History { get; set; } = new List<AssetHistory>();
}

public class AssetHistory
{
    public int Id { get; set; }
    public int AssetId { get; set; }
    public int UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    public virtual Asset Asset { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
