using System.Text.Json;
using Microsoft.Extensions.Options;

namespace ITSMBackend.Services;

public class GfsaErpSettings
{
    public string BaseUrl { get; set; } = string.Empty;
}

public class ErpEmployee
{
    public int Id { get; set; }
    public string? UserName { get; set; }
    public string? EmailAddress { get; set; }
    public string? Name { get; set; }
    public string? Surname { get; set; }
    public string? PhoneNumber { get; set; }
    public string? JobTitle { get; set; }
    public string? OrganizationUnitName { get; set; }
}

public interface IErpIntegrationService
{
    Task<ErpEmployee?> GetEmployeeByIdAsync(int externalId);
}

public class ErpIntegrationService : IErpIntegrationService
{
    private readonly HttpClient _httpClient;
    private readonly GfsaErpSettings _settings;
    private readonly ILogger<ErpIntegrationService> _logger;

    private static readonly int[] UnitIds = { 10497, 10043, 10042 };

    public ErpIntegrationService(HttpClient httpClient, IOptions<GfsaErpSettings> settings, ILogger<ErpIntegrationService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<ErpEmployee?> GetEmployeeByIdAsync(int externalId)
    {
        const int pageSize = 100;

        foreach (var unitId in UnitIds)
        {
            try
            {
                var skipCount = 0;
                var totalCount = int.MaxValue;

                while (skipCount < totalCount)
                {
                    var url = $"{_settings.BaseUrl}/api/services/app/OrganizationUnit/GetOrganizationUnitUsers?Id={unitId}&MaxResultCount={pageSize}&SkipCount={skipCount}";
                    var response = await _httpClient.GetStringAsync(url);
                    using var document = JsonDocument.Parse(response);

                    totalCount = ReadTotalCount(document.RootElement) ?? pageSize;

                    var candidates = EnumerateCandidateObjects(document.RootElement);
                    foreach (var candidate in candidates)
                    {
                        var employee = TryMapEmployee(candidate, externalId, unitId);
                        if (employee != null)
                        {
                            return employee;
                        }
                    }

                    if (totalCount <= skipCount + pageSize)
                    {
                        break;
                    }

                    skipCount += pageSize;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to fetch employees for unit {UnitId}", unitId);
            }
        }

        return null;
    }

    private static int? ReadTotalCount(JsonElement root)
    {
        if (root.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        if (root.TryGetProperty("result", out var result) && result.ValueKind == JsonValueKind.Object)
        {
            if (result.TryGetProperty("totalCount", out var totalCountValue) && TryReadInt(totalCountValue, out var totalCount))
            {
                return totalCount;
            }
        }

        if (root.TryGetProperty("totalCount", out var directTotalCount) && TryReadInt(directTotalCount, out var directCount))
        {
            return directCount;
        }

        return null;
    }

    private IEnumerable<JsonElement> EnumerateCandidateObjects(JsonElement element)
    {
        if (element.ValueKind == JsonValueKind.Object)
        {
            yield return element;

            foreach (var property in element.EnumerateObject())
            {
                foreach (var child in EnumerateCandidateObjects(property.Value))
                {
                    yield return child;
                }
            }
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in element.EnumerateArray())
            {
                foreach (var child in EnumerateCandidateObjects(item))
                {
                    yield return child;
                }
            }
        }
    }

    private ErpEmployee? TryMapEmployee(JsonElement element, int externalId, int unitId)
    {
        if (!MatchesRequestedExternalId(element, externalId))
        {
            return null;
        }

        var userObject = GetNestedObject(element, "user");
        var source = userObject.ValueKind == JsonValueKind.Object ? userObject : element;

        var fullName =
            ReadLocalizedValue(source, "fullName") ??
            ReadLocalizedValue(source, "name") ??
            ReadLocalizedValue(source, "displayName") ??
            BuildName(
                ReadLocalizedValue(source, "firstName"),
                ReadLocalizedValue(source, "lastName"),
                ReadLocalizedValue(source, "surname"));

        return new ErpEmployee
        {
            Id = externalId,
            UserName =
                ReadString(source, "userName") ??
                ReadString(source, "username") ??
                ReadString(source, "loginName") ??
                ReadString(userObject, "userName") ??
                ReadString(userObject, "username") ??
                ReadString(userObject, "loginName"),
            EmailAddress =
                ReadString(source, "emailAddress") ??
                ReadString(source, "email") ??
                ReadString(userObject, "emailAddress") ??
                ReadString(userObject, "email"),
            Name = fullName,
            Surname = ReadLocalizedValue(source, "surname") ?? ReadLocalizedValue(source, "lastName"),
            PhoneNumber =
                ReadString(source, "phoneNumber") ??
                ReadString(source, "mobile") ??
                ReadString(source, "mobileNumber") ??
                ReadString(userObject, "phoneNumber") ??
                ReadString(userObject, "mobile") ??
                ReadString(userObject, "mobileNumber"),
            JobTitle =
                ReadLocalizedValue(source, "jobTitle") ??
                ReadLocalizedValue(source, "title") ??
                ReadLocalizedValue(userObject, "jobTitle") ??
                ReadLocalizedValue(userObject, "title"),
            OrganizationUnitName =
                ReadLocalizedValue(source, "organizationUnitName") ??
                ReadLocalizedValue(source, "organizationUnit") ??
                ReadLocalizedValue(userObject, "organizationUnitName") ??
                ReadLocalizedValue(userObject, "organizationUnit"),
        };
    }

    private static bool MatchesRequestedExternalId(JsonElement element, int externalId)
    {
        if (TryResolveExternalId(element, out var resolvedId) && resolvedId == externalId)
        {
            return true;
        }

        var requestedId = externalId.ToString().Trim();
        var candidateProperties = new[]
        {
            "id",
            "Id",
            "userId",
            "UserId",
            "employeeId",
            "EmployeeId",
            "userName",
            "username",
            "loginName",
            "employeeNo",
            "employeeNumber",
            "staffId",
            "code",
            "extensionNo",
            "otherExtensionNo",
            "directNumber",
            "otherDirectNumber",
        };

        var nested = GetNestedObject(element, "user");

        foreach (var candidate in candidateProperties)
        {
            foreach (var candidateValue in new[]
                     {
                         ReadString(element, candidate),
                         ReadString(nested, candidate)
                     })
            {
                var normalized = NormalizeIdentifier(candidateValue);
                if (!string.IsNullOrWhiteSpace(normalized) &&
                    string.Equals(normalized, requestedId, StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }
        }

        return false;
    }

    private static JsonElement GetNestedObject(JsonElement element, string propertyName)
    {
        if (element.ValueKind != JsonValueKind.Object || !element.TryGetProperty(propertyName, out var child))
        {
            return default;
        }

        return child;
    }

    private static bool TryResolveExternalId(JsonElement element, out int externalId)
    {
        externalId = 0;

        if (element.ValueKind != JsonValueKind.Object)
        {
            return false;
        }

        var candidates = new[]
        {
            "id",
            "Id",
            "userId",
            "UserId",
            "employeeId",
            "EmployeeId",
        };

        foreach (var candidate in candidates)
        {
            if (element.TryGetProperty(candidate, out var value))
            {
                if (TryReadInt(value, out externalId))
                {
                    return true;
                }
            }
        }

        if (element.TryGetProperty("user", out var nestedUser) && nestedUser.ValueKind == JsonValueKind.Object)
        {
            return TryResolveExternalId(nestedUser, out externalId);
        }

        return false;
    }

    private static bool TryReadInt(JsonElement value, out int result)
    {
        result = 0;

        return value.ValueKind switch
        {
            JsonValueKind.Number => value.TryGetInt32(out result),
            JsonValueKind.String => int.TryParse(value.GetString(), out result),
            _ => false,
        };
    }

    private static string? ReadString(JsonElement element, string propertyName)
    {
        if (element.ValueKind != JsonValueKind.Object || !element.TryGetProperty(propertyName, out var value))
        {
            return null;
        }

        return value.ValueKind switch
        {
            JsonValueKind.String => ReadStringLikeValue(value.GetString()),
            JsonValueKind.Number => value.ToString(),
            JsonValueKind.Object => ReadLocalizedValue(value),
            JsonValueKind.Array => ReadLocalizedArrayValue(value),
            _ => null,
        };
    }

    private static string? ReadLocalizedValue(JsonElement element, string propertyName)
        => element.ValueKind == JsonValueKind.Object && element.TryGetProperty(propertyName, out var value)
            ? ReadLocalizedValue(value)
            : null;

    private static string? ReadLocalizedValue(JsonElement value)
    {
        return value.ValueKind switch
        {
            JsonValueKind.String => ReadStringLikeValue(value.GetString()),
            JsonValueKind.Number => value.ToString(),
            JsonValueKind.Array => ReadLocalizedArrayValue(value),
            JsonValueKind.Object => ReadLocalizedObjectValue(value),
            _ => null,
        };
    }

    private static string? ReadLocalizedArrayValue(JsonElement array)
    {
        var englishCandidates = new List<string?>();
        var fallbackCandidates = new List<string?>();
        var arabicCandidates = new List<string?>();

        foreach (var item in array.EnumerateArray())
        {
            if (TryReadLocalizedProperty(item, "en", out var english))
            {
                englishCandidates.Add(english);
            }

            if (TryReadLocalizedProperty(item, "english", out english))
            {
                englishCandidates.Add(english);
            }

            if (TryReadLocalizedProperty(item, "ar", out var arabic))
            {
                arabicCandidates.Add(arabic);
            }

            if (TryReadLocalizedProperty(item, "arabic", out arabic))
            {
                arabicCandidates.Add(arabic);
            }

            var preferred = ReadLocalizedObjectValue(item);
            if (!string.IsNullOrWhiteSpace(preferred))
            {
                fallbackCandidates.Add(preferred);
            }
        }

        return englishCandidates.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value))
            ?? fallbackCandidates.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value))
            ?? arabicCandidates.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value));
    }

    private static string? ReadLocalizedObjectValue(JsonElement value)
    {
        if (value.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        if (TryReadLocalizedProperty(value, "en", out var english))
        {
            return english;
        }

        if (TryReadLocalizedProperty(value, "english", out english))
        {
            return english;
        }

        if (TryReadLocalizedProperty(value, "ar", out var arabic))
        {
            return arabic;
        }

        if (TryReadLocalizedProperty(value, "arabic", out arabic))
        {
            return arabic;
        }

        var preferredKeys = new[] { "en", "english", "name", "displayName", "value", "label", "text", "ar", "arabic" };
        foreach (var key in preferredKeys)
        {
            if (value.TryGetProperty(key, out var nested) && nested.ValueKind == JsonValueKind.String)
            {
                var text = ReadStringLikeValue(nested.GetString());
                if (!string.IsNullOrWhiteSpace(text))
                {
                    return text;
                }
            }
        }

        foreach (var property in value.EnumerateObject())
        {
            if (property.Value.ValueKind == JsonValueKind.String)
            {
                var text = ReadStringLikeValue(property.Value.GetString());
                if (!string.IsNullOrWhiteSpace(text))
                {
                    return text;
                }
            }
        }

        return null;
    }

    private static bool TryReadLocalizedProperty(JsonElement value, string propertyName, out string? result)
    {
        result = null;

        if (!value.TryGetProperty(propertyName, out var nested))
        {
            return false;
        }

        result = ReadLocalizedValue(nested);
        return !string.IsNullOrWhiteSpace(result);
    }

    private static string? ReadStringLikeValue(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var trimmed = value.Trim();

        if ((trimmed.StartsWith("{") && trimmed.EndsWith("}")) || (trimmed.StartsWith("[") && trimmed.EndsWith("]")))
        {
            try
            {
                using var document = JsonDocument.Parse(trimmed);
                var parsed = ReadLocalizedValue(document.RootElement);
                if (!string.IsNullOrWhiteSpace(parsed))
                {
                    return parsed;
                }
            }
            catch (JsonException)
            {
                // Fall back to the raw trimmed string.
            }
        }

        return trimmed;
    }

    private static string? NormalizeIdentifier(string? value)
    {
        var trimmed = ReadStringLikeValue(value);
        if (string.IsNullOrWhiteSpace(trimmed))
        {
            return null;
        }

        return trimmed.Trim().TrimStart('0');
    }

    private static string? BuildName(string? firstName, string? lastName, string? surname)
    {
        var parts = new[] { firstName, lastName, surname }
            .Where(part => !string.IsNullOrWhiteSpace(part))
            .Select(part => part!.Trim())
            .ToArray();

        return parts.Length > 0 ? string.Join(" ", parts) : null;
    }
}
