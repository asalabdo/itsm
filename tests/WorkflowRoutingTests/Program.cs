using System.Text.Json;
using ITSMBackend.Models;
using ITSMBackend.Services;

static void Assert(bool condition, string message)
{
    if (!condition)
    {
        throw new Exception(message);
    }
}

static void Run(string name, Action test)
{
    test();
    Console.WriteLine($"PASS {name}");
}

Run("ticket service key prefers subcategory", () =>
{
    var ticket = new Ticket { Category = "Hardware", Subcategory = "Laptop" };
    Assert(WorkflowRoutingRules.GetTicketServiceKey(ticket) == "Laptop", "Expected subcategory to win");
});

Run("service request service key prefers request type", () =>
{
    var request = new ServiceRequest { ServiceType = "VPN Access" };
    var catalog = new ServiceCatalogItem { Name = "Laptop" };
    Assert(WorkflowRoutingRules.GetServiceRequestServiceKey(request, catalog) == "VPN Access", "Expected request service type to win");
});

Run("workflow definition matches entity service and org", () =>
{
    var steps = WorkflowRoutingRules.BuildStepDefinitions("Ticket", "High");
    var definition = WorkflowRoutingRules.BuildWorkflowDefinition("Ticket", "vpn access", "finance", steps);

    Assert(WorkflowRoutingRules.MatchesWorkflowDefinition(definition, "Ticket", "vpn access", "finance"), "Expected workflow to match");
    Assert(!WorkflowRoutingRules.MatchesWorkflowDefinition(definition, "ServiceRequest", "vpn access", "finance"), "Expected entity kind mismatch");
});

Run("service request templates include manager review", () =>
{
    var steps = WorkflowRoutingRules.BuildStepDefinitions("ServiceRequest", "Medium");

    Assert(steps.Count == 2, "Expected two service request steps");
    Assert(steps[0].StepType == "Approval", "Expected first step to be approval");
    Assert(steps[0].TargetRoles.Contains(UserRole.Manager.ToString()), "Expected manager role in approval step");
});

var sampleDefinition = JsonSerializer.Serialize(new
{
    entityKinds = new[] { "Ticket" },
    serviceKey = "*",
    organizationKey = "finance"
});

Run("wildcard service key matches", () =>
{
    Assert(WorkflowRoutingRules.MatchesWorkflowDefinition(sampleDefinition, "Ticket", "anything", "finance"), "Expected wildcard service key to match");
});

Console.WriteLine("All workflow routing tests passed.");
