namespace ITSMBackend.Models;

public class AssetRelationship
{
    public int Id { get; set; }
    public int SourceAssetId { get; set; }
    public int TargetAssetId { get; set; }
    public string RelationshipType { get; set; } = string.Empty; // Runs On, Depends On, Hosted On, Connects To
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual Asset SourceAsset { get; set; } = null!;
    public virtual Asset TargetAsset { get; set; } = null!;
}
