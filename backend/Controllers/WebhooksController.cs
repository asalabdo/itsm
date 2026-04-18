using Microsoft.AspNetCore.Mvc;
using ITSMBackend.Services;
using ITSMBackend.Models;

namespace ITSMBackend.Controllers
{
    [ApiController]
    [Route("api/webhooks")]
    public class WebhooksController : ControllerBase
    {
        private readonly ManageEngineService _manageEngineService;
        private readonly TicketService _ticketService;
        private readonly ILogger<WebhooksController> _logger;

        public WebhooksController(
            ManageEngineService manageEngineService,
            TicketService ticketService,
            ILogger<WebhooksController> logger)
        {
            _manageEngineService = manageEngineService;
            _ticketService = ticketService;
            _logger = logger;
        }

        [HttpPost("manageengine")]
        public async Task<IActionResult> ManageEngineWebhook([FromBody] ManageEngineWebhookPayload payload)
        {
            try
            {
                if (payload == null)
                {
                    return BadRequest(new { error = "Payload is required" });
                }

                var signature = Request.Headers["X-ManageEngine-Signature"].FirstOrDefault();
                var requestBody = System.Text.Json.JsonSerializer.Serialize(payload);

                var isValidSignature = await _manageEngineService.ValidateWebhookSignatureAsync(signature, requestBody);
                if (!isValidSignature)
                {
                    _logger.LogWarning("Invalid webhook signature received");
                    return Unauthorized(new { error = "Invalid signature" });
                }

                _logger.LogInformation("Received ManageEngine webhook: {EventType} for incident {IncidentId}",
                    payload.EventType, payload.Incident?.Id);

                // Process the webhook based on event type
                switch (payload.EventType?.ToLower())
                {
                    case "incident_created":
                    case "incident_updated":
                        await ProcessIncidentUpdateAsync(payload.Incident);
                        break;

                    case "incident_closed":
                        await ProcessIncidentClosureAsync(payload.Incident);
                        break;

                    default:
                        _logger.LogInformation("Unhandled webhook event type: {EventType}", payload.EventType);
                        break;
                }

                return Ok(new { status = "processed" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing ManageEngine webhook");
                return StatusCode(500, new { error = "Webhook processing failed", details = ex.Message });
            }
        }

        private async Task ProcessIncidentUpdateAsync(ManageEngineIncident? incident)
        {
            if (incident == null || string.IsNullOrWhiteSpace(incident.Id)) return;

            // Find existing ticket by external ID
            var existingTicket = await _ticketService.GetTicketByExternalIdAsync(incident.Id, "ManageEngine-ServiceDesk");

            if (existingTicket == null)
            {
                // Create new ticket
                var ticket = new Ticket
                {
                    Title = incident.Title ?? $"ManageEngine Incident {incident.Id}",
                    Description = incident.Description ?? string.Empty,
                    Priority = MapManageEnginePriority(incident.Priority),
                    Status = MapManageEngineStatus(incident.Status),
                    Category = incident.Category ?? "Service Request",
                    Subcategory = incident.Subcategory ?? string.Empty,
                    ExternalId = incident.Id,
                    ExternalSystem = "ManageEngine-ServiceDesk",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _ticketService.CreateTicketAsync(ticket);
                _logger.LogInformation("Created new ticket from ManageEngine webhook: {TicketId}", ticket.Id);
            }
            else
            {
                // Update existing ticket
                existingTicket.Status = MapManageEngineStatus(incident.Status);
                existingTicket.Priority = MapManageEnginePriority(incident.Priority);
                // existingTicket.AssignedTo = incident.Technician?.Name; // Cannot assign string to User entity
                existingTicket.UpdatedAt = incident.UpdatedTime;

                await _ticketService.UpdateTicketAsync(existingTicket);
                _logger.LogInformation("Updated ticket from ManageEngine webhook: {TicketId}", existingTicket.Id);
            }
        }

        private async Task ProcessIncidentClosureAsync(ManageEngineIncident? incident)
        {
            if (incident == null || string.IsNullOrWhiteSpace(incident.Id)) return;

            var existingTicket = await _ticketService.GetTicketByExternalIdAsync(incident.Id, "ManageEngine-ServiceDesk");

            if (existingTicket != null)
            {
                existingTicket.Status = "Closed";
                existingTicket.UpdatedAt = DateTime.UtcNow;

                await _ticketService.UpdateTicketAsync(existingTicket);
                _logger.LogInformation("Closed ticket from ManageEngine webhook: {TicketId}", existingTicket.Id);
            }
        }

        private string MapManageEngineStatus(string? meStatus)
        {
            return meStatus?.ToLower() switch
            {
                "open" => "New",
                "in progress" => "In Progress",
                "resolved" => "Resolved",
                "closed" => "Closed",
                _ => "New"
            };
        }

        private string MapManageEnginePriority(string? mePriority)
        {
            return mePriority?.ToLower() switch
            {
                "low" => "Low",
                "medium" => "Medium",
                "high" => "High",
                "urgent" => "Critical",
                _ => "Medium"
            };
        }
    }

    public class ManageEngineWebhookPayload
    {
        public string? EventType { get; set; }
        public ManageEngineIncident? Incident { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
