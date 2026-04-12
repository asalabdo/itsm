using System.Text.Json;
using ITSMBackend.Models;

namespace ITSMBackend.Services;

public static class WorkflowRoutingRules
{
    public static string NormalizeKey(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? string.Empty
            : value.Trim().ToLowerInvariant();
    }

    public static string GetTicketServiceKey(Ticket ticket)
    {
        if (!string.IsNullOrWhiteSpace(ticket.Subcategory))
        {
            return ticket.Subcategory;
        }

        if (!string.IsNullOrWhiteSpace(ticket.Category))
        {
            return ticket.Category;
        }

        return "General";
    }

    public static string GetServiceRequestServiceKey(ServiceRequest request, ServiceCatalogItem? catalogItem)
    {
        if (!string.IsNullOrWhiteSpace(request.ServiceType))
        {
            return request.ServiceType;
        }

        if (!string.IsNullOrWhiteSpace(catalogItem?.Name))
        {
            return catalogItem.Name;
        }

        return "General";
    }

    public static bool MatchesWorkflowDefinition(
        string? workflowDefinition,
        string entityKind,
        string serviceKey,
        string organizationKey)
    {
        if (string.IsNullOrWhiteSpace(workflowDefinition))
        {
            return false;
        }

        try
        {
            using var document = JsonDocument.Parse(workflowDefinition);
            var root = document.RootElement;

            var entityKinds = ReadStringArray(root, "entityKinds");
            if (entityKinds.Any() &&
                !entityKinds.Any(kind =>
                    string.Equals(kind, entityKind, StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(kind, "Both", StringComparison.OrdinalIgnoreCase)))
            {
                return false;
            }

            var definitionServiceKey = NormalizeKey(ReadStringProperty(root, "serviceKey"));
            var definitionOrganizationKey = NormalizeKey(ReadStringProperty(root, "organizationKey"));

            if (!string.IsNullOrWhiteSpace(definitionServiceKey) &&
                !string.Equals(definitionServiceKey, serviceKey, StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(definitionServiceKey, "*", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            if (!string.IsNullOrWhiteSpace(definitionOrganizationKey) &&
                !string.Equals(definitionOrganizationKey, organizationKey, StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(definitionOrganizationKey, "*", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            return true;
        }
        catch
        {
            return false;
        }
    }

    public static string BuildWorkflowDefinition(
        string entityKind,
        string serviceKey,
        string organizationKey,
        IEnumerable<WorkflowStepTemplate> steps)
    {
        var template = new
        {
            entityKinds = new[] { entityKind },
            serviceKey,
            organizationKey,
            managerFirst = true,
            integrationMode = "AfterSubmit",
            steps = steps.Select(step => new
            {
                step.StepName,
                step.StepType,
                step.TargetRoles,
                step.StepConfiguration
            })
        };

        return JsonSerializer.Serialize(template);
    }

    public static List<WorkflowStepTemplate> BuildStepDefinitions(string entityKind, string priority)
    {
        if (entityKind == "ServiceRequest")
        {
            return new List<WorkflowStepTemplate>
            {
                new(
                    "Manager Review",
                    "Approval",
                    new[] { UserRole.Manager.ToString(), UserRole.Administrator.ToString() },
                    "{\"managerFirst\":true}"),
                new(
                    "Service Team Fulfillment",
                    "Assignment",
                    new[] { UserRole.Technician.ToString(), UserRole.Manager.ToString() },
                    "{\"fanOut\":true}")
            };
        }

        if (priority.Equals("Critical", StringComparison.OrdinalIgnoreCase) ||
            priority.Equals("High", StringComparison.OrdinalIgnoreCase))
        {
            return new List<WorkflowStepTemplate>
            {
                new(
                    "Manager Review",
                    "Approval",
                    new[] { UserRole.Manager.ToString(), UserRole.Administrator.ToString() },
                    "{\"managerFirst\":true}"),
                new(
                    "ERP Team Assignment",
                    "Assignment",
                    new[] { UserRole.Technician.ToString(), UserRole.Manager.ToString() },
                    "{\"fanOut\":true}")
            };
        }

        return new List<WorkflowStepTemplate>
        {
            new(
                "ERP Team Assignment",
                "Assignment",
                new[] { UserRole.Technician.ToString(), UserRole.Manager.ToString() },
                "{\"fanOut\":true}")
        };
    }

    public static List<UserRole> ParseRoles(IEnumerable<string> roleNames)
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

    public static List<string> ReadStringArray(JsonElement element, string propertyName)
    {
        if (element.ValueKind != JsonValueKind.Object ||
            !element.TryGetProperty(propertyName, out var property) ||
            property.ValueKind != JsonValueKind.Array)
        {
            return [];
        }

        var items = new List<string>();
        foreach (var value in property.EnumerateArray())
        {
            if (value.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(value.GetString()))
            {
                items.Add(value.GetString()!);
            }
        }

        return items;
    }

    public static string? ReadStringProperty(JsonElement element, string propertyName)
    {
        if (element.ValueKind != JsonValueKind.Object || !element.TryGetProperty(propertyName, out var property))
        {
            return null;
        }

        return property.ValueKind == JsonValueKind.String ? property.GetString() : property.ToString();
    }
}

public sealed record WorkflowStepTemplate(string StepName, string StepType, string[] TargetRoles, string StepConfiguration);
