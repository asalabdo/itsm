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
            Category = "Access",
            Summary = "Step-by-step recovery for VPN authentication and multi-factor enrollment issues.",
            Content = "Use this article when users cannot authenticate to VPN, lose their MFA device, or need to re-enroll a new phone.",
            Tags = ["vpn", "mfa", "access", "security"],
            IsFeatured = true,
            Views = 128
        },
        new()
        {
            Id = 2,
            Title = "Printer and Driver Troubleshooting",
            Category = "Hardware",
            Summary = "Resolve common printer queue, driver, and spooler failures quickly.",
            Content = "Check the print spooler service, clear stuck jobs, reinstall drivers, and validate network discovery.",
            Tags = ["printer", "driver", "hardware", "spooler"],
            IsFeatured = true,
            Views = 94
        },
        new()
        {
            Id = 3,
            Title = "Laptop Replacement Standard",
            Category = "Asset",
            Summary = "Policy for requesting, approving, and handing over replacement devices.",
            Content = "Use when devices are beyond warranty, damaged, or do not meet performance requirements.",
            Tags = ["asset", "hardware", "replacement"],
            Views = 71
        },
        new()
        {
            Id = 4,
            Title = "Service Desk Escalation Matrix",
            Category = "Process",
            Summary = "Who owns which escalation tier and when to page management or vendors.",
            Content = "Map incident severity to response owners and escalation deadlines to keep SLA compliance high.",
            Tags = ["escalation", "sla", "process"],
            Views = 65
        },
        new()
        {
            Id = 5,
            Title = "Software Access Request Checklist",
            Category = "Requests",
            Summary = "Minimum approval and validation steps before assigning an application license.",
            Content = "Use for common software requests to avoid back-and-forth and ensure compliance.",
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
}

