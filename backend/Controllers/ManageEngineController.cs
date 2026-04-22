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
        private readonly IAssetService _assetService;
        private readonly ILogger<ManageEngineController> _logger;

        public ManageEngineController(
            ManageEngineService manageEngineService,
            TicketService ticketService,
            IAssetService assetService,
            ILogger<ManageEngineController> logger)
        {
            _manageEngineService = manageEngineService;
            _ticketService = ticketService;
            _assetService = assetService;
            _logger = logger;
        }

        [HttpPost("sync")]
        public async Task<IActionResult> SyncIncidents()
        {
            try
            {
                _logger.LogInformation("Starting ManageEngine operational sync");

                var operationalItems = await _manageEngineService.GetOperationalItemsAsync();
                var syncStatus = new ManageEngineSyncStatus
                {
                    LastSyncAt = DateTime.UtcNow,
                    Status = "success"
                };

                foreach (var item in operationalItems.Where(ShouldSyncToTicket))
                {
                    try
                    {
                        var externalSystem = GetExternalSystemKey(item);
                        var existingTicket = await _ticketService.GetTicketByExternalIdAsync(item.ExternalId, externalSystem);

                        if (existingTicket == null)
                        {
                            var ticket = new Ticket
                            {
                                Title = item.Name,
                                Description = item.Description,
                                Status = MapManageEngineStatus(item.Status),
                                Priority = MapManageEnginePriority(item.Priority),
                                CreatedAt = item.CreatedAt ?? DateTime.UtcNow,
                                UpdatedAt = item.UpdatedAt ?? item.CreatedAt ?? DateTime.UtcNow,
                                ExternalId = item.ExternalId,
                                ExternalSystem = externalSystem,
                                Category = MapManageEngineCategory(item),
                                Subcategory = item.ItemType
                            };

                            await _ticketService.CreateTicketAsync(ticket);
                            syncStatus.CreatedCount++;
                        }
                        else
                        {
                            existingTicket.Title = item.Name;
                            existingTicket.Description = item.Description;
                            existingTicket.Status = MapManageEngineStatus(item.Status);
                            existingTicket.Priority = MapManageEnginePriority(item.Priority);
                            existingTicket.UpdatedAt = item.UpdatedAt ?? DateTime.UtcNow;
                            existingTicket.Category = MapManageEngineCategory(item);
                            existingTicket.Subcategory = item.ItemType;

                            if (!string.IsNullOrWhiteSpace(item.Owner))
                            {
                                existingTicket.ResolutionNotes = $"External owner: {item.Owner}";
                            }

                            await _ticketService.UpdateTicketAsync(existingTicket);
                            syncStatus.UpdatedCount++;
                        }

                        if (string.Equals(item.Source, "ServiceDesk", StringComparison.OrdinalIgnoreCase))
                        {
                            syncStatus.ServiceDeskCount++;
                        }
                        else if (string.Equals(item.Source, "OpManager", StringComparison.OrdinalIgnoreCase))
                        {
                            syncStatus.OpManagerCount++;
                        }
                    }
                    catch (Exception itemEx)
                    {
                        syncStatus.FailedCount++;
                        syncStatus.Status = "partial";
                        _logger.LogWarning(itemEx, "Failed to sync ManageEngine item {Source}:{ExternalId}", item.Source, item.ExternalId);
                    }
                }

                syncStatus.Message = $"Imported {syncStatus.CreatedCount} and updated {syncStatus.UpdatedCount} tickets from ManageEngine.";
                if (syncStatus.FailedCount > 0)
                {
                    syncStatus.Message += $" {syncStatus.FailedCount} items failed.";
                }

                await _manageEngineService.UpdateSyncStatusAsync(syncStatus);

                return Ok(syncStatus);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during ManageEngine sync");
                await _manageEngineService.UpdateSyncStatusAsync(new ManageEngineSyncStatus
                {
                    LastSyncAt = DateTime.UtcNow,
                    Status = "error",
                    FailedCount = 1,
                    Message = $"Sync failed: {ex.Message}"
                });
                return StatusCode(500, new { error = "Sync failed", details = ex.Message });
            }
        }

        [HttpPost("test-connection")]
        public async Task<IActionResult> TestConnection()
        {
            try
            {
                var connectionStatus = await _manageEngineService.TestConnectionAsync();

                if (connectionStatus.Connected)
                {
                    return Ok(new
                    {
                        status = "connected",
                        message = "Successfully connected to ManageEngine",
                        serviceDeskConnected = connectionStatus.ServiceDeskConnected,
                        opManagerConnected = connectionStatus.OpManagerConnected
                    });
                }
                else
                {
                    return BadRequest(new
                    {
                        status = "failed",
                        message = "Could not connect to ManageEngine",
                        serviceDeskConnected = connectionStatus.ServiceDeskConnected,
                        opManagerConnected = connectionStatus.OpManagerConnected
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing ManageEngine connection");
                return StatusCode(500, new { error = "Connection test failed", details = ex.Message });
            }
        }

        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings()
        {
            try
            {
                var settings = await _manageEngineService.GetRuntimeSettingsAsync();
                return Ok(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching ManageEngine settings");
                return StatusCode(500, new { error = "Failed to fetch settings", details = ex.Message });
            }
        }

        [HttpPut("settings")]
        public async Task<IActionResult> UpdateSettings([FromBody] ManageEngineSettingsUpdateRequest request)
        {
            try
            {
                var settings = await _manageEngineService.SaveRuntimeSettingsAsync(request);
                return Ok(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating ManageEngine settings");
                return StatusCode(500, new { error = "Failed to update settings", details = ex.Message });
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

        [HttpGet("catalog")]
        public async Task<IActionResult> GetCatalog()
        {
            try
            {
                var catalog = await _manageEngineService.GetCatalogItemsAsync(BuildQueryOptions());
                return Ok(catalog);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching ManageEngine catalog data");
                return StatusCode(500, new { error = "Failed to fetch catalog data", details = ex.Message });
            }
        }

        [HttpGet("operations")]
        public async Task<IActionResult> GetOperations()
        {
            try
            {
                var operations = await _manageEngineService.GetOperationalItemsAsync(BuildQueryOptions());
                return Ok(operations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching ManageEngine operational data");
                return StatusCode(500, new { error = "Failed to fetch operational data", details = ex.Message });
            }
        }

        [HttpGet("unified")]
        public async Task<IActionResult> GetUnified()
        {
            try
            {
                var unified = await _manageEngineService.GetUnifiedDataAsync(BuildQueryOptions());
                return Ok(unified);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching unified ManageEngine data");
                return StatusCode(500, new { error = "Failed to fetch unified data", details = ex.Message });
            }
        }

        [HttpGet("sync-status")]
        public async Task<IActionResult> GetSyncStatus()
        {
            try
            {
                var syncStatus = await _manageEngineService.GetSyncStatusAsync();
                return Ok(syncStatus);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching ManageEngine sync status");
                return StatusCode(500, new { error = "Failed to fetch sync status", details = ex.Message });
            }
        }

        [HttpPost("assets/{assetId:int}/sync")]
        public async Task<IActionResult> SyncAssetToServiceDesk(int assetId)
        {
            try
            {
                var asset = await _assetService.GetAssetByIdAsync(assetId);
                if (asset == null)
                {
                    return NotFound(new { error = "Asset not found" });
                }

                var result = await _manageEngineService.SyncAssetToServiceDeskAsync(asset);
                if (!result.Created && result.Item == null)
                {
                    return StatusCode(502, result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing asset {AssetId} to ManageEngine ServiceDesk", assetId);
                return StatusCode(500, new { error = "Failed to sync asset to ManageEngine", details = ex.Message });
            }
        }

        private ManageEngineQueryOptions BuildQueryOptions()
        {
            return new ManageEngineQueryOptions
            {
                Source = Request.Query["source"].FirstOrDefault(),
                Type = Request.Query["type"].FirstOrDefault(),
                Status = Request.Query["status"].FirstOrDefault(),
                Search = Request.Query["search"].FirstOrDefault()
            };
        }

        private static bool ShouldSyncToTicket(ManageEngineNormalizedItem item)
        {
            return string.Equals(item.Source, "ServiceDesk", StringComparison.OrdinalIgnoreCase)
                && string.Equals(item.ItemType, "request", StringComparison.OrdinalIgnoreCase)
                || string.Equals(item.Source, "OpManager", StringComparison.OrdinalIgnoreCase)
                && string.Equals(item.ItemType, "alert", StringComparison.OrdinalIgnoreCase);
        }

        private static string GetExternalSystemKey(ManageEngineNormalizedItem item)
        {
            return string.Equals(item.Source, "ServiceDesk", StringComparison.OrdinalIgnoreCase)
                ? "ManageEngine-ServiceDesk"
                : "ManageEngine-OpManager";
        }

        private static string MapManageEngineCategory(ManageEngineNormalizedItem item)
        {
            if (!string.IsNullOrWhiteSpace(item.Category))
            {
                return item.Category;
            }

            return string.Equals(item.Source, "OpManager", StringComparison.OrdinalIgnoreCase)
                ? "Monitoring"
                : "Service Request";
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
