using Microsoft.AspNetCore.Mvc;
using ITSMBackend.Services;
using ITSMBackend.Models;

namespace ITSMBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ManageEngineController : ControllerBase
    {
        private readonly ManageEngineService _manageEngineService;
        private readonly TicketService _ticketService;
        private readonly ILogger<ManageEngineController> _logger;

        public ManageEngineController(
            ManageEngineService manageEngineService,
            TicketService ticketService,
            ILogger<ManageEngineController> logger)
        {
            _manageEngineService = manageEngineService;
            _ticketService = ticketService;
            _logger = logger;
        }

        [HttpPost("sync")]
        public async Task<IActionResult> SyncIncidents()
        {
            try
            {
                _logger.LogInformation("Starting ManageEngine incident sync");

                var manageEngineIncidents = await _manageEngineService.GetIncidentsAsync();
                var syncedCount = 0;

                foreach (var meIncident in manageEngineIncidents)
                {
                    // Check if incident already exists
                    var existingTicket = await _ticketService.GetTicketByExternalIdAsync(meIncident.Id, "ManageEngine");

                    if (existingTicket == null)
                    {
                        // Create new ticket from ManageEngine incident
                        var ticket = new Ticket
                        {
                            Title = meIncident.Title,
                            Description = meIncident.Description,
                            Status = MapManageEngineStatus(meIncident.Status),
                            Priority = MapManageEnginePriority(meIncident.Priority),
                            // AssignedTo = meIncident.Technician?.Name, // Cannot assign string to User entity
                            CreatedAt = meIncident.CreatedTime,
                            UpdatedAt = meIncident.UpdatedTime,
                            ExternalId = meIncident.Id,
                            ExternalSystem = "ManageEngine",
                            Category = meIncident.Category,
                            Subcategory = meIncident.Subcategory
                        };

                        await _ticketService.CreateTicketAsync(ticket);
                        syncedCount++;
                    }
                    else
                    {
                        // Update existing ticket
                        existingTicket.Status = MapManageEngineStatus(meIncident.Status);
                        existingTicket.Priority = MapManageEnginePriority(meIncident.Priority);
                        // existingTicket.AssignedTo = meIncident.Technician?.Name; // Cannot assign string to User entity
                        existingTicket.UpdatedAt = meIncident.UpdatedTime;

                        await _ticketService.UpdateTicketAsync(existingTicket);
                        syncedCount++;
                    }
                }

                return Ok(new { message = $"Synced {syncedCount} incidents from ManageEngine" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during ManageEngine sync");
                return StatusCode(500, new { error = "Sync failed", details = ex.Message });
            }
        }

        [HttpPost("test-connection")]
        public async Task<IActionResult> TestConnection()
        {
            try
            {
                var isConnected = await _manageEngineService.TestConnectionAsync();

                if (isConnected)
                {
                    return Ok(new { status = "connected", message = "Successfully connected to ManageEngine" });
                }
                else
                {
                    return BadRequest(new { status = "failed", message = "Could not connect to ManageEngine" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing ManageEngine connection");
                return StatusCode(500, new { error = "Connection test failed", details = ex.Message });
            }
        }

        [HttpGet("incidents")]
        public async Task<IActionResult> GetIncidents(
            [FromQuery] string? status = null,
            [FromQuery] string? priority = null,
            [FromQuery] DateTime? since = null)
        {
            try
            {
                var incidents = await _manageEngineService.GetIncidentsAsync(status, priority, since);
                return Ok(incidents);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching incidents from ManageEngine");
                return StatusCode(500, new { error = "Failed to fetch incidents", details = ex.Message });
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
}