using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace ITSMBackend.Services
{
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
    }

    public class ManageEngineService
    {
        private readonly HttpClient _httpClient;
        private readonly ManageEngineSettings _settings;
        private readonly ILogger<ManageEngineService> _logger;

        public ManageEngineService(
            HttpClient httpClient,
            IOptions<ManageEngineSettings> settings,
            ILogger<ManageEngineService> logger)
        {
            _httpClient = httpClient;
            _settings = settings.Value;
            _logger = logger;

            // Configure HTTP client
            _httpClient.BaseAddress = new Uri(_settings.BaseUrl);
            _httpClient.DefaultRequestHeaders.Add("TECHNICIAN_KEY", _settings.TechnicianKey);
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        public async Task<bool> TestConnectionAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("/api/v3/requests");
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to test ManageEngine connection");
                return false;
            }
        }

        public async Task<IEnumerable<ManageEngineIncident>> GetIncidentsAsync(
            string? status = null,
            string? priority = null,
            DateTime? since = null)
        {
            try
            {
                var queryParams = new List<string>();

                if (!string.IsNullOrEmpty(status))
                    queryParams.Add($"status={Uri.EscapeDataString(status)}");
                if (!string.IsNullOrEmpty(priority))
                    queryParams.Add($"priority={Uri.EscapeDataString(priority)}");
                if (since.HasValue)
                    queryParams.Add($"created_time.gt={since.Value:yyyy-MM-ddTHH:mm:ssZ}");

                var queryString = queryParams.Any() ? $"?{string.Join("&", queryParams)}" : "";
                var response = await _httpClient.GetAsync($"/api/v3/requests{queryString}");

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Failed to fetch incidents from ManageEngine: {StatusCode}",
                        response.StatusCode);
                    return Enumerable.Empty<ManageEngineIncident>();
                }

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<ManageEngineResponse<ManageEngineIncident>>(content);

                return result?.Data ?? Enumerable.Empty<ManageEngineIncident>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching incidents from ManageEngine");
                return Enumerable.Empty<ManageEngineIncident>();
            }
        }

        public async Task<ManageEngineIncident?> CreateIncidentAsync(ManageEngineIncident incident)
        {
            try
            {
                var json = JsonSerializer.Serialize(incident);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("/api/v3/requests", content);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Failed to create incident in ManageEngine: {StatusCode}",
                        response.StatusCode);
                    return null;
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<ManageEngineIncident>(responseContent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating incident in ManageEngine");
                return null;
            }
        }

        public async Task<bool> UpdateIncidentAsync(string incidentId, ManageEngineIncident incident)
        {
            try
            {
                var json = JsonSerializer.Serialize(incident);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PutAsync($"/api/v3/requests/{incidentId}", content);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Failed to update incident in ManageEngine: {StatusCode}",
                        response.StatusCode);
                    return false;
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating incident in ManageEngine");
                return false;
            }
        }

        public async Task<bool> ValidateWebhookSignatureAsync(string signature, string payload)
        {
            if (string.IsNullOrEmpty(_settings.WebhookSecret))
                return true; // No validation if secret not configured

            // Implement HMAC-SHA256 validation for webhook signatures
            // This is a simplified example - implement proper HMAC validation
            return !string.IsNullOrEmpty(signature);
        }
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

    public class ManageEngineResponse<T>
    {
        public List<T>? Data { get; set; }
        public int TotalCount { get; set; }
    }
}