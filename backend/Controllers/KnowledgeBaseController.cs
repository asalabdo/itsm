using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ITSMBackend.DTOs;

namespace ITSMBackend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class KnowledgeBaseController : ControllerBase
{
    private static readonly object ArticlesLock = new();
    private static readonly List<KnowledgeBaseArticleDto> Articles =
    [
        new()
        {
            Id = 1,
            Title = "Resetting VPN and MFA Access",
            TitleAr = "إعادة ضبط الوصول إلى VPN وMFA",
            Category = "Access",
            CategoryAr = "الوصول",
            Summary = "Step-by-step recovery for VPN authentication and multi-factor enrollment issues.",
            SummaryAr = "استعادة خطوة بخطوة لمشاكل المصادقة على VPN وتسجيل المصادقة متعددة العوامل.",
            Content = "Use this article when users cannot authenticate to VPN, lose their MFA device, or need to re-enroll a new phone.",
            ContentAr = "استخدم هذه المقالة عندما لا يستطيع المستخدمون المصادقة على VPN، أو يفقدون جهاز MFA، أو يحتاجون إلى إعادة تسجيل هاتف جديد.",
            Tags = ["vpn", "mfa", "access", "security"],
            IsFeatured = true,
            Views = 128
        },
        new()
        {
            Id = 2,
            Title = "Printer and Driver Troubleshooting",
            TitleAr = "استكشاف أعطال الطابعة والتعريفات",
            Category = "Hardware",
            CategoryAr = "الأجهزة",
            Summary = "Resolve common printer queue, driver, and spooler failures quickly.",
            SummaryAr = "حل أعطال قائمة الطباعة والتعريفات وخدمة spooler الشائعة بسرعة.",
            Content = "Check the print spooler service, clear stuck jobs, reinstall drivers, and validate network discovery.",
            ContentAr = "تحقق من خدمة spooler، وامسح المهام العالقة، وأعد تثبيت التعريفات، وتأكد من اكتشاف الشبكة.",
            Tags = ["printer", "driver", "hardware", "spooler"],
            IsFeatured = true,
            Views = 94
        },
        new()
        {
            Id = 3,
            Title = "Laptop Replacement Standard",
            TitleAr = "معيار استبدال الحاسب المحمول",
            Category = "Asset",
            CategoryAr = "الأصول",
            Summary = "Policy for requesting, approving, and handing over replacement devices.",
            SummaryAr = "سياسة طلب الأجهزة البديلة واعتمادها وتسليمها.",
            Content = "Use when devices are beyond warranty, damaged, or do not meet performance requirements.",
            ContentAr = "استخدمها عندما تكون الأجهزة خارج الضمان أو متضررة أو لا تفي بمتطلبات الأداء.",
            Tags = ["asset", "hardware", "replacement"],
            Views = 71
        },
        new()
        {
            Id = 4,
            Title = "Service Desk Escalation Matrix",
            TitleAr = "مصفوفة تصعيد مكتب الخدمة",
            Category = "Process",
            CategoryAr = "العملية",
            Summary = "Who owns which escalation tier and when to page management or vendors.",
            SummaryAr = "من يملك كل مستوى تصعيد ومتى يتم إشعار الإدارة أو الموردين.",
            Content = "Map incident severity to response owners and escalation deadlines to keep SLA compliance high.",
            ContentAr = "اربط شدة الحادث بمالكي الاستجابة ومواعيد التصعيد للحفاظ على امتثال SLA مرتفعًا.",
            Tags = ["escalation", "sla", "process"],
            Views = 65
        },
        new()
        {
            Id = 5,
            Title = "Software Access Request Checklist",
            TitleAr = "قائمة التحقق لطلب الوصول إلى البرامج",
            Category = "Requests",
            CategoryAr = "الطلبات",
            Summary = "Minimum approval and validation steps before assigning an application license.",
            SummaryAr = "أدنى خطوات الاعتماد والتحقق قبل إسناد ترخيص تطبيق.",
            Content = "Use for common software requests to avoid back-and-forth and ensure compliance.",
            ContentAr = "استخدمها لطلبات البرامج الشائعة لتقليل المراجعات المتكررة وضمان الامتثال.",
            Tags = ["software", "request", "approval"],
            Views = 88
        }
    ];

    [HttpGet("articles")]
    public ActionResult<IEnumerable<KnowledgeBaseArticleDto>> GetArticles()
    {
        lock (ArticlesLock)
        {
            return Ok(Articles.OrderByDescending(a => a.IsFeatured).ThenByDescending(a => a.Views).ToList());
        }
    }

    [HttpGet("articles/{id:int}")]
    public ActionResult<KnowledgeBaseArticleDto> GetArticle(int id)
    {
        lock (ArticlesLock)
        {
            var article = Articles.FirstOrDefault(a => a.Id == id);
            if (article == null)
            {
                return NotFound();
            }

            article.Views += 1;
            return Ok(article);
        }
    }

