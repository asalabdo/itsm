using System.Security.Claims;
using ITSMBackend.Data;
using ITSMBackend.DTOs;
using ITSMBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ITSMBackend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private static readonly object SettingsLock = new();
    private static SettingsProfileDto Profile = new();
    private readonly ApplicationDbContext _context;

    public SettingsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("profile")]
    public async Task<ActionResult<SettingsProfileDto>> GetProfile()
    {
        await EnsureDefaultIntegrationsAsync();

        var profile = await BuildProfileAsync();
        return Ok(profile);
    }

    [HttpPut("profile")]
    public async Task<ActionResult<SettingsProfileDto>> UpdateProfile([FromBody] SettingsProfileDto updatedProfile)
    {
        if (updatedProfile == null)
        {
            return BadRequest();
        }

        await EnsureDefaultIntegrationsAsync();

        lock (SettingsLock)
        {
            Profile.Theme = updatedProfile.Theme;
            Profile.Language = updatedProfile.Language;
            Profile.DefaultLandingPage = updatedProfile.DefaultLandingPage;
            Profile.NotificationEmail = updatedProfile.NotificationEmail;
            Profile.AutoRefreshEnabled = updatedProfile.AutoRefreshEnabled;
            Profile.AutoRefreshSeconds = updatedProfile.AutoRefreshSeconds;
            Profile.SlaWarningMinutes = updatedProfile.SlaWarningMinutes;
            Profile.EscalationMinutes = updatedProfile.EscalationMinutes;
            Profile.EnabledModules = updatedProfile.EnabledModules?.Any() == true
                ? updatedProfile.EnabledModules
                : Profile.EnabledModules;
        }

        var currentUser = await GetCurrentUserAsync();
        if (currentUser != null && updatedProfile.NotificationPreferences != null)
        {
            currentUser.EmailUpdatesEnabled = updatedProfile.NotificationPreferences.EmailUpdates;
            currentUser.SmsAlertsEnabled = updatedProfile.NotificationPreferences.SmsAlerts;
            currentUser.PushNotificationsEnabled = updatedProfile.NotificationPreferences.PushNotifications;
            currentUser.WeeklyDigestEnabled = updatedProfile.NotificationPreferences.WeeklyDigest;
            currentUser.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        await UpsertIntegrationsAsync(updatedProfile.Integrations);

        return Ok(await BuildProfileAsync());
    }

    [HttpGet("modules")]
    public ActionResult<IEnumerable<string>> GetModules()
    {
        lock (SettingsLock)
        {
            return Ok(Profile.EnabledModules);
        }
    }

    private async Task<SettingsProfileDto> BuildProfileAsync()
    {
        SettingsProfileDto snapshot;
        lock (SettingsLock)
        {
            snapshot = new SettingsProfileDto
            {
                DisplayName = Profile.DisplayName,
                Role = Profile.Role,
                Theme = Profile.Theme,
                Language = Profile.Language,
                DefaultLandingPage = Profile.DefaultLandingPage,
                NotificationEmail = Profile.NotificationEmail,
                EmailNotifications = Profile.EmailNotifications,
                PushNotifications = Profile.PushNotifications,
                AutoRefreshEnabled = Profile.AutoRefreshEnabled,
                AutoRefreshSeconds = Profile.AutoRefreshSeconds,
                SlaWarningMinutes = Profile.SlaWarningMinutes,
                EscalationMinutes = Profile.EscalationMinutes,
                EnabledModules = Profile.EnabledModules.ToList(),
                NotificationPreferences = new NotificationPreferencesDto
                {
                    EmailUpdates = Profile.NotificationPreferences.EmailUpdates,
                    SmsAlerts = Profile.NotificationPreferences.SmsAlerts,
                    PushNotifications = Profile.NotificationPreferences.PushNotifications,
                    WeeklyDigest = Profile.NotificationPreferences.WeeklyDigest,
                },
            };
        }

        var currentUser = await GetCurrentUserAsync();
        if (currentUser != null)
        {
            snapshot.DisplayName = $"{currentUser.FirstName} {currentUser.LastName}".Trim();
            snapshot.Role = currentUser.Role.ToString();
            snapshot.NotificationEmail = currentUser.Email;
            snapshot.NotificationPreferences = new NotificationPreferencesDto
            {
                EmailUpdates = currentUser.EmailUpdatesEnabled,
                SmsAlerts = currentUser.SmsAlertsEnabled,
                PushNotifications = currentUser.PushNotificationsEnabled,
                WeeklyDigest = currentUser.WeeklyDigestEnabled,
            };
        }

        snapshot.Integrations = await _context.ExternalIntegrations
            .OrderBy(i => i.Name)
            .Select(i => new IntegrationSettingsDto
            {
                Id = i.Id,
                Name = i.Name,
                Provider = i.Provider,
                IsEnabled = i.IsEnabled,
                ConfigurationJson = i.ConfigurationJson,
                EventSubscriptions = i.EventSubscriptions,
            })
            .ToListAsync();

        return snapshot;
    }

    private async Task EnsureDefaultIntegrationsAsync()
    {
        if (await _context.ExternalIntegrations.AnyAsync())
        {
            return;
        }

        _context.ExternalIntegrations.AddRange(
            new ExternalIntegration
            {
                Name = "Email Delivery",
                Provider = "Email",
                ConfigurationJson = "{\"host\":\"\",\"port\":587,\"username\":\"\",\"password\":\"\"}",
                EventSubscriptions = "[\"TicketCreated\",\"TicketUpdated\",\"WeeklyDigest\"]",
                IsEnabled = true,
            },
            new ExternalIntegration
            {
                Name = "SMS Alerts",
                Provider = "SMS",
                ConfigurationJson = "{\"provider\":\"\",\"apiKey\":\"\",\"senderId\":\"\"}",
                EventSubscriptions = "[\"CriticalIncident\",\"Escalation\"]",
                IsEnabled = false,
            },
            new ExternalIntegration
            {
                Name = "Push Notifications",
                Provider = "Push",
                ConfigurationJson = "{\"provider\":\"Browser\",\"apiKey\":\"\",\"projectId\":\"\"}",
                EventSubscriptions = "[\"TicketUpdated\",\"AssignmentChanged\"]",
                IsEnabled = true,
            }
        );

        await _context.SaveChangesAsync();
    }

    private async Task UpsertIntegrationsAsync(IEnumerable<IntegrationSettingsDto>? integrations)
    {
        if (integrations == null)
        {
            return;
        }

        foreach (var dto in integrations)
        {
            var integration = dto.Id > 0
                ? await _context.ExternalIntegrations.FirstOrDefaultAsync(i => i.Id == dto.Id)
                : null;

            integration ??= await _context.ExternalIntegrations.FirstOrDefaultAsync(i =>
                i.Provider == dto.Provider || i.Name == dto.Name);

            if (integration == null)
            {
                integration = new ExternalIntegration();
                _context.ExternalIntegrations.Add(integration);
            }

            integration.Name = dto.Name?.Trim() ?? integration.Name;
            integration.Provider = dto.Provider?.Trim() ?? integration.Provider;
            integration.IsEnabled = dto.IsEnabled;
            integration.ConfigurationJson = string.IsNullOrWhiteSpace(dto.ConfigurationJson) ? "{}" : dto.ConfigurationJson;
            integration.EventSubscriptions = string.IsNullOrWhiteSpace(dto.EventSubscriptions) ? "[]" : dto.EventSubscriptions;
            integration.LastSyncAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }

    private async Task<User?> GetCurrentUserAsync()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return null;
        }

        return await _context.Users.FirstOrDefaultAsync(u => u.Id == userId.Value);
    }

    private int? GetCurrentUserId()
    {
        var candidateClaims = new[]
        {
            User.FindFirstValue(ClaimTypes.NameIdentifier),
            User.FindFirstValue(ClaimTypes.Name),
            User.FindFirstValue("sub"),
            User.FindFirstValue("user_id"),
        };

        foreach (var claim in candidateClaims)
        {
            if (int.TryParse(claim, out var parsed))
            {
                return parsed;
            }
        }

        return null;
    }
}
