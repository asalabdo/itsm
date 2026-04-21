using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using ITSMBackend.Data;
using ITSMBackend.Models;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;

namespace ITSMBackend.Services
{
    public class ManageEngineSourceSettings
    {
        public string Profile { get; set; } = string.Empty;
        public string BaseUrl { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
        public string TechnicianKey { get; set; } = string.Empty;
        public string AuthMode { get; set; } = string.Empty;
        public string PortalId { get; set; } = string.Empty;
        public string ApiKeyHeaderName { get; set; } = string.Empty;
        public string ApiKeyQueryName { get; set; } = string.Empty;
        public string TechnicianHeaderName { get; set; } = string.Empty;
        public string CatalogEndpoint { get; set; } = string.Empty;
        public string RequestsEndpoint { get; set; } = string.Empty;
        public string ServicesEndpoint { get; set; } = string.Empty;
        public string AlertsEndpoint { get; set; } = string.Empty;
    }

    public class ManageEngineSettings
    {
        public string BaseUrl { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
        public string TechnicianKey { get; set; } = string.Empty;
        public bool SyncEnabled { get; set; } = false;
        public string SyncDirection { get; set; } = "import";
        public int SyncIntervalMinutes { get; set; } = 15;
        public string WebhookSecret { get; set; } = string.Empty;
        public Dictionary<string, string> FieldMappings { get; set; } = new();
        public ManageEngineSourceSettings ServiceDesk { get; set; } = new();
        public ManageEngineSourceSettings OpManager { get; set; } = new();
    }

    public class ManageEngineNormalizedItem
    {
        public string Source { get; set; } = string.Empty;
        public string ItemType { get; set; } = string.Empty;
        public string ExternalId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Owner { get; set; } = string.Empty;
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string ExternalUrl { get; set; } = string.Empty;
        public Dictionary<string, string> Metadata { get; set; } = new();
    }

    public class ManageEngineUnifiedData
    {
        public List<ManageEngineNormalizedItem> Catalog { get; set; } = new();
        public List<ManageEngineNormalizedItem> Operations { get; set; } = new();
        public Dictionary<string, int> Summary { get; set; } = new();
    }

    public class ManageEngineQueryOptions
    {
        public string? Source { get; set; }
        public string? Type { get; set; }
        public string? Status { get; set; }
        public string? Search { get; set; }
    }

    public class ManageEngineSyncStatus
    {
        public DateTime? LastSyncAt { get; set; }
        public string Status { get; set; } = "idle";
        public int CreatedCount { get; set; }
        public int UpdatedCount { get; set; }
        public int FailedCount { get; set; }
        public int ServiceDeskCount { get; set; }
        public int OpManagerCount { get; set; }
        public string Message { get; set; } = "No sync has been run yet.";
    }

    public class ManageEngineRuntimeSettings
    {
        public bool SyncEnabled { get; set; }
        public string SyncDirection { get; set; } = "import";
        public int SyncIntervalMinutes { get; set; } = 15;
        public string WebhookSecret { get; set; } = string.Empty;
        public ManageEngineSourceSettings ServiceDesk { get; set; } = new();
        public ManageEngineSourceSettings OpManager { get; set; } = new();
    }

    public class ManageEngineSettingsUpdateRequest
    {
        public bool SyncEnabled { get; set; }
        public string SyncDirection { get; set; } = "import";
        public int SyncIntervalMinutes { get; set; } = 15;
        public string WebhookSecret { get; set; } = string.Empty;
        public ManageEngineSourceSettings ServiceDesk { get; set; } = new();
        public ManageEngineSourceSettings OpManager { get; set; } = new();
    }

    internal class ManageEngineCoreSettings
    {
        public bool SyncEnabled { get; set; }
        public string SyncDirection { get; set; } = "import";
        public int SyncIntervalMinutes { get; set; } = 15;
        public string WebhookSecret { get; set; } = string.Empty;
    }

    public class ManageEngineService
    {
        private static readonly JsonSerializerOptions SerializerOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };

        private readonly HttpClient _httpClient;
        private readonly ManageEngineSettings _settings;
        private readonly ILogger<ManageEngineService> _logger;
        private readonly ApplicationDbContext _context;
        private static ManageEngineSyncStatus _syncStatus = new();

