using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ITSMBackend.Data;
using ITSMBackend.DTOs;
using ITSMBackend.Models;
using System.Text.Json;

namespace ITSMBackend.Services;

public interface IWorkflowEngineService
{
    Task ProcessTriggersAsync(string entity, string eventType, object entityData, string entityId);
    Task<List<AutomationRuleDto>> GetRulesAsync();
    Task<AutomationRuleDto> CreateRuleAsync(CreateAutomationRuleDto dto);
    Task<List<AutomationExecutionLogDto>> GetExecutionLogsAsync(int limit = 50);
}

public class WorkflowEngineService : IWorkflowEngineService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<WorkflowEngineService> _logger;

    public WorkflowEngineService(ApplicationDbContext context, IMapper mapper, ILogger<WorkflowEngineService> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task ProcessTriggersAsync(string entity, string eventType, object entityData, string entityId)
    {
        var activeRules = await _context.AutomationRules
            .Where(r => r.IsActive && r.TargetEntity == entity && r.TriggerEvent == eventType)
            .ToListAsync();

        if (!activeRules.Any()) return;

        foreach (var rule in activeRules)
        {
            try
            {
                if (EvaluateConditions(rule.ConditionsJson, entityData))
                {
                    await ExecuteActions(rule, entityData, entityId);
                    await LogExecution(rule.Id, entityId, true, $"Successfully executed rule: {rule.Name}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error executing automation rule {rule.Id}");
                await LogExecution(rule.Id, entityId, false, ex.Message);
            }
        }
    }

    private bool EvaluateConditions(string conditionsJson, object entityData)
    {
        if (string.IsNullOrEmpty(conditionsJson) || conditionsJson == "{}") return true;

        var conditions = JsonSerializer.Deserialize<Dictionary<string, string>>(conditionsJson);
        if (conditions == null) return true;

        var entityType = entityData.GetType();
        foreach (var condition in conditions)
        {
            var prop = entityType.GetProperty(condition.Key);
            if (prop == null) continue;

            var val = prop.GetValue(entityData)?.ToString();
            if (val != condition.Value) return false;
        }

        return true;
    }

    private async Task ExecuteActions(AutomationRule rule, object entityData, string entityId)
    {
        var actions = JsonSerializer.Deserialize<List<Dictionary<string, string>>>(rule.ActionsJson);
        if (actions == null) return;

        foreach (var action in actions)
        {
            if (action.TryGetValue("Action", out var actionType) && actionType == "SetField")
            {
                if (action.TryGetValue("Field", out var fieldName) && action.TryGetValue("Value", out var fieldValue))
                {
                    var prop = entityData.GetType().GetProperty(fieldName);
                    if (prop != null)
                    {
                        // Basic conversion for int/string
                        object convertedValue = fieldValue;
                        if (prop.PropertyType == typeof(int) || prop.PropertyType == typeof(int?))
                            convertedValue = int.Parse(fieldValue);

                        prop.SetValue(entityData, convertedValue);
                    }
                }
            }
        }

        await _context.SaveChangesAsync();
    }

    private async Task LogExecution(int ruleId, string entityId, bool success, string? summary = null, string? error = null)
    {
        _context.AutomationExecutionLogs.Add(new AutomationExecutionLog
        {
            RuleId = ruleId,
            EntityId = entityId,
            Success = success,
            ActionSummary = summary,
            ErrorMessage = error,
            ExecutedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();
    }

    public async Task<List<AutomationRuleDto>> GetRulesAsync()
    {
        var rules = await _context.AutomationRules.OrderByDescending(r => r.CreatedAt).ToListAsync();
        return _mapper.Map<List<AutomationRuleDto>>(rules);
    }

    public async Task<AutomationRuleDto> CreateRuleAsync(CreateAutomationRuleDto dto)
    {
        var rule = _mapper.Map<AutomationRule>(dto);
        _context.AutomationRules.Add(rule);
        await _context.SaveChangesAsync();
        return _mapper.Map<AutomationRuleDto>(rule);
    }

    public async Task<List<AutomationExecutionLogDto>> GetExecutionLogsAsync(int limit = 50)
    {
        var logs = await _context.AutomationExecutionLogs
            .Include(l => l.Rule)
            .OrderByDescending(l => l.ExecutedAt)
            .Take(limit)
            .ToListAsync();
        return _mapper.Map<List<AutomationExecutionLogDto>>(logs);
    }
}
