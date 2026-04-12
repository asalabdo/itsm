using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ITSMBackend.Data;
using ITSMBackend.Models;

namespace ITSMBackend.Services;

public interface IWorkflowRoutingService
{
    Task RouteTicketAsync(Ticket ticket, int actorUserId, string? sourceSystem = null);
    Task RouteServiceRequestAsync(ServiceRequest request, int actorUserId, string? sourceSystem = null);
}

public class WorkflowRoutingService : IWorkflowRoutingService
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<WorkflowRoutingService> _logger;

    public WorkflowRoutingService(
        ApplicationDbContext context,
        IHttpClientFactory httpClientFactory,
        ILogger<WorkflowRoutingService> logger)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task RouteTicketAsync(Ticket ticket, int actorUserId, string? sourceSystem = null)
    {
        var requester = await ResolveUserAsync(ticket.RequestedById);
        var serviceKey = WorkflowRoutingRules.NormalizeKey(WorkflowRoutingRules.GetTicketServiceKey(ticket));
        var organizationKey = WorkflowRoutingRules.NormalizeKey(requester?.Department);
        var subject = new WorkflowSubject(
            EntityKind: "Ticket",
            ServiceKey: serviceKey,
            OrganizationKey: organizationKey,
            ReferenceId: ticket.TicketNumber,
            Title: ticket.Title,
            Priority: ticket.Priority,
            ActorUserId: actorUserId,
            SourceSystem: sourceSystem);

        await ExecuteAsync(subject);
    }

    public async Task RouteServiceRequestAsync(ServiceRequest request, int actorUserId, string? sourceSystem = null)
    {
        var requester = await ResolveUserAsync(request.RequestedById);
        var catalogItem = request.CatalogItemId.HasValue
            ? await _context.ServiceCatalogItems.FirstOrDefaultAsync(item => item.Id == request.CatalogItemId.Value)
            : null;

        var serviceKey = WorkflowRoutingRules.NormalizeKey(WorkflowRoutingRules.GetServiceRequestServiceKey(request, catalogItem));
        var organizationKey = WorkflowRoutingRules.NormalizeKey(requester?.Department);
        var subject = new WorkflowSubject(
            EntityKind: "ServiceRequest",
            ServiceKey: serviceKey,
            OrganizationKey: organizationKey,
            ReferenceId: request.RequestNumber,
            Title: request.Title,
            Priority: request.Priority,
            ActorUserId: actorUserId,
            SourceSystem: sourceSystem);

        await ExecuteAsync(subject);
    }

    private async Task ExecuteAsync(WorkflowSubject subject)
    {
        var workflow = await ResolveOrCreateWorkflowAsync(subject);
        var instance = await CreateInstanceAsync(workflow, subject);
        await NotifyRecipientsAsync(workflow, instance, subject);
        await DispatchIntegrationsAsync(subject, workflow, instance);
    }

    private async Task<Workflow> ResolveOrCreateWorkflowAsync(WorkflowSubject subject)
    {
        var workflow = await _context.Workflows
            .Include(w => w.Steps)
            .OrderByDescending(w => w.CreatedAt)
            .FirstOrDefaultAsync(w =>
                w.Status == "Published" &&
                (w.TriggerType == subject.EntityKind || string.Equals(w.TriggerType, "Both", StringComparison.OrdinalIgnoreCase)) &&
                WorkflowRoutingRules.MatchesWorkflowDefinition(w.WorkflowDefinition, subject.EntityKind, subject.ServiceKey, subject.OrganizationKey));

        if (workflow != null)
        {
            if (!workflow.Steps.Any())
            {
                await EnsureWorkflowStepsAsync(workflow, subject);
            }

            return workflow;
        }

        workflow = new Workflow
        {
            Name = $"{subject.EntityKind} {subject.ServiceKey} {subject.OrganizationKey} Workflow",
            Description = $"Auto-generated workflow for {subject.EntityKind.ToLowerInvariant()}s in {subject.OrganizationKey} using {subject.ServiceKey}",
            Status = "Published",
            CreatedById = subject.ActorUserId > 0 ? subject.ActorUserId : 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            TriggerType = subject.EntityKind,
            Version = 1,
            WorkflowDefinition = WorkflowRoutingRules.BuildWorkflowDefinition(
                subject.EntityKind,
                subject.ServiceKey,
                subject.OrganizationKey,
                BuildStepDefinitions(subject))
        };

        _context.Workflows.Add(workflow);
        await _context.SaveChangesAsync();

        await EnsureWorkflowStepsAsync(workflow, subject);
        return workflow;
    }

    private async Task EnsureWorkflowStepsAsync(Workflow workflow, WorkflowSubject subject)
    {
        if (await _context.WorkflowSteps.AnyAsync(step => step.WorkflowId == workflow.Id))
        {
            return;
        }

        var definitions = BuildStepDefinitions(subject);
        for (var index = 0; index < definitions.Count; index++)
        {
            var step = definitions[index];
            _context.WorkflowSteps.Add(new WorkflowStep
            {
                WorkflowId = workflow.Id,
                StepName = step.StepName,
                StepType = step.StepType,
                StepOrder = index + 1,
                StepConfiguration = step.StepConfiguration
            });
        }

        await _context.SaveChangesAsync();

        await _context.Entry(workflow).Collection(w => w.Steps).LoadAsync();
    }

    private async Task<WorkflowInstance> CreateInstanceAsync(Workflow workflow, WorkflowSubject subject)
    {
        var existing = await _context.WorkflowInstances
            .FirstOrDefaultAsync(instance =>
                instance.WorkflowId == workflow.Id &&
                instance.ReferenceId == subject.ReferenceId &&
                instance.Status == "Active");

        if (existing != null)
        {
            return existing;
        }

        var instance = new WorkflowInstance
        {
            WorkflowId = workflow.Id,
            TriggeredById = subject.ActorUserId > 0 ? subject.ActorUserId : null,
            Status = "Active",
            StartedAt = DateTime.UtcNow,
            ReferenceId = subject.ReferenceId
        };

        _context.WorkflowInstances.Add(instance);
        await _context.SaveChangesAsync();

        await _context.Entry(instance).Reference(i => i.Workflow).LoadAsync();
        await _context.Entry(instance.Workflow).Collection(w => w.Steps).LoadAsync();

        foreach (var step in instance.Workflow.Steps.OrderBy(step => step.StepOrder))
        {
            var recipients = await ResolveRecipientsAsync(subject, step);
            var assignedToId = recipients.FirstOrDefault()?.Id;

            _context.WorkflowInstanceSteps.Add(new WorkflowInstanceStep
            {
                InstanceId = instance.Id,
                StepId = step.Id,
                Status = recipients.Any() ? "InProgress" : "Pending",
                AssignedToId = assignedToId,
                StartedAt = recipients.Any() ? DateTime.UtcNow : null
            });
        }

        await _context.SaveChangesAsync();

        return instance;
    }

    private async Task NotifyRecipientsAsync(Workflow workflow, WorkflowInstance instance, WorkflowSubject subject)
    {
        foreach (var step in workflow.Steps.OrderBy(step => step.StepOrder))
        {
            var recipients = await ResolveRecipientsAsync(subject, step);
            if (!recipients.Any())
            {
                continue;
            }

            var notifications = recipients.Select(recipient => new Notification
            {
                UserId = recipient.Id,
                Title = $"{subject.EntityKind} workflow step assigned",
                Message = $"{subject.Title} ({subject.ReferenceId}) is waiting on '{step.StepName}' in {subject.OrganizationKey}.",
                Type = step.StepType == "Approval" ? "Warning" : "Info",
                Link = subject.EntityKind == "Ticket" ? "/tickets" : "/service-requests",
                CreatedAt = DateTime.UtcNow
            }).ToList();

            _context.Notifications.AddRange(notifications);
        }

        await _context.SaveChangesAsync();
    }

    private async Task DispatchIntegrationsAsync(WorkflowSubject subject, Workflow workflow, WorkflowInstance instance)
    {
        var eventType = subject.EntityKind == "Ticket" ? "TicketSubmitted" : "ServiceRequestSubmitted";
        var integrations = await _context.ExternalIntegrations
            .Where(integration => integration.IsEnabled)
            .ToListAsync();

        foreach (var integration in integrations)
        {
            if (!ShouldDispatch(integration, eventType, subject.SourceSystem))
            {
                continue;
            }

            var payload = new
            {
                eventType,
                entityKind = subject.EntityKind,
                workflowId = workflow.Id,
                workflowInstanceId = instance.Id,
                referenceId = subject.ReferenceId,
                serviceKey = subject.ServiceKey,
                organizationKey = subject.OrganizationKey,
                title = subject.Title,
                priority = subject.Priority,
                sourceSystem = subject.SourceSystem,
                createdAt = DateTime.UtcNow
            };

            var serializedPayload = JsonSerializer.Serialize(payload);

            try
            {
                var endpoint = ReadStringProperty(integration.ConfigurationJson, "endpoint");
                if (!string.IsNullOrWhiteSpace(endpoint))
                {
                    var client = _httpClientFactory.CreateClient(nameof(WorkflowRoutingService));
                    using var request = new HttpRequestMessage(HttpMethod.Post, endpoint)
                    {
                        Content = new StringContent(serializedPayload, Encoding.UTF8, "application/json")
                    };

                    using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
                    using var response = await client.SendAsync(request, cts.Token);
                    var responseBody = await response.Content.ReadAsStringAsync(cts.Token);

                    _context.IntegrationLogs.Add(new IntegrationLog
                    {
                        IntegrationId = integration.Id,
                        EventType = eventType,
                        Status = response.IsSuccessStatusCode ? "Success" : "Failed",
                        RequestPayload = serializedPayload,
                        ResponsePayload = responseBody,
                        CreatedAt = DateTime.UtcNow
                    });

                    if (response.IsSuccessStatusCode)
                    {
                        integration.LastSyncAt = DateTime.UtcNow;
                    }
                }
                else
                {
                    _context.IntegrationLogs.Add(new IntegrationLog
                    {
                        IntegrationId = integration.Id,
                        EventType = eventType,
                        Status = "Success",
                        RequestPayload = serializedPayload,
                        ResponsePayload = "Queued locally because no endpoint was configured.",
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to dispatch {EventType} to integration {IntegrationId}", eventType, integration.Id);
                _context.IntegrationLogs.Add(new IntegrationLog
                {
                    IntegrationId = integration.Id,
                    EventType = eventType,
                    Status = "Failed",
                    RequestPayload = serializedPayload,
                    ResponsePayload = ex.Message,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        await _context.SaveChangesAsync();
    }

    private async Task<List<User>> ResolveRecipientsAsync(WorkflowSubject subject, WorkflowStep step)
    {
        var configuration = ReadStepConfiguration(step.StepConfiguration);
        var targetRoles = configuration.TargetRoles.Any()
            ? configuration.TargetRoles
            : GetDefaultRoles(subject, step);
        var parsedRoles = WorkflowRoutingRules.ParseRoles(targetRoles);

        var query = _context.Users.Where(user => user.IsActive);

        if (!string.IsNullOrWhiteSpace(subject.OrganizationKey))
        {
            query = query.Where(user => user.Department == subject.OrganizationKey);
        }

        if (parsedRoles.Any())
        {
            query = query.Where(user => parsedRoles.Contains(user.Role));
        }

        var recipients = await query
            .OrderBy(user => user.Role == UserRole.Manager ? 0 : 1)
            .ThenBy(user => user.FirstName)
            .ToListAsync();

        if (recipients.Any())
        {
            return recipients;
        }

        return await _context.Users
            .Where(user => user.IsActive && (user.Role == UserRole.Manager || user.Role == UserRole.Administrator))
            .OrderBy(user => user.Role == UserRole.Manager ? 0 : 1)
            .ThenBy(user => user.FirstName)
            .ToListAsync();
    }

    private static List<string> GetDefaultRoles(WorkflowSubject subject, WorkflowStep step)
    {
        if (string.Equals(step.StepType, "Approval", StringComparison.OrdinalIgnoreCase))
        {
            return new List<string> { UserRole.Manager.ToString(), UserRole.Administrator.ToString() };
        }

        if (subject.EntityKind == "ServiceRequest")
        {
            return new List<string> { UserRole.Technician.ToString(), UserRole.Manager.ToString() };
        }

        return new List<string> { UserRole.Technician.ToString(), UserRole.Manager.ToString() };
    }

    private static bool ShouldDispatch(ExternalIntegration integration, string eventType, string? sourceSystem)
    {
        if (!string.IsNullOrWhiteSpace(sourceSystem) &&
            string.Equals(integration.Provider, sourceSystem, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        if (string.IsNullOrWhiteSpace(integration.EventSubscriptions) || integration.EventSubscriptions == "[]")
        {
            return true;
        }

        try
        {
            var subscriptions = JsonSerializer.Deserialize<List<string>>(integration.EventSubscriptions) ?? [];
            return subscriptions.Any(subscription =>
                string.Equals(subscription, "*", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(subscription, eventType, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(subscription, "WorkflowSubmitted", StringComparison.OrdinalIgnoreCase));
        }
        catch
        {
            return true;
        }
    }

    private static List<WorkflowStepTemplate> BuildStepDefinitions(WorkflowSubject subject)
    {
        return WorkflowRoutingRules.BuildStepDefinitions(subject.EntityKind, subject.Priority);
    }

    private async Task<User?> ResolveUserAsync(int? userId)
    {
        if (!userId.HasValue || userId.Value <= 0)
        {
            return await _context.Users.FirstOrDefaultAsync(user => user.IsActive);
        }

        return await _context.Users.FirstOrDefaultAsync(user => user.Id == userId.Value && user.IsActive);
    }

    private static WorkflowStepConfiguration ReadStepConfiguration(string? stepConfiguration)
    {
        if (string.IsNullOrWhiteSpace(stepConfiguration))
        {
            return new WorkflowStepConfiguration();
        }

        try
        {
            using var document = JsonDocument.Parse(stepConfiguration);
            var root = document.RootElement;

            return new WorkflowStepConfiguration
            {
                TargetRoles = WorkflowRoutingRules.ReadStringArray(root, "targetRoles"),
            };
        }
        catch
        {
            return new WorkflowStepConfiguration();
        }
    }

    private static List<UserRole> ParseRoles(IEnumerable<string> roleNames)
    {
        var roles = new List<UserRole>();

        foreach (var roleName in roleNames)
        {
            if (Enum.TryParse<UserRole>(roleName, true, out var parsedRole))
            {
                roles.Add(parsedRole);
            }
        }

        return roles.Distinct().ToList();
    }

    private static string? ReadStringProperty(string configurationJson, string propertyName)
    {
        if (string.IsNullOrWhiteSpace(configurationJson))
        {
            return null;
        }

        try
        {
            using var document = JsonDocument.Parse(configurationJson);
            return WorkflowRoutingRules.ReadStringProperty(document.RootElement, propertyName);
        }
        catch
        {
            return null;
        }
    }

    private sealed record WorkflowSubject(
        string EntityKind,
        string ServiceKey,
        string OrganizationKey,
        string ReferenceId,
        string Title,
        string Priority,
        int ActorUserId,
        string? SourceSystem);
    private sealed class WorkflowStepConfiguration
    {
        public List<string> TargetRoles { get; set; } = [];
    }
}
