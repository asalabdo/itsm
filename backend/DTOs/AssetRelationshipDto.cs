namespace ITSMBackend.DTOs;

public class AssetRelationshipDto
{
    public int Id { get; set; }
    public int SourceAssetId { get; set; }
    public int TargetAssetId { get; set; }
    public string SourceAssetName { get; set; } = string.Empty;
    public string TargetAssetName { get; set; } = string.Empty;
    public string RelationshipType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateAssetRelationshipDto
{
    public int SourceAssetId { get; set; }
    public int TargetAssetId { get; set; }
    public string RelationshipType { get; set; } = string.Empty;
}
