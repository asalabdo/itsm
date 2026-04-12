using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using ITSMBackend.Models;

namespace ITSMBackend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.ConfigureWarnings(warnings => warnings.Ignore(RelationalEventId.PendingModelChangesWarning));
        base.OnConfiguring(optionsBuilder);
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Ticket> Tickets { get; set; } = null!;
    public DbSet<TicketComment> TicketComments { get; set; } = null!;
    public DbSet<TicketActivity> TicketActivities { get; set; } = null!;
    public DbSet<TicketAttachment> TicketAttachments { get; set; } = null!;
    public DbSet<Asset> Assets { get; set; } = null!;
    public DbSet<AssetHistory> AssetHistories { get; set; } = null!;
    public DbSet<AssetRelationship> AssetRelationships { get; set; } = null!;
    public DbSet<ProblemRecord> ProblemRecords { get; set; } = null!;
    public DbSet<ProblemTicketLink> ProblemTicketLinks { get; set; } = null!;
    public DbSet<ChangeRequest> ChangeRequests { get; set; } = null!;
    public DbSet<ServiceRequest> ServiceRequests { get; set; } = null!;
    public DbSet<ApprovalItem> ApprovalItems { get; set; } = null!;
    public DbSet<Workflow> Workflows { get; set; } = null!;
    public DbSet<WorkflowStep> WorkflowSteps { get; set; } = null!;
    public DbSet<WorkflowInstance> WorkflowInstances { get; set; } = null!;
    public DbSet<WorkflowInstanceStep> WorkflowInstanceSteps { get; set; } = null!;
    public DbSet<AuditLog> AuditLogs { get; set; } = null!;
    public DbSet<DashboardMetric> DashboardMetrics { get; set; } = null!;
    public DbSet<SLAAlert> SLAAlerts { get; set; } = null!;
    public DbSet<PerformanceMetric> PerformanceMetrics { get; set; } = null!;
    public DbSet<AutomationRule> AutomationRules { get; set; } = null!;
    public DbSet<AutomationExecutionLog> AutomationExecutionLogs { get; set; } = null!;
    public DbSet<DataPoint> DataPoints { get; set; } = null!;
    public DbSet<ServiceCatalogItem> ServiceCatalogItems { get; set; } = null!;
    public DbSet<ApprovalRequest> ApprovalRequests { get; set; } = null!;
    public DbSet<FulfillmentTask> FulfillmentTasks { get; set; } = null!;
    public DbSet<RequestAuditLog> RequestAuditLogs { get; set; } = null!;
    public DbSet<Notification> Notifications { get; set; } = null!;
    public DbSet<ServiceLevelAgreement> SLAs { get; set; } = null!;
    public DbSet<TicketStatusHistory> TicketStatusHistories { get; set; } = null!;
    public DbSet<TicketPriorityLookup> TicketPriorities { get; set; } = null!;
    public DbSet<TicketStatusLookup> TicketStatuses { get; set; } = null!;
    public DbSet<TicketCategoryLookup> TicketCategories { get; set; } = null!;
    public DbSet<TicketAssignment> TicketAssignments { get; set; } = null!;
    public DbSet<Tag> Tags { get; set; } = null!;
    public DbSet<TicketTag> TicketTags { get; set; } = null!;
    public DbSet<RoleDefinition> Roles { get; set; } = null!;
    public DbSet<PermissionDefinition> Permissions { get; set; } = null!;
    public DbSet<RolePermission> RolePermissions { get; set; } = null!;
    public DbSet<UserRoleLink> UserRoles { get; set; } = null!;
    public DbSet<ExternalIntegration> ExternalIntegrations { get; set; } = null!;
    public DbSet<IntegrationLog> IntegrationLogs { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Ticket relationships
        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.AssignedTo)
            .WithMany(u => u.AssignedTickets)
            .HasForeignKey(t => t.AssignedToId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.RequestedBy)
            .WithMany(u => u.RequestedTickets)
            .HasForeignKey(t => t.RequestedById)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.SLA)
            .WithMany(s => s.Tickets)
            .HasForeignKey(t => t.SlaId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.PriorityLookup)
            .WithMany(p => p.Tickets)
            .HasForeignKey(t => t.PriorityId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.StatusLookup)
            .WithMany(s => s.Tickets)
            .HasForeignKey(t => t.StatusId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.CategoryLookup)
            .WithMany(c => c.Tickets)
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.NoAction);

        // Generate ticket number
        modelBuilder.Entity<Ticket>()
            .Property(t => t.TicketNumber)
            .HasDefaultValue("");

        // TicketComment relationships
        modelBuilder.Entity<TicketComment>()
            .HasOne(tc => tc.Ticket)
            .WithMany(t => t.Comments)
            .HasForeignKey(tc => tc.TicketId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TicketComment>()
            .HasOne(tc => tc.User)
            .WithMany(u => u.Comments)
            .HasForeignKey(tc => tc.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // TicketActivity relationships
        modelBuilder.Entity<TicketActivity>()
            .HasOne(ta => ta.Ticket)
            .WithMany(t => t.Activities)
            .HasForeignKey(ta => ta.TicketId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TicketActivity>()
            .HasOne(ta => ta.User)
            .WithMany(u => u.Activities)
            .HasForeignKey(ta => ta.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TicketAttachment>()
            .HasOne(ta => ta.Ticket)
            .WithMany(t => t.Attachments)
            .HasForeignKey(ta => ta.TicketId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TicketAttachment>()
            .HasOne(ta => ta.User)
            .WithMany()
            .HasForeignKey(ta => ta.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TicketStatusHistory>()
            .HasOne(h => h.Ticket)
            .WithMany(t => t.StatusHistory)
            .HasForeignKey(h => h.TicketId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TicketStatusHistory>()
            .HasOne(h => h.ChangedBy)
            .WithMany(u => u.StatusChanges)
            .HasForeignKey(h => h.ChangedById)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<TicketAssignment>()
            .HasOne(a => a.Ticket)
            .WithMany(t => t.Assignments)
            .HasForeignKey(a => a.TicketId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TicketAssignment>()
            .HasOne(a => a.AssignedTo)
            .WithMany(u => u.AssignedTicketRecords)
            .HasForeignKey(a => a.AssignedToId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<TicketAssignment>()
            .HasOne(a => a.AssignedBy)
            .WithMany()
            .HasForeignKey(a => a.AssignedById)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<TicketTag>()
            .HasKey(tt => new { tt.TicketId, tt.TagId });

        modelBuilder.Entity<TicketTag>()
            .HasOne(tt => tt.Ticket)
            .WithMany(t => t.TicketTags)
            .HasForeignKey(tt => tt.TicketId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TicketTag>()
            .HasOne(tt => tt.Tag)
            .WithMany(t => t.TicketTags)
            .HasForeignKey(tt => tt.TagId)
            .OnDelete(DeleteBehavior.Cascade);

        // Asset relationships
        modelBuilder.Entity<Asset>()
            .HasOne(a => a.Owner)
            .WithMany()
            .HasForeignKey(a => a.OwnerId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<AssetHistory>()
            .HasOne(ah => ah.Asset)
            .WithMany(a => a.History)
            .HasForeignKey(ah => ah.AssetId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AssetRelationship>()
            .HasOne(ar => ar.SourceAsset)
            .WithMany()
            .HasForeignKey(ar => ar.SourceAssetId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<AssetRelationship>()
            .HasOne(ar => ar.TargetAsset)
            .WithMany()
            .HasForeignKey(ar => ar.TargetAssetId)
            .OnDelete(DeleteBehavior.NoAction);

        // Problem management
        modelBuilder.Entity<ProblemRecord>()
            .HasOne(p => p.CreatedBy)
            .WithMany()
            .HasForeignKey(p => p.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProblemTicketLink>()
            .HasOne(pl => pl.ProblemRecord)
            .WithMany(p => p.LinkedTickets)
            .HasForeignKey(pl => pl.ProblemRecordId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProblemTicketLink>()
            .HasOne(pl => pl.Ticket)
            .WithMany()
            .HasForeignKey(pl => pl.TicketId)
            .OnDelete(DeleteBehavior.Cascade);

        // ChangeRequest relationships
        modelBuilder.Entity<ChangeRequest>()
            .HasOne(cr => cr.RequestedBy)
            .WithMany()
            .HasForeignKey(cr => cr.RequestedById)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<ChangeRequest>()
            .HasOne(cr => cr.ApprovedBy)
            .WithMany()
            .HasForeignKey(cr => cr.ApprovedById)
            .OnDelete(DeleteBehavior.NoAction);

        // ServiceRequest relationships
        modelBuilder.Entity<ServiceRequest>()
            .HasOne(sr => sr.RequestedBy)
            .WithMany()
            .HasForeignKey(sr => sr.RequestedById)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<ServiceRequest>()
            .HasOne(sr => sr.AssignedTo)
            .WithMany()
            .HasForeignKey(sr => sr.AssignedToId)
            .OnDelete(DeleteBehavior.NoAction);

        // ApprovalItem relationships
        modelBuilder.Entity<ApprovalItem>()
            .HasOne(ai => ai.AssignedTo)
            .WithMany()
            .HasForeignKey(ai => ai.AssignedToId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<ApprovalItem>()
            .HasOne(ai => ai.RequestedBy)
            .WithMany()
            .HasForeignKey(ai => ai.RequestedById)
            .OnDelete(DeleteBehavior.NoAction);

        // Workflow relationships
        modelBuilder.Entity<Workflow>()
            .HasOne(w => w.CreatedBy)
            .WithMany()
            .HasForeignKey(w => w.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<WorkflowStep>()
            .HasOne(ws => ws.Workflow)
            .WithMany(w => w.Steps)
            .HasForeignKey(ws => ws.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<WorkflowInstance>()
            .HasOne(wi => wi.Workflow)
            .WithMany(w => w.Instances)
            .HasForeignKey(wi => wi.WorkflowId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<WorkflowInstance>()
            .HasOne(wi => wi.TriggeredBy)
            .WithMany()
            .HasForeignKey(wi => wi.TriggeredById)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<WorkflowInstanceStep>()
            .HasOne(wis => wis.Instance)
            .WithMany(wi => wi.Steps)
            .HasForeignKey(wis => wis.InstanceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<WorkflowInstanceStep>()
            .HasOne(wis => wis.AssignedTo)
            .WithMany()
            .HasForeignKey(wis => wis.AssignedToId)
            .OnDelete(DeleteBehavior.NoAction);

        // AuditLog relationships
        modelBuilder.Entity<AuditLog>()
            .HasOne(al => al.User)
            .WithMany()
            .HasForeignKey(al => al.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Automation relationships
        modelBuilder.Entity<AutomationExecutionLog>()
            .HasOne(ael => ael.Rule)
            .WithMany()
            .HasForeignKey(ael => ael.RuleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ServiceLevelAgreement>()
            .HasIndex(s => new { s.Name, s.Priority })
            .IsUnique();

        modelBuilder.Entity<TicketPriorityLookup>()
            .HasIndex(p => p.Name)
            .IsUnique();

        modelBuilder.Entity<TicketStatusLookup>()
            .HasIndex(s => s.Name)
            .IsUnique();

        modelBuilder.Entity<TicketCategoryLookup>()
            .HasIndex(c => new { c.Name, c.ParentId })
            .IsUnique();

        modelBuilder.Entity<TicketCategoryLookup>()
            .HasOne(c => c.Parent)
            .WithMany(c => c.Children)
            .HasForeignKey(c => c.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Tag>()
            .HasIndex(t => t.Name)
            .IsUnique();

        modelBuilder.Entity<RoleDefinition>()
            .HasIndex(r => r.Name)
            .IsUnique();

        modelBuilder.Entity<PermissionDefinition>()
            .HasIndex(p => p.Name)
            .IsUnique();

        modelBuilder.Entity<RolePermission>()
            .HasKey(rp => new { rp.RoleId, rp.PermissionId });

        modelBuilder.Entity<RolePermission>()
            .HasOne(rp => rp.Role)
            .WithMany(r => r.RolePermissions)
            .HasForeignKey(rp => rp.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RolePermission>()
            .HasOne(rp => rp.Permission)
            .WithMany(p => p.RolePermissions)
            .HasForeignKey(rp => rp.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserRoleLink>()
            .HasKey(ur => new { ur.UserId, ur.RoleId });

        modelBuilder.Entity<UserRoleLink>()
            .HasOne(ur => ur.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(ur => ur.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserRoleLink>()
            .HasOne(ur => ur.Role)
            .WithMany(r => r.UserRoles)
            .HasForeignKey(ur => ur.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        modelBuilder.Entity<Ticket>().HasIndex(t => t.TicketNumber).IsUnique();
        modelBuilder.Entity<ChangeRequest>().HasIndex(cr => cr.ChangeNumber).IsUnique();
        modelBuilder.Entity<ServiceRequest>().HasIndex(sr => sr.RequestNumber).IsUnique();
        modelBuilder.Entity<Asset>().HasIndex(a => a.AssetTag).IsUnique();
        modelBuilder.Entity<ProblemRecord>().HasIndex(p => p.ProblemNumber).IsUnique();
        modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<Ticket>().HasIndex(t => t.SlaId);
        modelBuilder.Entity<Ticket>().HasIndex(t => t.PriorityId);
        modelBuilder.Entity<Ticket>().HasIndex(t => t.StatusId);
        modelBuilder.Entity<Ticket>().HasIndex(t => t.CategoryId);
        modelBuilder.Entity<Ticket>().HasIndex(t => t.IsDeleted);
        modelBuilder.Entity<Ticket>().HasIndex(t => t.TenantId);
        modelBuilder.Entity<User>().HasIndex(u => u.IsDeleted);
        modelBuilder.Entity<User>().HasIndex(u => u.TenantId);
        modelBuilder.Entity<User>().HasIndex(u => new { u.ExternalId, u.ExternalSource }).IsUnique();
        modelBuilder.Entity<Asset>().HasIndex(a => a.IsDeleted);
        modelBuilder.Entity<Asset>().HasIndex(a => a.TenantId);
        modelBuilder.Entity<ServiceRequest>().HasIndex(sr => sr.IsDeleted);
        modelBuilder.Entity<ServiceRequest>().HasIndex(sr => sr.TenantId);

        // Decimal precision
        modelBuilder.Entity<Ticket>()
            .Property(t => t.Urgency).HasPrecision(5, 2);
        modelBuilder.Entity<Ticket>()
            .Property(t => t.Impact).HasPrecision(5, 2);
        
        modelBuilder.Entity<Asset>()
            .Property(a => a.CostAmount).HasPrecision(18, 2);
        
        modelBuilder.Entity<ServiceRequest>()
            .Property(sr => sr.EstimatedHours).HasPrecision(10, 2);
        modelBuilder.Entity<ServiceRequest>()
            .Property(sr => sr.ActualHours).HasPrecision(10, 2);
        
        modelBuilder.Entity<DashboardMetric>()
            .Property(dm => dm.Value).HasPrecision(18, 2);
        modelBuilder.Entity<DashboardMetric>()
            .Property(dm => dm.TargetValue).HasPrecision(18, 2);
        
        modelBuilder.Entity<PerformanceMetric>()
            .Property(pm => pm.Value).HasPrecision(18, 2);
        modelBuilder.Entity<PerformanceMetric>()
            .Property(pm => pm.PercentageChange).HasPrecision(10, 2);

        // Service Request Management Configuration
        modelBuilder.Entity<ServiceRequest>()
            .HasOne(s => s.CatalogItem)
            .WithMany(c => c.ServiceRequests)
            .HasForeignKey(s => s.CatalogItemId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApprovalRequest>()
            .HasOne(a => a.ServiceRequest)
            .WithMany(s => s.Approvals)
            .HasForeignKey(a => a.ServiceRequestId);

        modelBuilder.Entity<FulfillmentTask>()
            .HasOne(t => t.ServiceRequest)
            .WithMany(s => s.Tasks)
            .HasForeignKey(t => t.ServiceRequestId);

        modelBuilder.Entity<RequestAuditLog>()
            .HasOne(l => l.ServiceRequest)
            .WithMany(s => s.AuditLogs)
            .HasForeignKey(l => l.ServiceRequestId);

    }
}