        public ManageEngineService(
            HttpClient httpClient,
            ApplicationDbContext context,
            IOptions<ManageEngineSettings> settings,
            ILogger<ManageEngineService> logger)
        {
            _httpClient = httpClient;
            _context = context;
            _settings = settings.Value;
            _logger = logger;
            _httpClient.DefaultRequestHeaders.Accept.Clear();
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        public async Task<ManageEngineConnectionStatus> TestConnectionAsync()
        {
            var serviceDesk = await BuildServiceDeskSettingsAsync();
            var opManager = await BuildOpManagerSettingsAsync();

            var serviceDeskConnected = await TestServiceDeskConnectionAsync(serviceDesk);
            var opManagerConnected = await TestOpManagerConnectionAsync(opManager);

            return new ManageEngineConnectionStatus
            {
                ServiceDeskConnected = serviceDeskConnected,
                OpManagerConnected = opManagerConnected
            };
        }

        public async Task<IEnumerable<ManageEngineIncident>> GetIncidentsAsync(
            string? status = null,
            string? priority = null,
            DateTime? since = null)
        {
            var serviceDesk = await BuildServiceDeskSettingsAsync();
            var query = BuildServiceDeskRequestListQuery(serviceDesk, status, priority, since);

            var document = await GetJsonDocumentAsync(serviceDesk, serviceDesk.RequestsEndpoint, query, ManageEngineAuthMode.ServiceDesk);
            if (document == null)
            {
                return Enumerable.Empty<ManageEngineIncident>();
            }

            return ExtractArray(document.RootElement)
                .Select(MapIncident)
                .Where(incident => !string.IsNullOrWhiteSpace(incident.Id))
                .ToList();
        }

        public async Task<List<ManageEngineNormalizedItem>> GetCatalogItemsAsync(ManageEngineQueryOptions? options = null)
        {
            var serviceDeskCatalog = await GetServiceDeskCatalogItemsAsync();
            var opManagerServices = await GetOpManagerServicesAsync();

            return ApplyFilters(serviceDeskCatalog
                .Concat(opManagerServices)
                .OrderBy(item => item.Source)
                .ThenBy(item => item.Category)
                .ThenBy(item => item.Name)
                .ToList(), options);
        }

        public async Task<List<ManageEngineNormalizedItem>> GetOperationalItemsAsync(ManageEngineQueryOptions? options = null)
        {
            var requests = await GetServiceDeskOperationalItemsAsync();
            var alerts = await GetOpManagerAlertItemsAsync();

            return ApplyFilters(requests
                .Concat(alerts)
                .OrderByDescending(item => item.UpdatedAt ?? item.CreatedAt ?? DateTime.MinValue)
                .ThenBy(item => item.Source)
                .ToList(), options);
        }

        public async Task<ManageEngineUnifiedData> GetUnifiedDataAsync(ManageEngineQueryOptions? options = null)
        {
            var catalog = await GetCatalogItemsAsync(options);
            var operations = await GetOperationalItemsAsync(options);

            return new ManageEngineUnifiedData
            {
                Catalog = catalog,
                Operations = operations,
                Summary = new Dictionary<string, int>
                {
                    ["catalog"] = catalog.Count,
                    ["operations"] = operations.Count,
                    ["serviceDeskCatalog"] = catalog.Count(item => item.Source == "ServiceDesk"),
                    ["opManagerCatalog"] = catalog.Count(item => item.Source == "OpManager"),
                    ["serviceDeskRequests"] = operations.Count(item => item.Source == "ServiceDesk"),
                    ["opManagerAlerts"] = operations.Count(item => item.Source == "OpManager")
                }
            };
        }

        public Task<ManageEngineSyncStatus> GetSyncStatusAsync()
        {
            return Task.FromResult(_syncStatus);
        }

        public Task UpdateSyncStatusAsync(ManageEngineSyncStatus syncStatus)
        {
            _syncStatus = syncStatus;
            return Task.CompletedTask;
        }

        public async Task<ManageEngineRuntimeSettings> GetRuntimeSettingsAsync()
        {
            var coreSettings = await BuildCoreSettingsAsync();
            var serviceDesk = await BuildServiceDeskSettingsAsync();
            var opManager = await BuildOpManagerSettingsAsync();

            return new ManageEngineRuntimeSettings
            {
                SyncEnabled = coreSettings.SyncEnabled,
                SyncDirection = coreSettings.SyncDirection,
                SyncIntervalMinutes = coreSettings.SyncIntervalMinutes,
                WebhookSecret = MaskSecret(coreSettings.WebhookSecret),
                ServiceDesk = MaskSecrets(serviceDesk),
                OpManager = MaskSecrets(opManager)
            };
        }

        public async Task<ManageEngineRuntimeSettings> SaveRuntimeSettingsAsync(ManageEngineSettingsUpdateRequest request)
        {
            var currentCore = await BuildCoreSettingsAsync();
            var mergedCore = new ManageEngineCoreSettings
            {
                SyncEnabled = request.SyncEnabled,
                SyncDirection = ResolveUpdatedValue(request.SyncDirection, currentCore.SyncDirection),
                SyncIntervalMinutes = request.SyncIntervalMinutes <= 0 ? currentCore.SyncIntervalMinutes : request.SyncIntervalMinutes,
                WebhookSecret = ResolveSecretValue(request.WebhookSecret, currentCore.WebhookSecret)
            };

            _settings.SyncEnabled = mergedCore.SyncEnabled;
            _settings.SyncDirection = mergedCore.SyncDirection;
            _settings.SyncIntervalMinutes = mergedCore.SyncIntervalMinutes;
            _settings.WebhookSecret = mergedCore.WebhookSecret;

            await UpsertCoreSettingsAsync(mergedCore);

            await UpsertSourceSettingsAsync("ManageEngine ServiceDesk", "ManageEngine-ServiceDesk", request.ServiceDesk, BuildServiceDeskSettings());
            await UpsertSourceSettingsAsync("ManageEngine OpManager", "ManageEngine-OpManager", request.OpManager, BuildOpManagerSettings());

            return await GetRuntimeSettingsAsync();
        }

        public async Task<ManageEngineIncident?> CreateIncidentAsync(ManageEngineIncident incident)
        {
            var serviceDesk = await BuildServiceDeskSettingsAsync();
            var payload = new
            {
                request = new
                {
                    subject = incident.Title,
                    description = incident.Description,
                    status = incident.Status,
                    priority = incident.Priority
                }
            };

            var document = await SendJsonAsync(serviceDesk, serviceDesk.RequestsEndpoint, HttpMethod.Post, payload, ManageEngineAuthMode.ServiceDesk);
            if (document == null)
            {
                return null;
            }

            var root = ExtractArray(document.RootElement).FirstOrDefault();
            return root.ValueKind == JsonValueKind.Undefined ? null : MapIncident(root);
        }

        public async Task<bool> UpdateIncidentAsync(string incidentId, ManageEngineIncident incident)
        {
            var serviceDesk = await BuildServiceDeskSettingsAsync();
            var payload = new
            {
                request = new
                {
                    subject = incident.Title,
                    description = incident.Description,
                    status = incident.Status,
                    priority = incident.Priority
                }
            };

            var endpoint = $"{TrimLeadingSlash(serviceDesk.RequestsEndpoint)}/{incidentId}";
            var result = await SendJsonAsync(serviceDesk, endpoint, HttpMethod.Put, payload, ManageEngineAuthMode.ServiceDesk);
            return result != null;
        }

        public async Task<bool> ValidateWebhookSignatureAsync(string? signature, string payload)
        {
            var coreSettings = await BuildCoreSettingsAsync();
            if (string.IsNullOrEmpty(coreSettings.WebhookSecret))
            {
                return true;
            }

            return !string.IsNullOrEmpty(signature) && !string.IsNullOrEmpty(payload);
        }

        private async Task<bool> TestServiceDeskConnectionAsync(ManageEngineSourceSettings settings)
        {
            var response = await SendAsync(
                settings,
                settings.RequestsEndpoint,
                HttpMethod.Get,
                null,
                BuildServiceDeskRequestListQuery(settings),
                ManageEngineAuthMode.ServiceDesk);
            return response?.IsSuccessStatusCode == true;
        }

        private async Task<bool> TestOpManagerConnectionAsync(ManageEngineSourceSettings settings)
        {
            var response = await SendAsync(settings, settings.AlertsEndpoint, HttpMethod.Get, null, null, ManageEngineAuthMode.OpManager);
            return response?.IsSuccessStatusCode == true;
        }

        private async Task<List<ManageEngineNormalizedItem>> GetServiceDeskCatalogItemsAsync()
        {
            var settings = await BuildServiceDeskSettingsAsync();
            var candidateEndpoints = new[]
            {
                settings.CatalogEndpoint,
                "/api/v3/request_templates",
                "/api/v3/service_catalog/items"
            }.Where(value => !string.IsNullOrWhiteSpace(value)).Distinct(StringComparer.OrdinalIgnoreCase);

            foreach (var endpoint in candidateEndpoints)
            {
                var query = endpoint.Contains("request_templates", StringComparison.OrdinalIgnoreCase)
                    ? BuildServiceDeskTemplateListQuery(settings)
                    : null;
                var document = await GetJsonDocumentAsync(settings, endpoint, query, ManageEngineAuthMode.ServiceDesk);
                if (document == null)
                {
                    continue;
                }

                var items = ExtractArray(document.RootElement)
                    .Select(element => MapServiceDeskCatalogItem(element, settings.BaseUrl))
                    .Where(item => !string.IsNullOrWhiteSpace(item.ExternalId))
                    .ToList();

                if (items.Count > 0)
                {
                    return items;
                }
            }

            return new List<ManageEngineNormalizedItem>();
        }

        private async Task<List<ManageEngineNormalizedItem>> GetServiceDeskOperationalItemsAsync()
        {
            var settings = await BuildServiceDeskSettingsAsync();
            var document = await GetJsonDocumentAsync(settings, settings.RequestsEndpoint, BuildServiceDeskRequestListQuery(settings), ManageEngineAuthMode.ServiceDesk);
            if (document == null)
            {
                return new List<ManageEngineNormalizedItem>();
            }

            return ExtractArray(document.RootElement)
                .Select(element => MapServiceDeskRequest(element, settings.BaseUrl))
                .Where(item => !string.IsNullOrWhiteSpace(item.ExternalId))
                .ToList();
        }

        private async Task<List<ManageEngineNormalizedItem>> GetOpManagerServicesAsync()
        {
            var settings = await BuildOpManagerSettingsAsync();
            var document = await GetJsonDocumentAsync(settings, settings.ServicesEndpoint, null, ManageEngineAuthMode.OpManager);
            if (document == null)
            {
                return new List<ManageEngineNormalizedItem>();
            }

            return ExtractArray(document.RootElement)
                .Select(element => MapOpManagerService(element, settings.BaseUrl))
                .Where(item => !string.IsNullOrWhiteSpace(item.ExternalId))
                .ToList();
        }

        private async Task<List<ManageEngineNormalizedItem>> GetOpManagerAlertItemsAsync()
        {
            var settings = await BuildOpManagerSettingsAsync();
            var document = await GetJsonDocumentAsync(settings, settings.AlertsEndpoint, null, ManageEngineAuthMode.OpManager);
            if (document == null)
            {
                return new List<ManageEngineNormalizedItem>();
            }

            return ExtractArray(document.RootElement)
                .Select(element => MapOpManagerAlert(element, settings.BaseUrl))
                .Where(item => !string.IsNullOrWhiteSpace(item.ExternalId))
                .ToList();
        }

        private ManageEngineSourceSettings BuildServiceDeskSettings()
        {
            return new ManageEngineSourceSettings
            {
                Profile = FirstNonEmpty(_settings.ServiceDesk.Profile, "serviceDeskPlus151"),
                BaseUrl = FirstNonEmpty(_settings.ServiceDesk.BaseUrl, _settings.BaseUrl),
                ApiKey = FirstNonEmpty(_settings.ServiceDesk.ApiKey, _settings.ApiKey),
                TechnicianKey = FirstNonEmpty(_settings.ServiceDesk.TechnicianKey, _settings.TechnicianKey),
                AuthMode = FirstNonEmpty(_settings.ServiceDesk.AuthMode, "header"),
                PortalId = _settings.ServiceDesk.PortalId,
                ApiKeyHeaderName = FirstNonEmpty(_settings.ServiceDesk.ApiKeyHeaderName, "authtoken"),
                ApiKeyQueryName = FirstNonEmpty(_settings.ServiceDesk.ApiKeyQueryName, "apiKey"),
                TechnicianHeaderName = FirstNonEmpty(_settings.ServiceDesk.TechnicianHeaderName, "TECHNICIAN_KEY"),
                CatalogEndpoint = FirstNonEmpty(_settings.ServiceDesk.CatalogEndpoint, "/api/v3/request_templates"),
                RequestsEndpoint = FirstNonEmpty(_settings.ServiceDesk.RequestsEndpoint, "/api/v3/requests"),
                ServicesEndpoint = FirstNonEmpty(_settings.ServiceDesk.ServicesEndpoint, "/api/v3/service_catalog/items"),
                AlertsEndpoint = FirstNonEmpty(_settings.ServiceDesk.AlertsEndpoint, "/api/v3/requests")
            };
        }

        private ManageEngineSourceSettings BuildOpManagerSettings()
        {
            return new ManageEngineSourceSettings
            {
                Profile = FirstNonEmpty(_settings.OpManager.Profile, "opManager"),
                BaseUrl = FirstNonEmpty(_settings.OpManager.BaseUrl, _settings.BaseUrl),
                ApiKey = FirstNonEmpty(_settings.OpManager.ApiKey, _settings.ApiKey),
                TechnicianKey = FirstNonEmpty(_settings.OpManager.TechnicianKey, _settings.TechnicianKey),
                AuthMode = FirstNonEmpty(_settings.OpManager.AuthMode, "query"),
                PortalId = _settings.OpManager.PortalId,
                ApiKeyHeaderName = FirstNonEmpty(_settings.OpManager.ApiKeyHeaderName, "authtoken"),
                ApiKeyQueryName = FirstNonEmpty(_settings.OpManager.ApiKeyQueryName, "apiKey"),
                TechnicianHeaderName = FirstNonEmpty(_settings.OpManager.TechnicianHeaderName, "TECHNICIAN_KEY"),
                CatalogEndpoint = FirstNonEmpty(_settings.OpManager.CatalogEndpoint, "/api/json/device/listDevices"),
                RequestsEndpoint = FirstNonEmpty(_settings.OpManager.RequestsEndpoint, "/api/json/device/listDevices"),
                ServicesEndpoint = FirstNonEmpty(_settings.OpManager.ServicesEndpoint, "/api/json/device/listDevices"),
                AlertsEndpoint = FirstNonEmpty(_settings.OpManager.AlertsEndpoint, "/api/json/alarm/listAlarms")
            };
        }

        private async Task<ManageEngineSourceSettings> BuildServiceDeskSettingsAsync()
        {
            return await BuildSourceSettingsAsync("ManageEngine-ServiceDesk", BuildServiceDeskSettings());
        }

        private async Task<ManageEngineSourceSettings> BuildOpManagerSettingsAsync()
        {
            return await BuildSourceSettingsAsync("ManageEngine-OpManager", BuildOpManagerSettings());
        }

        private async Task<ManageEngineSourceSettings> BuildSourceSettingsAsync(string provider, ManageEngineSourceSettings defaults)
        {
            var integration = await _context.ExternalIntegrations
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Provider == provider);

            return MergeWithStoredSettings(defaults, integration?.ConfigurationJson);
        }

