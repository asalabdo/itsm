using Microsoft.EntityFrameworkCore;
using ITSMBackend.Models;

namespace ITSMBackend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Ticket> Tickets { get; set; } = null!;
    public DbSet<TicketComment> TicketComments { get; set; } = null!;
    public DbSet<TicketActivity> TicketActivities { get; set; } = null!;
    public DbSet<Asset> Assets { get; set; } = null!;
    public DbSet<AssetHistory> AssetHistories { get; set; } = null!;
    public DbSet<ChangeRequest> ChangeRequests { get; set; } = null!;
    public DbSet<ServiceRequest> ServiceRequests { get; set; } = null!;
    public DbSet<ApprovalItem> ApprovalItems { get; set; } = null!;
    public DbSet<Workflow> Workflows { get; set; } = null!;
    public DbSet<WorkflowStep> WorkflowSteps { get; set; } = null!;
    public DbSet<WorkflowInstance> WorkflowInstances { get; set; } = null!;
    public DbSet<WorkflowInstanceStep> WorkflowInstanceSteps { get; set; } = null!;
    public DbSet<AuditLog> AuditLogs { get; set; } = null!;
    public DbSet<DashboardMetric> DashboardMetrics { get; set; } = null!;
    public DbSet<PerformanceMetric> PerformanceMetrics { get; set; } = null!;

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

        // Indexes
        modelBuilder.Entity<Ticket>().HasIndex(t => t.TicketNumber).IsUnique();
        modelBuilder.Entity<ChangeRequest>().HasIndex(cr => cr.ChangeNumber).IsUnique();
        modelBuilder.Entity<ServiceRequest>().HasIndex(sr => sr.RequestNumber).IsUnique();
        modelBuilder.Entity<Asset>().HasIndex(a => a.AssetTag).IsUnique();
        modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

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
    }
}