    [HttpGet("search")]
    public ActionResult<IEnumerable<KnowledgeBaseArticleDto>> Search([FromQuery] string? q = null)
    {
        lock (ArticlesLock)
        {
            var query = (q ?? string.Empty).Trim();
            var results = Articles.Where(article =>
                string.IsNullOrWhiteSpace(query) ||
                article.Title.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                article.Summary.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                article.Content.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                article.Tags.Any(tag => tag.Contains(query, StringComparison.OrdinalIgnoreCase)))
                .OrderByDescending(a => a.IsFeatured)
                .ThenByDescending(a => a.Views)
                .ToList();

            return Ok(results);
        }
    }

    [HttpPost("articles")]
    public ActionResult<KnowledgeBaseArticleDto> Create([FromBody] CreateKnowledgeBaseArticleDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Title))
        {
            return BadRequest();
        }

        lock (ArticlesLock)
        {
            var nextId = Articles.Count == 0 ? 1 : Articles.Max(a => a.Id) + 1;
            var article = new KnowledgeBaseArticleDto
            {
                Id = nextId,
                Title = dto.Title.Trim(),
                TitleAr = dto.TitleAr?.Trim() ?? string.Empty,
                Category = dto.Category.Trim(),
                CategoryAr = dto.CategoryAr?.Trim() ?? string.Empty,
                Summary = dto.Summary.Trim(),
                SummaryAr = dto.SummaryAr?.Trim() ?? string.Empty,
                Content = dto.Content.Trim(),
                ContentAr = dto.ContentAr?.Trim() ?? string.Empty,
                Tags = dto.Tags?.Where(tag => !string.IsNullOrWhiteSpace(tag)).Select(tag => tag.Trim()).Distinct(StringComparer.OrdinalIgnoreCase).ToList() ?? [],
                Views = dto.Views,
                IsFeatured = dto.IsFeatured,
                Route = string.IsNullOrWhiteSpace(dto.Route) ? "/knowledge-base" : dto.Route.Trim()
            };

            Articles.Add(article);
            return CreatedAtAction(nameof(GetArticle), new { id = article.Id }, article);
        }
    }

    [HttpPut("articles/{id:int}")]
    public ActionResult<KnowledgeBaseArticleDto> Update(int id, [FromBody] UpdateKnowledgeBaseArticleDto dto)
    {
        lock (ArticlesLock)
        {
            var article = Articles.FirstOrDefault(a => a.Id == id);
            if (article == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrWhiteSpace(dto.Title))
            {
                article.Title = dto.Title.Trim();
            }

            if (!string.IsNullOrWhiteSpace(dto.TitleAr))
            {
                article.TitleAr = dto.TitleAr.Trim();
            }

            if (!string.IsNullOrWhiteSpace(dto.Category))
            {
                article.Category = dto.Category.Trim();
            }

            if (!string.IsNullOrWhiteSpace(dto.CategoryAr))
            {
                article.CategoryAr = dto.CategoryAr.Trim();
            }

            if (!string.IsNullOrWhiteSpace(dto.Summary))
            {
                article.Summary = dto.Summary.Trim();
            }

            if (!string.IsNullOrWhiteSpace(dto.SummaryAr))
            {
                article.SummaryAr = dto.SummaryAr.Trim();
            }

            if (!string.IsNullOrWhiteSpace(dto.Content))
            {
                article.Content = dto.Content.Trim();
            }

            if (!string.IsNullOrWhiteSpace(dto.ContentAr))
            {
                article.ContentAr = dto.ContentAr.Trim();
            }

            if (dto.Tags != null)
            {
                article.Tags = dto.Tags.Where(tag => !string.IsNullOrWhiteSpace(tag)).Select(tag => tag.Trim()).Distinct(StringComparer.OrdinalIgnoreCase).ToList();
            }

            if (!string.IsNullOrWhiteSpace(dto.Route))
            {
                article.Route = dto.Route.Trim();
            }

            if (dto.Views.HasValue)
            {
                article.Views = dto.Views.Value;
            }

            if (dto.IsFeatured.HasValue)
            {
                article.IsFeatured = dto.IsFeatured.Value;
            }

            return Ok(article);
        }
    }

    [HttpDelete("articles/{id:int}")]
    public IActionResult Delete(int id)
    {
        lock (ArticlesLock)
        {
            var removed = Articles.RemoveAll(article => article.Id == id);
            return removed > 0 ? NoContent() : NotFound();
        }
    }
}

public class CreateKnowledgeBaseArticleDto
{
    public string Title { get; set; } = string.Empty;
    public string? TitleAr { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? CategoryAr { get; set; }
    public string Summary { get; set; } = string.Empty;
    public string? SummaryAr { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? ContentAr { get; set; }
    public List<string>? Tags { get; set; }
    public string? Route { get; set; }
    public int Views { get; set; }
    public bool IsFeatured { get; set; }
}

public class UpdateKnowledgeBaseArticleDto
{
    public string? Title { get; set; }
    public string? TitleAr { get; set; }
    public string? Category { get; set; }
    public string? CategoryAr { get; set; }
    public string? Summary { get; set; }
    public string? SummaryAr { get; set; }
    public string? Content { get; set; }
    public string? ContentAr { get; set; }
    public List<string>? Tags { get; set; }
    public string? Route { get; set; }
    public int? Views { get; set; }
    public bool? IsFeatured { get; set; }
}