        private async Task<ManageEngineCoreSettings> BuildCoreSettingsAsync()
        {
            var integration = await _context.ExternalIntegrations
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Provider == "ManageEngine-Core");

            var defaults = new ManageEngineCoreSettings
            {
                SyncEnabled = _settings.SyncEnabled,
                SyncDirection = _settings.SyncDirection,
                SyncIntervalMinutes = _settings.SyncIntervalMinutes,
                WebhookSecret = _settings.WebhookSecret
            };

            if (string.IsNullOrWhiteSpace(integration?.ConfigurationJson))
            {
                return defaults;
            }

            try
            {
                var stored = JsonSerializer.Deserialize<ManageEngineCoreSettings>(integration.ConfigurationJson, SerializerOptions);
                if (stored == null)
                {
                    return defaults;
                }

                return new ManageEngineCoreSettings
                {
                    SyncEnabled = stored.SyncEnabled,
                    SyncDirection = ResolveUpdatedValue(stored.SyncDirection, defaults.SyncDirection),
                    SyncIntervalMinutes = stored.SyncIntervalMinutes <= 0 ? defaults.SyncIntervalMinutes : stored.SyncIntervalMinutes,
                    WebhookSecret = ResolveSecretValue(stored.WebhookSecret, defaults.WebhookSecret)
                };
            }
            catch
            {
                return defaults;
            }
        }

