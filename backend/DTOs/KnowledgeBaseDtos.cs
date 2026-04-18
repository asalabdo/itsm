namespace ITSMBackend.DTOs;

public class KnowledgeBaseArticleDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string TitleAr { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string CategoryAr { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string SummaryAr { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string ContentAr { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = [];
    public string Route { get; set; } = "/knowledge-base";
    public int Views { get; set; }
    public bool IsFeatured { get; set; }
}
