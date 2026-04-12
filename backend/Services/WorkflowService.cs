using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ITSMBackend.Data;
using ITSMBackend.DTOs;
using ITSMBackend.Models;

namespace ITSMBackend.Services;

public interface IWorkflowService
{
    Task<List<WorkflowDto>> GetAllAsync();
    Task<WorkflowDto?> GetByIdAsync(int id);
    Task<WorkflowDto> CreateAsync(CreateWorkflowDto dto, int userId);
    Task<WorkflowDto> UpdateAsync(int id, UpdateWorkflowDto dto);
    Task DeleteAsync(int id);
    Task<WorkflowInstanceDto> CreateInstanceAsync(int workflowId, int userId);
    Task<List<WorkflowInstanceDto>> GetInstancesAsync(int workflowId);
}

public class WorkflowService : IWorkflowService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public WorkflowService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<WorkflowDto>> GetAllAsync()
    {
        var workflows = await _context.Workflows
            .Include(w => w.Steps)
            .Include(w => w.CreatedBy)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<WorkflowDto>>(workflows);
    }

    public async Task<WorkflowDto?> GetByIdAsync(int id)
    {
        var workflow = await _context.Workflows
            .Include(w => w.Steps)
            .Include(w => w.CreatedBy)
            .FirstOrDefaultAsync(w => w.Id == id);

        return workflow == null ? null : _mapper.Map<WorkflowDto>(workflow);
    }

    public async Task<WorkflowDto> CreateAsync(CreateWorkflowDto dto, int userId)
    {
        var workflow = _mapper.Map<Workflow>(dto);
        workflow.CreatedById = userId;
        workflow.Status = "Draft";
        workflow.CreatedAt = DateTime.UtcNow;
        workflow.UpdatedAt = DateTime.UtcNow;
        workflow.Version = 1;

        _context.Workflows.Add(workflow);
        await _context.SaveChangesAsync();

        await _context.Entry(workflow).Reference(w => w.CreatedBy).LoadAsync();

        return _mapper.Map<WorkflowDto>(workflow);
    }

    public async Task<WorkflowDto> UpdateAsync(int id, UpdateWorkflowDto dto)
    {
        var workflow = await _context.Workflows
            .Include(w => w.Steps)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workflow == null)
            throw new ArgumentException("Workflow not found");

        _mapper.Map(dto, workflow);
        workflow.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _context.Entry(workflow).Reference(w => w.CreatedBy).LoadAsync();

        return _mapper.Map<WorkflowDto>(workflow);
    }

    public async Task DeleteAsync(int id)
    {
        var workflow = await _context.Workflows.FindAsync(id);
        if (workflow == null)
            throw new ArgumentException("Workflow not found");

        _context.Workflows.Remove(workflow);
        await _context.SaveChangesAsync();
    }

    public async Task<WorkflowInstanceDto> CreateInstanceAsync(int workflowId, int userId)
    {
        var workflow = await _context.Workflows.FindAsync(workflowId);
        if (workflow == null)
            throw new ArgumentException("Workflow not found");

        var instance = new WorkflowInstance
        {
            WorkflowId = workflowId,
            TriggeredById = userId,
            Status = "Active",
            StartedAt = DateTime.UtcNow
        };

        _context.WorkflowInstances.Add(instance);
        await _context.SaveChangesAsync();

        await _context.Entry(instance).Reference(wi => wi.TriggeredBy).LoadAsync();

        return _mapper.Map<WorkflowInstanceDto>(instance);
    }

    public async Task<List<WorkflowInstanceDto>> GetInstancesAsync(int workflowId)
    {
        var instances = await _context.WorkflowInstances
            .Where(wi => wi.WorkflowId == workflowId)
            .Include(wi => wi.TriggeredBy)
            .OrderByDescending(wi => wi.StartedAt)
            .ToListAsync();

        return _mapper.Map<List<WorkflowInstanceDto>>(instances);
    }
}
