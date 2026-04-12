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
            ServiceId = policy.ServiceId,
            Priority = policy.Priority,
            Impact = policy.Impact,
            Urgency = policy.Urgency,
            PolicyName = policy.Name,
            ResponseHours = policy.ResponseHours,
            ResolutionHours = policy.ResolutionHours,
            EscalationMinutes = policy.EscalationMinutes,
            TicketRoute = policy.TicketRoute,
            IncidentRoute = policy.IncidentRoute,
            Guidance = $"Recommended SLA for {policy.Name}: response within {policy.ResponseHours}h, resolution within {policy.ResolutionHours}h, escalate after {policy.EscalationMinutes} minutes. Priority target: {priorityMeta.Label}."
        });
    }

    private static List<SlaPolicyDto> BuildPolicies() => new()
    {
        new()
        {
            Key = "technical-support",
            Name = "Technical Support",
            Category = "technical-support",
            Priority = "High",
            Impact = "High",
            Urgency = "High",
            ResponseHours = 2,
            ResolutionHours = 8,
            EscalationMinutes = 120,
            Owner = "Service Desk",
            Notes = "Device, email, printer, and network connectivity issues."
        },
        new()
        {
            Key = "access-management",
            Name = "Access Management",
            Category = "access-management",
            Priority = "High",
            Impact = "High",
            Urgency = "High",
            ResponseHours = 1,
            ResolutionHours = 4,
            EscalationMinutes = 60,
            Owner = "Security Operations",
            Notes = "Password resets, account unlocks, MFA, VPN, and permissions."
        },
        new()
        {
            Key = "asset-management",
            Name = "Asset Management",
            Category = "asset-management",
            Priority = "Low",
            Impact = "Low",
            Urgency = "Low",
            ResponseHours = 24,
            ResolutionHours = 72,
            EscalationMinutes = 480,
            Owner = "IT Asset Team",
            Notes = "Register, transfer, audit, and dispose assets."
        },
        new()
        {
            Key = "change-management",
            Name = "Change Management",
            Category = "change-management",
            Priority = "Medium",
            Impact = "Medium",
            Urgency = "Medium",
            ResponseHours = 8,
            ResolutionHours = 24,
            EscalationMinutes = 240,
            Owner = "Change Advisory Board",
            Notes = "Planned changes, configs, deployment, rollback."
        },
        new()
        {
            Key = "cyber-security",
            Name = "Cyber Security",
            Category = "cyber-security",
            Priority = "Urgent",
            Impact = "Critical",
            Urgency = "Immediate",
            ResponseHours = 1,
            ResolutionHours = 4,
            EscalationMinutes = 30,
            Owner = "Security Team",
            Notes = "Phishing, breach, VPN, USB, antivirus, suspicious links."
        },
        new()
        {
            Key = "hr-services",
            Name = "HR Services",
            Category = "hr-services",
            Priority = "Medium",
            Impact = "Medium",
            Urgency = "Medium",
            ResponseHours = 8,
            ResolutionHours = 24,
            EscalationMinutes = 240,
            Owner = "HR Shared Services",
            Notes = "Leave, attendance, onboarding, and employee request support."
        },
        new()
        {
            Key = "finance-erp",
            Name = "Finance & ERP",
            Category = "finance",
            Priority = "Medium",
            Impact = "Medium",
            Urgency = "Medium",
            ResponseHours = 8,
            ResolutionHours = 24,
            EscalationMinutes = 240,
            Owner = "Finance Applications",
            Notes = "ERP, procurement, finance, reporting, and data corrections."
        },
        new()
        {
            Key = "facilities",
            Name = "Facilities",
            Category = "facilities",
            Priority = "Low",
            Impact = "Low",
            Urgency = "Low",
            ResponseHours = 24,
            ResolutionHours = 72,
            EscalationMinutes = 480,
            Owner = "Facilities Operations",
            Notes = "Meeting rooms, car services, maintenance and phone services."
        },
        new()
        {
            Key = "incident-management",
            Name = "Incident Management",
            Category = "incident-management",
            Priority = "Urgent",
            Impact = "Critical",
            Urgency = "Immediate",
            ResponseHours = 1,
            ResolutionHours = 4,
            EscalationMinutes = 30,
            Owner = "Incident Commander",
            Notes = "Major incidents, outages, data loss and security incidents."
        },
        new()
        {
            Key = "knowledge-base",
            Name = "Knowledge Base",
            Category = "knowledge-base",
            Priority = "Low",
            Impact = "Low",
            Urgency = "Low",
            ResponseHours = 48,
            ResolutionHours = 120,
            EscalationMinutes = 1440,
            Owner = "Knowledge Team",
            Notes = "Article creation, updates and access requests."
        },
        new()
        {
            Key = "service-request",
            Name = "Service Requests",
            Category = "service-request",
            Priority = "Medium",
            Impact = "Medium",
            Urgency = "Medium",
            ResponseHours = 8,
            ResolutionHours = 24,
            EscalationMinutes = 240,
            Owner = "Fulfillment Team",
            Notes = "Equipment, software, onboarding and workspace requests."
        },
        new()
        {
            Key = "software-licensing",
            Name = "Software Licensing",
            Category = "software-licensing",
            Priority = "Medium",
            Impact = "Medium",
            Urgency = "Medium",
            ResponseHours = 8,
            ResolutionHours = 24,
            EscalationMinutes = 240,
            Owner = "Software Asset Team",
            Notes = "New, renew, transfer, revoke and audit licenses."
        }
    };

    private static List<SlaPriorityDto> BuildPriorities() => new()
    {
        new()
        {
            Key = "urgent",
            Label = "Urgent",
            Impact = "Critical",
            Urgency = "Immediate",
            ResponseHours = 1,
            ResolutionHours = 4,
            EscalationMinutes = 30,
            Description = "Business critical incidents that stop work or affect many users."
        },
        new()
        {
            Key = "high",
            Label = "High",
            Impact = "High",
            Urgency = "High",
            ResponseHours = 2,
            ResolutionHours = 8,
            EscalationMinutes = 120,
            Description = "Important issues with significant impact but limited scope."
        },
        new()
        {
            Key = "medium",
            Label = "Medium",
            Impact = "Medium",
            Urgency = "Medium",
            ResponseHours = 8,
            ResolutionHours = 24,
            EscalationMinutes = 240,
            Description = "Standard operational tickets and service requests."
        },
        new()
        {
            Key = "low",
            Label = "Low",
            Impact = "Low",
            Urgency = "Low",
            ResponseHours = 24,
            ResolutionHours = 72,
            EscalationMinutes = 480,
            Description = "Minor requests and work that can be scheduled."
        }
    };

    private static List<SlaEscalationDto> BuildEscalations() => new()
    {
        new()
        {
            Level = "L1",
            Trigger = "Initial assignment / no response",
            Action = "Notify service desk and keep on queue",
            Owner = "Service Desk",
            TriggerMinutes = 30,
            Route = "/ticket-management-center"
        },
        new()
        {
            Level = "L2",
            Trigger = "High priority still open",
            Action = "Escalate to specialist queue",
            Owner = "Team Lead",
            TriggerMinutes = 120,
            Route = "/ticket-details"
        },
        new()
        {
            Level = "L3",
            Trigger = "SLA risk / critical outage",
            Action = "Notify incident manager and start bridge",
            Owner = "Incident Manager",
            TriggerMinutes = 240,
            Route = "/incident-management-workflow"
        },
        new()
        {
            Level = "L4",
            Trigger = "Breach or executive impact",
            Action = "Escalate to management and executive dashboard",
            Owner = "IT Service Manager",
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
            Status = ticket.Status,
            Category = ticket.Category,
            Subcategory = ticket.Subcategory,
            PolicyName = policy.Name,
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
}