        private async Task<JsonDocument?> GetJsonDocumentAsync(
            ManageEngineSourceSettings settings,
            string endpoint,
            Dictionary<string, string>? query,
            ManageEngineAuthMode authMode)
        {
            var response = await SendAsync(settings, endpoint, HttpMethod.Get, null, query, authMode);
            if (response == null || !response.IsSuccessStatusCode)
            {
                return null;
            }

            var content = await response.Content.ReadAsStringAsync();
            if (string.IsNullOrWhiteSpace(content))
            {
                return null;
            }

            try
            {
                return JsonDocument.Parse(content);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse ManageEngine response from {Endpoint}", endpoint);
                return null;
            }
        }

        private async Task<JsonDocument?> SendJsonAsync(
            ManageEngineSourceSettings settings,
            string endpoint,
            HttpMethod method,
            object payload,
            ManageEngineAuthMode authMode)
        {
            var response = await SendAsync(settings, endpoint, method, payload, null, authMode);
            if (response == null || !response.IsSuccessStatusCode)
            {
                return null;
            }

            var content = await response.Content.ReadAsStringAsync();
            return string.IsNullOrWhiteSpace(content) ? null : JsonDocument.Parse(content);
        }

        private async Task<HttpResponseMessage?> SendAsync(
            ManageEngineSourceSettings settings,
            string endpoint,
            HttpMethod method,
            object? payload,
            Dictionary<string, string>? query,
            ManageEngineAuthMode authMode)
        {
            if (string.IsNullOrWhiteSpace(settings.BaseUrl))
            {
                _logger.LogWarning("ManageEngine source base URL is not configured for endpoint {Endpoint}", endpoint);
                return null;
            }

            try
            {
                using var request = new HttpRequestMessage(method, BuildUri(settings.BaseUrl, endpoint, query, settings, authMode));
                ApplyHeaders(request, settings, authMode);

                if (payload != null)
                {
                    var json = JsonSerializer.Serialize(payload, SerializerOptions);
                    request.Content = ShouldUseServiceDeskPlus151(settings, authMode)
                        ? new FormUrlEncodedContent(new Dictionary<string, string> { ["input_data"] = json })
                        : new StringContent(json, Encoding.UTF8, "application/json");
                }

                return await _httpClient.SendAsync(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ManageEngine request failed for {Endpoint}", endpoint);
                return null;
            }
        }

        private static void ApplyHeaders(HttpRequestMessage request, ManageEngineSourceSettings settings, ManageEngineAuthMode authMode)
        {
            var authModeValue = (settings.AuthMode ?? string.Empty).Trim().ToLowerInvariant();

            if (ShouldUseServiceDeskPlus151(settings, authMode))
            {
                request.Headers.Accept.Clear();
                request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.manageengine.sdp.v3+json"));

                if (!string.IsNullOrWhiteSpace(settings.PortalId))
                {
                    request.Headers.TryAddWithoutValidation("PORTALID", settings.PortalId);
                }
            }

            if ((authMode == ManageEngineAuthMode.ServiceDesk || authModeValue == "header" || authModeValue == "servicedesk")
                && !string.IsNullOrWhiteSpace(settings.TechnicianKey))
            {
                request.Headers.TryAddWithoutValidation(
                    string.IsNullOrWhiteSpace(settings.TechnicianHeaderName) ? "TECHNICIAN_KEY" : settings.TechnicianHeaderName,
                    settings.TechnicianKey);
            }

            if ((authMode != ManageEngineAuthMode.OpManager || authModeValue != "query")
                && !string.IsNullOrWhiteSpace(settings.ApiKey))
            {
                request.Headers.TryAddWithoutValidation(
                    string.IsNullOrWhiteSpace(settings.ApiKeyHeaderName) ? "authtoken" : settings.ApiKeyHeaderName,
                    settings.ApiKey);
            }
        }

        private static bool ShouldUseServiceDeskPlus151(ManageEngineSourceSettings settings, ManageEngineAuthMode authMode)
        {
            if (authMode != ManageEngineAuthMode.ServiceDesk)
            {
                return false;
            }

            var profile = (settings.Profile ?? string.Empty).Trim().ToLowerInvariant();
            return profile is "" or "servicedeskplus151" or "servicedesk-plus-15.1" or "sdp151";
        }

        private static Dictionary<string, string>? BuildServiceDeskRequestListQuery(
            ManageEngineSourceSettings settings,
            string? status = null,
            string? priority = null,
            DateTime? since = null)
        {
            if (!ShouldUseServiceDeskPlus151(settings, ManageEngineAuthMode.ServiceDesk))
            {
                var legacyQuery = new Dictionary<string, string>();
                if (!string.IsNullOrWhiteSpace(status))
                {
                    legacyQuery["status"] = status;
                }

                if (!string.IsNullOrWhiteSpace(priority))
                {
                    legacyQuery["priority"] = priority;
                }

                if (since.HasValue)
                {
                    legacyQuery["created_time.gt"] = since.Value.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ");
                }

                return legacyQuery.Count == 0 ? null : legacyQuery;
            }

            var listInfo = new Dictionary<string, object>
            {
                ["row_count"] = 100,
                ["start_index"] = 1,
                ["sort_field"] = "updated_time",
                ["sort_order"] = "desc"
            };
            var searchCriteria = new List<Dictionary<string, string>>();

            if (!string.IsNullOrWhiteSpace(status))
            {
                searchCriteria.Add(new Dictionary<string, string>
                {
                    ["field"] = "status.name",
                    ["condition"] = "is",
                    ["value"] = status
                });
            }

            if (!string.IsNullOrWhiteSpace(priority))
            {
                searchCriteria.Add(new Dictionary<string, string>
                {
                    ["field"] = "priority.name",
                    ["condition"] = "is",
                    ["value"] = priority
                });
            }

            if (since.HasValue)
            {
                searchCriteria.Add(new Dictionary<string, string>
                {
                    ["field"] = "created_time",
                    ["condition"] = "greater than",
                    ["value"] = since.Value.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
                });
            }

            if (searchCriteria.Count > 0)
            {
                listInfo["search_criteria"] = searchCriteria;
            }

            return BuildServiceDeskInputDataQuery(listInfo);
        }

        private static Dictionary<string, string>? BuildServiceDeskTemplateListQuery(ManageEngineSourceSettings settings)
        {
            if (!ShouldUseServiceDeskPlus151(settings, ManageEngineAuthMode.ServiceDesk))
            {
                return null;
            }

            var listInfo = new Dictionary<string, object>
            {
                ["row_count"] = 100,
                ["start_index"] = 1,
                ["sort_field"] = "name",
                ["sort_order"] = "asc"
            };

            return BuildServiceDeskInputDataQuery(listInfo);
        }

        private static Dictionary<string, string> BuildServiceDeskInputDataQuery(Dictionary<string, object> listInfo)
        {
            var inputData = JsonSerializer.Serialize(
                new Dictionary<string, object> { ["list_info"] = listInfo },
                SerializerOptions);

            return new Dictionary<string, string> { ["input_data"] = inputData };
        }

        private static Uri BuildUri(
            string baseUrl,
            string endpoint,
            Dictionary<string, string>? query,
            ManageEngineSourceSettings settings,
            ManageEngineAuthMode authMode)
        {
            var uriBuilder = new UriBuilder(new Uri(new Uri(baseUrl.TrimEnd('/') + "/"), TrimLeadingSlash(endpoint)));
            var queryParts = new List<string>();

            if (!string.IsNullOrWhiteSpace(uriBuilder.Query))
            {
                queryParts.Add(uriBuilder.Query.TrimStart('?'));
            }

            var authModeValue = (settings.AuthMode ?? string.Empty).Trim().ToLowerInvariant();
            var shouldUseQueryKey = authMode == ManageEngineAuthMode.OpManager || authModeValue == "query" || authModeValue == "opmanager";

            if (shouldUseQueryKey && !string.IsNullOrWhiteSpace(settings.ApiKey))
            {
                queryParts.Add($"{Uri.EscapeDataString(string.IsNullOrWhiteSpace(settings.ApiKeyQueryName) ? "apiKey" : settings.ApiKeyQueryName)}={Uri.EscapeDataString(settings.ApiKey)}");
            }

            if (query != null)
            {
                queryParts.AddRange(query
                    .Where(entry => !string.IsNullOrWhiteSpace(entry.Value))
                    .Select(entry => $"{Uri.EscapeDataString(entry.Key)}={Uri.EscapeDataString(entry.Value)}"));
            }

            uriBuilder.Query = string.Join("&", queryParts.Where(part => !string.IsNullOrWhiteSpace(part)));
            return uriBuilder.Uri;
        }

        private static IEnumerable<JsonElement> ExtractArray(JsonElement root)
        {
            if (root.ValueKind == JsonValueKind.Array)
            {
                return root.EnumerateArray();
            }

            var candidates = new[]
            {
                "data",
                "rows",
                "requests",
                "request",
                "templates",
                "template",
                "request_templates",
                "services",
                "service",
                "items",
                "alarms",
                "alarm",
                "devices",
                "device",
                "response"
            };
            foreach (var candidate in candidates)
            {
                if (root.TryGetProperty(candidate, out var nested))
                {
                    if (nested.ValueKind == JsonValueKind.Array)
                    {
                        return nested.EnumerateArray();
                    }

                    if (nested.ValueKind == JsonValueKind.Object)
                    {
                        var nestedArray = ExtractArray(nested);
                        if (nestedArray.Any())
                        {
                            return nestedArray;
                        }

                        if (HasManageEngineIdentity(nested))
                        {
                            return new[] { nested };
                        }
                    }
                }
            }

            if (HasManageEngineIdentity(root))
            {
                return new[] { root };
            }

            return Enumerable.Empty<JsonElement>();
        }

        private static bool HasManageEngineIdentity(JsonElement element)
        {
            return element.ValueKind == JsonValueKind.Object
                && (!string.IsNullOrWhiteSpace(GetString(element, "id"))
                    || !string.IsNullOrWhiteSpace(GetString(element, "request_id"))
                    || !string.IsNullOrWhiteSpace(GetString(element, "template_id"))
                    || !string.IsNullOrWhiteSpace(GetString(element, "resourceId"))
                    || !string.IsNullOrWhiteSpace(GetString(element, "deviceId"))
                    || !string.IsNullOrWhiteSpace(GetString(element, "alarmId")));
        }

        private static ManageEngineIncident MapIncident(JsonElement element)
        {
            return new ManageEngineIncident
            {
                Id = FirstNonEmpty(GetString(element, "id"), GetString(element, "request_id")),
                Title = FirstNonEmpty(GetString(element, "subject"), GetString(element, "title"), GetString(element, "name")),
                Description = FirstNonEmpty(GetString(element, "description"), GetString(element, "short_description")),
                Status = FirstNonEmpty(GetNestedDisplayValue(element, "status"), GetString(element, "status")),
                Priority = FirstNonEmpty(GetNestedDisplayValue(element, "priority"), GetString(element, "priority")),
                Category = FirstNonEmpty(GetNestedDisplayValue(element, "category"), GetString(element, "category")),
                Subcategory = FirstNonEmpty(GetNestedDisplayValue(element, "subcategory"), GetString(element, "subcategory")),
                Requester = FirstNonEmpty(GetNestedDisplayValue(element, "requester"), GetString(element, "requester")),
                CreatedTime = GetDateTime(element, "created_time") ?? DateTime.UtcNow,
                UpdatedTime = GetDateTime(element, "updated_time") ?? DateTime.UtcNow,
                DueByTime = GetDateTime(element, "due_by_time"),
                Technician = new ManageEngineUser
                {
                    Id = FirstNonEmpty(GetNestedValue(element, "technician", "id"), GetString(element, "technician")),
                    Name = FirstNonEmpty(GetNestedDisplayValue(element, "technician"), GetString(element, "technician")),
                    Email = GetNestedValue(element, "technician", "email_id")
                }
            };
        }

        private static ManageEngineNormalizedItem MapServiceDeskCatalogItem(JsonElement element, string baseUrl)
        {
            var id = FirstNonEmpty(GetString(element, "id"), GetString(element, "template_id"));
            return new ManageEngineNormalizedItem
            {
                Source = "ServiceDesk",
                ItemType = "catalog",
                ExternalId = id,
                Name = FirstNonEmpty(GetString(element, "name"), GetString(element, "subject"), GetString(element, "title"), $"Template {id}"),
                Description = FirstNonEmpty(GetString(element, "description"), GetString(element, "description_text")),
                Status = FirstNonEmpty(GetNestedDisplayValue(element, "status"), "Available"),
                Priority = FirstNonEmpty(GetNestedDisplayValue(element, "priority"), GetString(element, "priority")),
                Category = FirstNonEmpty(GetNestedDisplayValue(element, "category"), GetString(element, "module"), "Service Requests"),
                Owner = FirstNonEmpty(GetNestedDisplayValue(element, "owner"), GetNestedDisplayValue(element, "technician")),
                CreatedAt = GetDateTime(element, "created_time"),
                UpdatedAt = GetDateTime(element, "updated_time"),
                ExternalUrl = BuildExternalUrl(baseUrl, "service-catalog", id),
                Metadata = BuildMetadata(element, "module", "template_key", "request_type", "form_name", "assetTag", "asset_tag", "assetId", "asset_id", "serialNumber", "serial_number", "barcode")
            };
        }

        private static ManageEngineNormalizedItem MapServiceDeskRequest(JsonElement element, string baseUrl)
        {
            var id = FirstNonEmpty(GetString(element, "id"), GetString(element, "request_id"));
            return new ManageEngineNormalizedItem
            {
                Source = "ServiceDesk",
                ItemType = "request",
                ExternalId = id,
                Name = FirstNonEmpty(GetString(element, "subject"), GetString(element, "title"), $"Request {id}"),
                Description = FirstNonEmpty(GetString(element, "description"), GetString(element, "short_description")),
                Status = FirstNonEmpty(GetNestedDisplayValue(element, "status"), GetString(element, "status")),
                Priority = FirstNonEmpty(GetNestedDisplayValue(element, "priority"), GetString(element, "priority")),
                Category = FirstNonEmpty(GetNestedDisplayValue(element, "category"), GetString(element, "category"), "Request"),
                Owner = FirstNonEmpty(GetNestedDisplayValue(element, "technician"), GetNestedDisplayValue(element, "requester")),
                CreatedAt = GetDateTime(element, "created_time"),
                UpdatedAt = GetDateTime(element, "updated_time"),
                ExternalUrl = BuildExternalUrl(baseUrl, "requests", id),
                Metadata = BuildMetadata(element, "requester", "site", "group", "mode", "resolution", "assetTag", "asset_tag", "assetId", "asset_id", "serialNumber", "serial_number", "barcode", "ci", "configuration_item")
            };
        }

        private static ManageEngineNormalizedItem MapOpManagerService(JsonElement element, string baseUrl)
        {
            var id = FirstNonEmpty(GetString(element, "resourceId"), GetString(element, "deviceId"), GetString(element, "id"), GetString(element, "name"));
            return new ManageEngineNormalizedItem
            {
                Source = "OpManager",
                ItemType = "service",
                ExternalId = id,
                Name = FirstNonEmpty(GetString(element, "displayName"), GetString(element, "name"), GetString(element, "deviceName"), $"Service {id}"),
                Description = FirstNonEmpty(GetString(element, "type"), GetString(element, "categoryString"), GetString(element, "category")),
                Status = FirstNonEmpty(GetString(element, "status"), GetString(element, "statusStr"), "Monitored"),
                Priority = FirstNonEmpty(GetString(element, "severity"), GetString(element, "severityLabel")),
                Category = FirstNonEmpty(GetString(element, "category"), GetString(element, "categoryString"), "Monitoring"),
                Owner = FirstNonEmpty(GetString(element, "owner"), GetString(element, "technician")),
                CreatedAt = GetDateTime(element, "createTime"),
                UpdatedAt = GetDateTime(element, "modTime"),
                ExternalUrl = BuildExternalUrl(baseUrl, "devices", id),
                Metadata = BuildMetadata(element, "type", "hostName", "ipAddress", "deviceName", "health", "assetTag", "asset_tag", "assetId", "asset_id", "serialNumber", "serial_number", "deviceTag", "device_tag", "deviceSerialNumber", "device_serial_number", "barcode")
            };
        }

        private static ManageEngineNormalizedItem MapOpManagerAlert(JsonElement element, string baseUrl)
        {
            var id = FirstNonEmpty(GetString(element, "alarmId"), GetString(element, "entity"), GetString(element, "id"));
            return new ManageEngineNormalizedItem
            {
                Source = "OpManager",
                ItemType = "alert",
                ExternalId = id,
                Name = FirstNonEmpty(GetString(element, "displayName"), GetString(element, "deviceName"), GetString(element, "entity"), $"Alert {id}"),
                Description = FirstNonEmpty(GetString(element, "message"), GetString(element, "eventtype")),
                Status = FirstNonEmpty(GetString(element, "statusStr"), GetString(element, "who"), "Active"),
                Priority = FirstNonEmpty(GetString(element, "severity"), GetString(element, "statusStr")),
                Category = FirstNonEmpty(GetString(element, "categoryString"), GetString(element, "category"), "Alarm"),
                Owner = FirstNonEmpty(GetString(element, "technician"), GetString(element, "who")),
                CreatedAt = GetDateTime(element, "createTime"),
                UpdatedAt = GetDateTime(element, "modTime"),
                ExternalUrl = BuildExternalUrl(baseUrl, "alarms", id),
                Metadata = BuildMetadata(element, "eventtype", "entity", "alarmcode", "suppressedMessage", "assetTag", "asset_tag", "assetId", "asset_id", "serialNumber", "serial_number", "deviceTag", "device_tag", "deviceSerialNumber", "device_serial_number", "barcode")
            };
        }

        private static Dictionary<string, string> BuildMetadata(JsonElement element, params string[] keys)
        {
            var metadata = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            foreach (var key in keys)
            {
                var value = FirstNonEmpty(GetString(element, key), GetNestedDisplayValue(element, key));
                if (!string.IsNullOrWhiteSpace(value))
                {
                    metadata[key] = value;
                }
            }
            return metadata;
        }

        private static string BuildExternalUrl(string baseUrl, string area, string externalId)
        {
            if (string.IsNullOrWhiteSpace(baseUrl) || string.IsNullOrWhiteSpace(externalId))
            {
                return string.Empty;
            }

            return $"{baseUrl.TrimEnd('/')}/{area.Trim('/')}/{Uri.EscapeDataString(externalId)}";
        }

        private static string FirstNonEmpty(params string?[] values)
        {
            return values.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value)) ?? string.Empty;
        }

