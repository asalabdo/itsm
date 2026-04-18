using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ITSMBackend.Data;
using ITSMBackend.DTOs;
using ITSMBackend.Models;

namespace ITSMBackend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SlaController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SlaController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("policies")]
    public ActionResult<IEnumerable<SlaPolicyDto>> GetPolicies()
    {
        return Ok(BuildPolicies());
    }

    [HttpGet("policies/{key}")]
    public ActionResult<SlaPolicyDto> GetPolicy(string key)
    {
        var policy = BuildPolicies().FirstOrDefault(p => string.Equals(p.Key, key, StringComparison.OrdinalIgnoreCase));
        if (policy == null)
        {
            return NotFound();
        }

        return Ok(policy);
    }

    [HttpGet("priorities")]
    public ActionResult<IEnumerable<SlaPriorityDto>> GetPriorities()
    {
        return Ok(BuildPriorities());
    }

    [HttpGet("escalations")]
    public ActionResult<IEnumerable<SlaEscalationDto>> GetEscalations()
    {
        return Ok(BuildEscalations());
    }

    [HttpGet("tickets")]
    public async Task<ActionResult<IEnumerable<TicketSlaSummaryDto>>> GetTicketSlas()
    {
        var tickets = await _context.Tickets
            .Include(t => t.RequestedBy)
            .Include(t => t.AssignedTo)
            .Where(t => t.Status != "Resolved" && t.Status != "Closed")
            .OrderBy(t => t.SlaDueDate ?? DateTime.MaxValue)
            .Take(100)
            .ToListAsync();

        return Ok(tickets.Select(MapTicketSla));
    }

    [HttpGet("tickets/{id:int}")]
    public async Task<ActionResult<TicketSlaSummaryDto>> GetTicketSlaById(int id)
    {
        var ticket = await _context.Tickets
            .Include(t => t.RequestedBy)
            .Include(t => t.AssignedTo)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null)
        {
            return NotFound();
        }

        return Ok(MapTicketSla(ticket));
    }

    [HttpGet("lookup")]
    public ActionResult<SlaLookupDto> Lookup([FromQuery] string? category = null, [FromQuery] string? serviceId = null, [FromQuery] string? priority = null)
    {
        var policy = ResolvePolicy(category, serviceId, priority);
        var priorityMeta = BuildPriorities().FirstOrDefault(p => string.Equals(p.Key, policy.Priority, StringComparison.OrdinalIgnoreCase))
            ?? BuildPriorities().First();

        return Ok(new SlaLookupDto
        {
            Scope = policy.Category,
            Category = policy.Category,
            ScopeEn = policy.NameEn,
            ScopeAr = policy.NameAr,
            CategoryEn = policy.Category,
            CategoryAr = policy.NameAr,
            ServiceId = policy.ServiceId,
            Priority = policy.Priority,
            PriorityEn = policy.PriorityEn,
            PriorityAr = policy.PriorityAr,
            Impact = policy.Impact,
            ImpactEn = policy.ImpactEn,
            ImpactAr = policy.ImpactAr,
            Urgency = policy.Urgency,
            UrgencyEn = policy.UrgencyEn,
            UrgencyAr = policy.UrgencyAr,
            PolicyName = policy.Name,
            PolicyNameEn = policy.NameEn,
            PolicyNameAr = policy.NameAr,
            ResponseHours = policy.ResponseHours,
            ResolutionHours = policy.ResolutionHours,
            EscalationMinutes = policy.EscalationMinutes,
            TicketRoute = policy.TicketRoute,
            IncidentRoute = policy.IncidentRoute,
            Guidance = $"Recommended SLA for {policy.Name}: response within {policy.ResponseHours}h, resolution within {policy.ResolutionHours}h, escalate after {policy.EscalationMinutes} minutes. Priority target: {priorityMeta.Label}.",
            GuidanceEn = $"Recommended SLA for {policy.NameEn}: response within {policy.ResponseHours}h, resolution within {policy.ResolutionHours}h, escalate after {policy.EscalationMinutes} minutes. Priority target: {priorityMeta.LabelEn}.",
            GuidanceAr = $"اتفاقية مستوى الخدمة الموصى بها لـ {policy.NameAr}: الاستجابة خلال {policy.ResponseHours} ساعة، والحل خلال {policy.ResolutionHours} ساعة، والتصعيد بعد {policy.EscalationMinutes} دقيقة. مستوى الأولوية المستهدف: {priorityMeta.LabelAr}."
        });
    }

    private static List<SlaPolicyDto> BuildPolicies() => new()
    {
        new()
        {
            Key = "technical-support",
            Name = "Technical Support",
            NameEn = "Technical Support",
            NameAr = "الدعم الفني",
            Category = "technical-support",
            Priority = "High",
            PriorityEn = "High",
            PriorityAr = "عالية",
            Impact = "High",
            ImpactEn = "High",
            ImpactAr = "عالٍ",
            Urgency = "High",
            UrgencyEn = "High",
            UrgencyAr = "عالية",
            ResponseHours = 2,
            ResolutionHours = 8,
            EscalationMinutes = 120,
            Owner = "Service Desk",
            OwnerEn = "Service Desk",
            OwnerAr = "مكتب الخدمة",
            Notes = "Device, email, printer, and network connectivity issues."
            ,
            NotesEn = "Device, email, printer, and network connectivity issues.",
            NotesAr = "مشكلات الأجهزة والبريد والطابعات واتصال الشبكة."
        },
        new()
        {
            Key = "access-management",
            Name = "Access Management",
            NameEn = "Access Management",
            NameAr = "إدارة الوصول",
            Category = "access-management",
            Priority = "High",
            PriorityEn = "High",
            PriorityAr = "عالية",
            Impact = "High",
            ImpactEn = "High",
            ImpactAr = "عالٍ",
            Urgency = "High",
            UrgencyEn = "High",
            UrgencyAr = "عالية",
            ResponseHours = 1,
            ResolutionHours = 4,
            EscalationMinutes = 60,
            Owner = "Security Operations",
            OwnerEn = "Security Operations",
            OwnerAr = "عمليات الأمن",
            Notes = "Password resets, account unlocks, MFA, VPN, and permissions.",
            NotesEn = "Password resets, account unlocks, MFA, VPN, and permissions.",
            NotesAr = "إعادة تعيين كلمات المرور وفتح الحسابات وMFA وVPN والصلاحيات."
        },
        new()
        {
            Key = "asset-management",
            Name = "Asset Management",
            NameEn = "Asset Management",
            NameAr = "إدارة الأصول",
            Category = "asset-management",
            Priority = "Low",
            PriorityEn = "Low",
            PriorityAr = "منخفضة",
            Impact = "Low",
            ImpactEn = "Low",
            ImpactAr = "منخفض",
            Urgency = "Low",
            UrgencyEn = "Low",
            UrgencyAr = "منخفضة",
            ResponseHours = 24,
            ResolutionHours = 72,
            EscalationMinutes = 480,
            Owner = "IT Asset Team",
            OwnerEn = "IT Asset Team",
            OwnerAr = "فريق أصول تقنية المعلومات",
            Notes = "Register, transfer, audit, and dispose assets.",
            NotesEn = "Register, transfer, audit, and dispose assets.",
            NotesAr = "تسجيل الأصول ونقلها وتدقيقها والتخلص منها."
        },
        new()
        {
            Key = "change-management",
            Name = "Change Management",
            NameEn = "Change Management",
            NameAr = "إدارة التغيير",
            Category = "change-management",
            Priority = "Medium",
            PriorityEn = "Medium",
            PriorityAr = "متوسطة",
            Impact = "Medium",
            ImpactEn = "Medium",
            ImpactAr = "متوسط",
            Urgency = "Medium",
            UrgencyEn = "Medium",
            UrgencyAr = "متوسطة",
            ResponseHours = 8,
            ResolutionHours = 24,
            EscalationMinutes = 240,
            Owner = "Change Advisory Board",
            OwnerEn = "Change Advisory Board",
            OwnerAr = "لجنة استشارية التغيير",
            Notes = "Planned changes, configs, deployment, rollback.",
            NotesEn = "Planned changes, configs, deployment, rollback.",
            NotesAr = "التغييرات المخططة والإعدادات والنشر والتراجع."
        },
        new()
        {
            Key = "cyber-security",
            Name = "Cyber Security",
            NameEn = "Cyber Security",
            NameAr = "الأمن السيبراني",
            Category = "cyber-security",
            Priority = "Urgent",
            PriorityEn = "Urgent",
            PriorityAr = "عاجلة",
            Impact = "Critical",
            ImpactEn = "Critical",
            ImpactAr = "حرج",
            Urgency = "Immediate",
            UrgencyEn = "Immediate",
            UrgencyAr = "فورية",
            ResponseHours = 1,
            ResolutionHours = 4,
            EscalationMinutes = 30,
            Owner = "Security Team",
            OwnerEn = "Security Team",
            OwnerAr = "فريق الأمن",
            Notes = "Phishing, breach, VPN, USB, antivirus, suspicious links.",
            NotesEn = "Phishing, breach, VPN, USB, antivirus, suspicious links.",
            NotesAr = "التصيد والاختراق وVPN وUSB ومكافحة الفيروسات والروابط المشبوهة."
        },
        new()
        {
            Key = "hr-services",
            Name = "HR Services",
            NameEn = "HR Services",
            NameAr = "خدمات الموارد البشرية",
            Category = "hr-services",
            Priority = "Medium",
            PriorityEn = "Medium",
            PriorityAr = "متوسطة",
            Impact = "Medium",
            ImpactEn = "Medium",
            ImpactAr = "متوسط",
            Urgency = "Medium",
            UrgencyEn = "Medium",
            UrgencyAr = "متوسطة",
            ResponseHours = 8,
            ResolutionHours = 24,
            EscalationMinutes = 240,
            Owner = "HR Shared Services",
            OwnerEn = "HR Shared Services",
            OwnerAr = "الخدمات المشتركة للموارد البشرية",
            Notes = "Leave, attendance, onboarding, and employee request support.",
            NotesEn = "Leave, attendance, onboarding, and employee request support.",
            NotesAr = "الإجازات والحضور والتهيئة ودعم طلبات الموظفين."
        },
        new()
        {
            Key = "finance-erp",
            Name = "Finance & ERP",
            NameEn = "Finance & ERP",
            NameAr = "المالية وERP",
            Category = "finance",
            Priority = "Medium",
            PriorityEn = "Medium",
            PriorityAr = "متوسطة",
            Impact = "Medium",
            ImpactEn = "Medium",
            ImpactAr = "متوسط",
            Urgency = "Medium",
            UrgencyEn = "Medium",
            UrgencyAr = "متوسطة",
            ResponseHours = 8,
            ResolutionHours = 24,
            EscalationMinutes = 240,
            Owner = "Finance Applications",
            OwnerEn = "Finance Applications",
            OwnerAr = "تطبيقات المالية",
            Notes = "ERP, procurement, finance, reporting, and data corrections.",
            NotesEn = "ERP, procurement, finance, reporting, and data corrections.",
            NotesAr = "أنظمة ERP والمشتريات والمالية والتقارير وتصحيح البيانات."
        },
        new()
        {
            Key = "facilities",
            Name = "Facilities",
            NameEn = "Facilities",
            NameAr = "المرافق",
            Category = "facilities",
            Priority = "Low",
            PriorityEn = "Low",
            PriorityAr = "منخفضة",
            Impact = "Low",
            ImpactEn = "Low",
            ImpactAr = "منخفض",
            Urgency = "Low",
            UrgencyEn = "Low",
            UrgencyAr = "منخفضة",
            ResponseHours = 24,
            ResolutionHours = 72,
            EscalationMinutes = 480,
            Owner = "Facilities Operations",
            OwnerEn = "Facilities Operations",
            OwnerAr = "عمليات المرافق",
            Notes = "Meeting rooms, car services, maintenance and phone services.",
            NotesEn = "Meeting rooms, car services, maintenance and phone services.",
            NotesAr = "غرف الاجتماعات وخدمات السيارات والصيانة وخدمات الهاتف."
        },
        new()
        {
            Key = "incident-management",
            Name = "Incident Management",
            NameEn = "Incident Management",
            NameAr = "إدارة الحوادث",
            Category = "incident-management",
            Priority = "Urgent",
            PriorityEn = "Urgent",
            PriorityAr = "عاجلة",
            Impact = "Critical",
            ImpactEn = "Critical",
            ImpactAr = "حرج",
            Urgency = "Immediate",
            UrgencyEn = "Immediate",
            UrgencyAr = "فورية",
            ResponseHours = 1,
            ResolutionHours = 4,
            EscalationMinutes = 30,
            Owner = "Incident Commander",
            OwnerEn = "Incident Commander",
            OwnerAr = "قائد الحوادث",
            Notes = "Major incidents, outages, data loss and security incidents.",
            NotesEn = "Major incidents, outages, data loss and security incidents.",
            NotesAr = "الحوادث الكبرى والانقطاعات وفقدان البيانات والحوادث الأمنية."
        },
        new()
        {
            Key = "knowledge-base",
            Name = "Knowledge Base",
            NameEn = "Knowledge Base",
            NameAr = "قاعدة المعرفة",
            Category = "knowledge-base",
            Priority = "Low",
            PriorityEn = "Low",
            PriorityAr = "منخفضة",
            Impact = "Low",
            ImpactEn = "Low",
            ImpactAr = "منخفض",
            Urgency = "Low",
            UrgencyEn = "Low",
            UrgencyAr = "منخفضة",
            ResponseHours = 48,
            ResolutionHours = 120,
            EscalationMinutes = 1440,
            Owner = "Knowledge Team",
            OwnerEn = "Knowledge Team",
            OwnerAr = "فريق المعرفة",
            Notes = "Article creation, updates and access requests.",
            NotesEn = "Article creation, updates and access requests.",
            NotesAr = "إنشاء المقالات وتحديثها وطلبات الوصول."
        },
        new()
        {
            Key = "service-request",
            Name = "Service Requests",
            NameEn = "Service Requests",
            NameAr = "طلبات الخدمة",
            Category = "service-request",
            Priority = "Medium",
            PriorityEn = "Medium",
            PriorityAr = "متوسطة",
            Impact = "Medium",
            ImpactEn = "Medium",
            ImpactAr = "متوسط",
            Urgency = "Medium",
            UrgencyEn = "Medium",
            UrgencyAr = "متوسطة",
            ResponseHours = 8,
            ResolutionHours = 24,
            EscalationMinutes = 240,
            Owner = "Fulfillment Team",
            OwnerEn = "Fulfillment Team",
            OwnerAr = "فريق التنفيذ",
            Notes = "Equipment, software, onboarding and workspace requests.",
            NotesEn = "Equipment, software, onboarding and workspace requests.",
            NotesAr = "طلبات المعدات والبرامج والتهيئة ومساحات العمل."
        },
        new()
        {
            Key = "software-licensing",
            Name = "Software Licensing",
            NameEn = "Software Licensing",
            NameAr = "ترخيص البرمجيات",
            Category = "software-licensing",
            Priority = "Medium",
            PriorityEn = "Medium",
            PriorityAr = "متوسطة",
            Impact = "Medium",
            ImpactEn = "Medium",
            ImpactAr = "متوسط",
            Urgency = "Medium",
            UrgencyEn = "Medium",
            UrgencyAr = "متوسطة",
            ResponseHours = 8,
            ResolutionHours = 24,
            EscalationMinutes = 240,
            Owner = "Software Asset Team",
            OwnerEn = "Software Asset Team",
            OwnerAr = "فريق أصول البرمجيات",
            Notes = "New, renew, transfer, revoke and audit licenses.",
            NotesEn = "New, renew, transfer, revoke and audit licenses.",
            NotesAr = "إصدار التراخيص وتجديدها ونقلها وإلغاؤها وتدقيقها."
        }
    };

    private static List<SlaPriorityDto> BuildPriorities() => new()
    {
        new()
        {
            Key = "urgent",
            Label = "Urgent",
            LabelEn = "Urgent",
            LabelAr = "عاجلة",
            Impact = "Critical",
            ImpactEn = "Critical",
            ImpactAr = "حرج",
            Urgency = "Immediate",
            UrgencyEn = "Immediate",
            UrgencyAr = "فورية",
            ResponseHours = 1,
            ResolutionHours = 4,
            EscalationMinutes = 30,
            Description = "Business critical incidents that stop work or affect many users.",
            DescriptionEn = "Business critical incidents that stop work or affect many users.",
            DescriptionAr = "حوادث حرجة تؤثر على الأعمال وتوقف العمل أو تؤثر على عدد كبير من المستخدمين."
        },
        new()
        {
            Key = "high",
            Label = "High",
            LabelEn = "High",
            LabelAr = "عالية",
            Impact = "High",
            ImpactEn = "High",
            ImpactAr = "عالٍ",
            Urgency = "High",
            UrgencyEn = "High",
            UrgencyAr = "عالية",
            ResponseHours = 2,
            ResolutionHours = 8,
            EscalationMinutes = 120,
            Description = "Important issues with significant impact but limited scope.",
            DescriptionEn = "Important issues with significant impact but limited scope.",
            DescriptionAr = "مشكلات مهمة ذات أثر ملحوظ ولكن ضمن نطاق محدود."
        },
        new()
        {
            Key = "medium",
            Label = "Medium",
            LabelEn = "Medium",
            LabelAr = "متوسطة",
            Impact = "Medium",
            ImpactEn = "Medium",
            ImpactAr = "متوسط",
            Urgency = "Medium",
            UrgencyEn = "Medium",
            UrgencyAr = "متوسطة",
            ResponseHours = 8,
            ResolutionHours = 24,
            EscalationMinutes = 240,
            Description = "Standard operational tickets and service requests.",
            DescriptionEn = "Standard operational tickets and service requests.",
            DescriptionAr = "تذاكر تشغيلية وطلبات خدمة قياسية."
        },
        new()
        {
            Key = "low",
            Label = "Low",
            LabelEn = "Low",
            LabelAr = "منخفضة",
            Impact = "Low",
            ImpactEn = "Low",
            ImpactAr = "منخفض",
            Urgency = "Low",
            UrgencyEn = "Low",
            UrgencyAr = "منخفضة",
            ResponseHours = 24,
            ResolutionHours = 72,
            EscalationMinutes = 480,
            Description = "Minor requests and work that can be scheduled.",
            DescriptionEn = "Minor requests and work that can be scheduled.",
            DescriptionAr = "طلبات بسيطة وأعمال يمكن جدولتها."
        }
    };

    private static List<SlaEscalationDto> BuildEscalations() => new()
    {
        new()
        {
            Level = "L1",
            Trigger = "Initial assignment / no response",
            TriggerEn = "Initial assignment / no response",
            TriggerAr = "التعيين الأولي / لا توجد استجابة",
            Action = "Notify service desk and keep on queue",
            ActionEn = "Notify service desk and keep on queue",
            ActionAr = "إخطار مكتب الخدمة والإبقاء على الطلب في قائمة الانتظار",
            Owner = "Service Desk",
            OwnerEn = "Service Desk",
            OwnerAr = "مكتب الخدمة",
            TriggerMinutes = 30,
            Route = "/ticket-management-center"
        },
        new()
        {
            Level = "L2",
            Trigger = "High priority still open",
            TriggerEn = "High priority still open",
            TriggerAr = "ما زالت الحالة عالية الأولوية مفتوحة",
            Action = "Escalate to specialist queue",
            ActionEn = "Escalate to specialist queue",
            ActionAr = "تصعيد إلى قائمة المتخصصين",
            Owner = "Team Lead",
            OwnerEn = "Team Lead",
            OwnerAr = "قائد الفريق",
            TriggerMinutes = 120,
            Route = "/ticket-details"
        },
        new()
        {
            Level = "L3",
            Trigger = "SLA risk / critical outage",
            TriggerEn = "SLA risk / critical outage",
            TriggerAr = "مخاطر SLA / انقطاع حرج",
            Action = "Notify incident manager and start bridge",
            ActionEn = "Notify incident manager and start bridge",
            ActionAr = "إخطار مدير الحوادث وبدء غرفة المتابعة",
            Owner = "Incident Manager",
            OwnerEn = "Incident Manager",
            OwnerAr = "مدير الحوادث",
            TriggerMinutes = 240,
            Route = "/incident-management-workflow"
        },
        new()
        {
            Level = "L4",
            Trigger = "Breach or executive impact",
            TriggerEn = "Breach or executive impact",
            TriggerAr = "خرق أو تأثير على الإدارة التنفيذية",
            Action = "Escalate to management and executive dashboard",
            ActionEn = "Escalate to management and executive dashboard",
            ActionAr = "تصعيد إلى الإدارة ولوحة القيادة التنفيذية",
            Owner = "IT Service Manager",
            OwnerEn = "IT Service Manager",
            OwnerAr = "مدير خدمات تقنية المعلومات",
            TriggerMinutes = 480,
            Route = "/manager-dashboard"
        }
    };

    private static SlaPolicyDto ResolvePolicy(string? category, string? serviceId, string? priority)
    {
        var normalized = (serviceId ?? category ?? priority ?? "general").Trim().ToLowerInvariant();
        var policies = BuildPolicies();

        if (normalized.Contains("security") || normalized.Contains("phishing") || normalized.Contains("breach") || normalized.Contains("vpn") || normalized.Contains("usb"))
        {
            return policies.First(p => p.Key == "cyber-security");
        }

        if (normalized.Contains("network") || normalized.Contains("internet") || normalized.Contains("outage") || normalized.Contains("email") || normalized.Contains("printer") || normalized.Contains("device") || normalized.Contains("technical"))
        {
            return policies.First(p => p.Key == "technical-support");
        }

        if (normalized.Contains("access") || normalized.Contains("password") || normalized.Contains("unlock") || normalized.Contains("mfa") || normalized.Contains("permission") || normalized.Contains("account"))
        {
            return policies.First(p => p.Key == "access-management");
        }

        if (normalized.Contains("change") || normalized.Contains("deployment") || normalized.Contains("rollback") || normalized.Contains("config"))
        {
            return policies.First(p => p.Key == "change-management");
        }

        if (normalized.Contains("hr") || normalized.Contains("leave") || normalized.Contains("attendance") || normalized.Contains("payroll") || normalized.Contains("onboarding") || normalized.Contains("offboarding"))
        {
            return policies.First(p => p.Key == "hr-services");
        }

        if (normalized.Contains("finance") || normalized.Contains("erp") || normalized.Contains("procurement") || normalized.Contains("inventory") || normalized.Contains("sales"))
        {
            return policies.First(p => p.Key == "finance-erp");
        }

        if (normalized.Contains("meeting") || normalized.Contains("car") || normalized.Contains("maintenance") || normalized.Contains("facility"))
        {
            return policies.First(p => p.Key == "facilities");
        }

        if (normalized.Contains("incident") || normalized.Contains("p1") || normalized.Contains("p2") || normalized.Contains("outage"))
        {
            return policies.First(p => p.Key == "incident-management");
        }

        if (normalized.Contains("knowledge") || normalized.Contains("article") || normalized.Contains("kb"))
        {
            return policies.First(p => p.Key == "knowledge-base");
        }

        if (normalized.Contains("license") || normalized.Contains("licensing") || normalized.Contains("software"))
        {
            return policies.First(p => p.Key == "software-licensing");
        }

        if (normalized.Contains("asset") || normalized.Contains("inventory") || normalized.Contains("register") || normalized.Contains("audit"))
        {
            return policies.First(p => p.Key == "asset-management");
        }

        if (priority?.Equals("urgent", StringComparison.OrdinalIgnoreCase) == true)
        {
            return policies.First(p => p.Key == "incident-management");
        }

        return policies.First(p => p.Key == "service-request");
    }

    private static TicketSlaSummaryDto MapTicketSla(Ticket ticket)
    {
        var policy = ResolvePolicy(ticket.Category, ticket.Subcategory, ticket.Priority);
        var remaining = ticket.SlaDueDate.HasValue && ticket.Status is not ("Resolved" or "Closed")
            ? (int)Math.Floor((ticket.SlaDueDate.Value - DateTime.UtcNow).TotalMinutes)
            : (int?)null;

        return new TicketSlaSummaryDto
        {
            TicketId = ticket.Id,
            TicketNumber = ticket.TicketNumber,
            Title = ticket.Title,
            Priority = ticket.Priority,
            PriorityEn = ticket.Priority,
            PriorityAr = TranslatePriorityToArabic(ticket.Priority),
            Status = ticket.Status,
            Category = ticket.Category,
            Subcategory = ticket.Subcategory,
            PolicyName = policy.Name,
            PolicyNameEn = policy.NameEn,
            PolicyNameAr = policy.NameAr,
            DueDate = ticket.SlaDueDate,
            RemainingMinutes = remaining,
            SlaStatus = ticket.SlaStatus,
            ResponseHours = policy.ResponseHours,
            ResolutionHours = policy.ResolutionHours,
            EscalationMinutes = policy.EscalationMinutes,
            TicketRoute = $"/ticket-details/{ticket.Id}",
            IncidentRoute = policy.IncidentRoute
        };
    }

    private static string TranslatePriorityToArabic(string? priority)
    {
        return priority?.Trim().ToLowerInvariant() switch
        {
            "urgent" => "عاجلة",
            "critical" => "حرجة",
            "high" => "عالية",
            "medium" => "متوسطة",
            "low" => "منخفضة",
            _ => priority ?? string.Empty
        };
    }
}
