namespace ITSMBackend.DTOs;

public class AssetDto
{
    public int Id { get; set; }
    public string AssetTag { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string AssetType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string SerialNumber { get; set; } = string.Empty;
    public string? Model { get; set; }
    public string? Manufacturer { get; set; }
    public decimal? CostAmount { get; set; }
    public DateTime? PurchaseDate { get; set; }
    public DateTime? DecommissionDate { get; set; }
    public UserDto? Owner { get; set; }
    public string Location { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? Description { get; set; }
}

public class CreateAssetDto
{
    public string AssetTag { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string AssetType { get; set; } = string.Empty;
    public string SerialNumber { get; set; } = string.Empty;
    public string? Model { get; set; }
    public string? Manufacturer { get; set; }
    public decimal? CostAmount { get; set; }
    public DateTime? PurchaseDate { get; set; }
    public int? OwnerId { get; set; }
    public string Location { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class UpdateAssetDto
{
    public string? Name { get; set; }
    public string? Status { get; set; }
    public string? Location { get; set; }
    public int? OwnerId { get; set; }
    public decimal? CostAmount { get; set; }
    public DateTime? DecommissionDate { get; set; }
}