        private async Task UpsertSourceSettingsAsync(string name, string provider, ManageEngineSourceSettings request, ManageEngineSourceSettings defaults)
        {
            var integration = await _context.ExternalIntegrations.FirstOrDefaultAsync(item => item.Provider == provider);
            integration ??= new ExternalIntegration
            {
                Name = name,
                Provider = provider,
                EventSubscriptions = "[]",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            };

            if (integration.Id == 0)
            {
                _context.ExternalIntegrations.Add(integration);
            }

            var current = MergeWithStoredSettings(defaults, integration.ConfigurationJson);
            var merged = new ManageEngineSourceSettings
            {
                Profile = ResolveUpdatedValue(request.Profile, current.Profile),
                BaseUrl = ResolveUpdatedValue(request.BaseUrl, current.BaseUrl),
                ApiKey = ResolveSecretValue(request.ApiKey, current.ApiKey),
                TechnicianKey = ResolveSecretValue(request.TechnicianKey, current.TechnicianKey),
                AuthMode = ResolveUpdatedValue(request.AuthMode, current.AuthMode),
                PortalId = ResolveUpdatedValue(request.PortalId, current.PortalId),
                ApiKeyHeaderName = ResolveUpdatedValue(request.ApiKeyHeaderName, current.ApiKeyHeaderName),
                ApiKeyQueryName = ResolveUpdatedValue(request.ApiKeyQueryName, current.ApiKeyQueryName),
                TechnicianHeaderName = ResolveUpdatedValue(request.TechnicianHeaderName, current.TechnicianHeaderName),
                CatalogEndpoint = ResolveUpdatedValue(request.CatalogEndpoint, current.CatalogEndpoint),
                RequestsEndpoint = ResolveUpdatedValue(request.RequestsEndpoint, current.RequestsEndpoint),
                ServicesEndpoint = ResolveUpdatedValue(request.ServicesEndpoint, current.ServicesEndpoint),
                AlertsEndpoint = ResolveUpdatedValue(request.AlertsEndpoint, current.AlertsEndpoint)
            };

            integration.ConfigurationJson = JsonSerializer.Serialize(merged, SerializerOptions);
            integration.IsEnabled = true;
            integration.LastSyncAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        private async Task UpsertCoreSettingsAsync(ManageEngineCoreSettings settings)
        {
            var integration = await _context.ExternalIntegrations.FirstOrDefaultAsync(item => item.Provider == "ManageEngine-Core");
            integration ??= new ExternalIntegration
            {
                Name = "ManageEngine Core",
                Provider = "ManageEngine-Core",
                EventSubscriptions = "[]",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            };

            if (integration.Id == 0)
            {
                _context.ExternalIntegrations.Add(integration);
            }

            integration.ConfigurationJson = JsonSerializer.Serialize(settings, SerializerOptions);
            integration.IsEnabled = true;
            integration.LastSyncAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        private static ManageEngineSourceSettings MergeWithStoredSettings(ManageEngineSourceSettings defaults, string? configurationJson)
        {
            if (string.IsNullOrWhiteSpace(configurationJson))
            {
                return defaults;
            }

            try
            {
                var stored = JsonSerializer.Deserialize<ManageEngineSourceSettings>(configurationJson, SerializerOptions);
                if (stored == null)
                {
                    return defaults;
                }

                return new ManageEngineSourceSettings
                {
                    Profile = FirstNonEmpty(stored.Profile, defaults.Profile),
                    BaseUrl = FirstNonEmpty(stored.BaseUrl, defaults.BaseUrl),
                    ApiKey = FirstNonEmpty(stored.ApiKey, defaults.ApiKey),
                    TechnicianKey = FirstNonEmpty(stored.TechnicianKey, defaults.TechnicianKey),
                    AuthMode = FirstNonEmpty(stored.AuthMode, defaults.AuthMode),
                    PortalId = FirstNonEmpty(stored.PortalId, defaults.PortalId),
                    ApiKeyHeaderName = FirstNonEmpty(stored.ApiKeyHeaderName, defaults.ApiKeyHeaderName),
                    ApiKeyQueryName = FirstNonEmpty(stored.ApiKeyQueryName, defaults.ApiKeyQueryName),
                    TechnicianHeaderName = FirstNonEmpty(stored.TechnicianHeaderName, defaults.TechnicianHeaderName),
                    CatalogEndpoint = FirstNonEmpty(stored.CatalogEndpoint, defaults.CatalogEndpoint),
                    RequestsEndpoint = FirstNonEmpty(stored.RequestsEndpoint, defaults.RequestsEndpoint),
                    ServicesEndpoint = FirstNonEmpty(stored.ServicesEndpoint, defaults.ServicesEndpoint),
                    AlertsEndpoint = FirstNonEmpty(stored.AlertsEndpoint, defaults.AlertsEndpoint)
                };
            }
            catch
            {
                return defaults;
            }
        }

        private static ManageEngineSourceSettings MaskSecrets(ManageEngineSourceSettings settings)
        {
            return new ManageEngineSourceSettings
            {
                Profile = settings.Profile,
                BaseUrl = settings.BaseUrl,
                ApiKey = MaskSecret(settings.ApiKey),
                TechnicianKey = MaskSecret(settings.TechnicianKey),
                AuthMode = settings.AuthMode,
                PortalId = settings.PortalId,
                ApiKeyHeaderName = settings.ApiKeyHeaderName,
                ApiKeyQueryName = settings.ApiKeyQueryName,
                TechnicianHeaderName = settings.TechnicianHeaderName,
                CatalogEndpoint = settings.CatalogEndpoint,
                RequestsEndpoint = settings.RequestsEndpoint,
                ServicesEndpoint = settings.ServicesEndpoint,
                AlertsEndpoint = settings.AlertsEndpoint
            };
        }

        private static string MaskSecret(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return string.Empty;
            }

            return "********";
        }

        private static bool IsMaskedValue(string? value)
        {
            return !string.IsNullOrWhiteSpace(value) && value.Trim('*').Length == 0;
        }

        private static string ResolveSecretValue(string? requestedValue, string currentValue)
        {
            if (string.IsNullOrWhiteSpace(requestedValue) || IsMaskedValue(requestedValue))
            {
                return currentValue;
            }

            return requestedValue.Trim();
        }

        private static string ResolveUpdatedValue(string? requestedValue, string currentValue)
        {
            return string.IsNullOrWhiteSpace(requestedValue) ? currentValue : requestedValue.Trim();
        }

        private static List<ManageEngineNormalizedItem> ApplyFilters(
            List<ManageEngineNormalizedItem> items,
            ManageEngineQueryOptions? options)
        {
            if (options == null)
            {
                return items;
            }

            IEnumerable<ManageEngineNormalizedItem> filtered = items;

            if (!string.IsNullOrWhiteSpace(options.Source))
            {
                filtered = filtered.Where(item => string.Equals(item.Source, options.Source, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(options.Type))
            {
                filtered = filtered.Where(item => string.Equals(item.ItemType, options.Type, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(options.Status))
            {
                filtered = filtered.Where(item => item.Status.Contains(options.Status, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(options.Search))
            {
                var search = options.Search.Trim();
                filtered = filtered.Where(item =>
                    item.Name.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    item.Description.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    item.Category.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    item.Owner.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    item.Metadata.Values.Any(value => value.Contains(search, StringComparison.OrdinalIgnoreCase)));
            }

            return filtered.ToList();
        }

        private static string TrimLeadingSlash(string value)
        {
            return value.TrimStart('/');
        }

        private static string GetString(JsonElement element, string propertyName)
        {
            if (!TryGetPropertyCaseInsensitive(element, propertyName, out var property))
            {
                return string.Empty;
            }

            return property.ValueKind switch
            {
                JsonValueKind.String => property.GetString() ?? string.Empty,
                JsonValueKind.Number => property.ToString(),
                JsonValueKind.True => "true",
                JsonValueKind.False => "false",
                JsonValueKind.Object => FirstNonEmpty(
                    GetString(property, "display_value"),
                    GetString(property, "value"),
                    GetString(property, "name"),
                    GetString(property, "text"),
                    GetString(property, "id")),
                _ => string.Empty
            };
        }

        private static string GetNestedValue(JsonElement element, string propertyName, string nestedPropertyName)
        {
            if (!TryGetPropertyCaseInsensitive(element, propertyName, out var property) || property.ValueKind != JsonValueKind.Object)
            {
                return string.Empty;
            }

            return GetString(property, nestedPropertyName);
        }

        private static string GetNestedDisplayValue(JsonElement element, string propertyName)
        {
            if (!TryGetPropertyCaseInsensitive(element, propertyName, out var property))
            {
                return string.Empty;
            }

            if (property.ValueKind == JsonValueKind.Object)
            {
                return FirstNonEmpty(
                    GetString(property, "display_value"),
                    GetString(property, "name"),
                    GetString(property, "value"),
                    GetString(property, "text"));
            }

            return GetString(element, propertyName);
        }

        private static DateTime? GetDateTime(JsonElement element, string propertyName)
        {
            if (!TryGetPropertyCaseInsensitive(element, propertyName, out var property))
            {
                return null;
            }

            if (property.ValueKind == JsonValueKind.Number && property.TryGetInt64(out var longValue))
            {
                return longValue > 100000000000
                    ? DateTimeOffset.FromUnixTimeMilliseconds(longValue).UtcDateTime
                    : DateTimeOffset.FromUnixTimeSeconds(longValue).UtcDateTime;
            }

            if (property.ValueKind == JsonValueKind.String)
            {
                return ParseManageEngineDateTime(property.GetString());
            }

            if (property.ValueKind == JsonValueKind.Object)
            {
                return ParseManageEngineDateTime(FirstNonEmpty(
                    GetString(property, "value"),
                    GetString(property, "display_value"),
                    GetString(property, "date"),
                    GetString(property, "time")));
            }

            return null;
        }

        private static DateTime? ParseManageEngineDateTime(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw))
            {
                return null;
            }

            if (DateTime.TryParse(raw, out var parsedDate))
            {
                return parsedDate;
            }

            if (long.TryParse(raw, out var epochValue))
            {
                return epochValue > 100000000000
                    ? DateTimeOffset.FromUnixTimeMilliseconds(epochValue).UtcDateTime
                    : DateTimeOffset.FromUnixTimeSeconds(epochValue).UtcDateTime;
            }

            return null;
        }

        private static bool TryGetPropertyCaseInsensitive(JsonElement element, string propertyName, out JsonElement property)
        {
            foreach (var candidate in element.EnumerateObject())
            {
                if (string.Equals(candidate.Name, propertyName, StringComparison.OrdinalIgnoreCase))
                {
                    property = candidate.Value;
                    return true;
                }
            }

            property = default;
            return false;
        }
    }

    public class ManageEngineConnectionStatus
    {
        public bool ServiceDeskConnected { get; set; }
        public bool OpManagerConnected { get; set; }
        public bool Connected => ServiceDeskConnected || OpManagerConnected;
    }

    public class ManageEngineIncident
    {
        public string? Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public ManageEngineUser? Technician { get; set; }
        public DateTime CreatedTime { get; set; }
        public DateTime UpdatedTime { get; set; }
        public DateTime? DueByTime { get; set; }
        public string? Requester { get; set; }
        public string? Category { get; set; }
        public string? Subcategory { get; set; }
    }

    public class ManageEngineUser
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
    }

    public enum ManageEngineAuthMode
    {
        ServiceDesk,
        OpManager
    }
}
