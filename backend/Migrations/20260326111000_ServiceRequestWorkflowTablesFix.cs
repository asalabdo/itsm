using ITSMBackend.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ITSMBackend.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260326111000_ServiceRequestWorkflowTablesFix")]
public partial class ServiceRequestWorkflowTablesFix : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            IF OBJECT_ID(N'[ApprovalRequests]', N'U') IS NULL
            BEGIN
                CREATE TABLE [ApprovalRequests] (
                    [Id] int NOT NULL IDENTITY,
                    [ServiceRequestId] int NOT NULL,
                    [ApproverId] int NOT NULL,
                    [Status] nvarchar(max) NOT NULL,
                    [Comments] nvarchar(max) NULL,
                    [DecidedAt] datetime2 NULL,
                    [CreatedAt] datetime2 NOT NULL,
                    CONSTRAINT [PK_ApprovalRequests] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_ApprovalRequests_ServiceRequests_ServiceRequestId] FOREIGN KEY ([ServiceRequestId]) REFERENCES [ServiceRequests] ([Id]) ON DELETE CASCADE,
                    CONSTRAINT [FK_ApprovalRequests_Users_ApproverId] FOREIGN KEY ([ApproverId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
                );

                CREATE INDEX [IX_ApprovalRequests_ServiceRequestId] ON [ApprovalRequests] ([ServiceRequestId]);
                CREATE INDEX [IX_ApprovalRequests_ApproverId] ON [ApprovalRequests] ([ApproverId]);
            END
        ");

        migrationBuilder.Sql(@"
            IF OBJECT_ID(N'[FulfillmentTasks]', N'U') IS NULL
            BEGIN
                CREATE TABLE [FulfillmentTasks] (
                    [Id] int NOT NULL IDENTITY,
                    [ServiceRequestId] int NOT NULL,
                    [Title] nvarchar(max) NOT NULL,
                    [Description] nvarchar(max) NOT NULL,
                    [Status] nvarchar(max) NOT NULL,
                    [AssignedToId] int NULL,
                    [CompletedAt] datetime2 NULL,
                    [CreatedAt] datetime2 NOT NULL,
                    CONSTRAINT [PK_FulfillmentTasks] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_FulfillmentTasks_ServiceRequests_ServiceRequestId] FOREIGN KEY ([ServiceRequestId]) REFERENCES [ServiceRequests] ([Id]) ON DELETE CASCADE,
                    CONSTRAINT [FK_FulfillmentTasks_Users_AssignedToId] FOREIGN KEY ([AssignedToId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
                );

                CREATE INDEX [IX_FulfillmentTasks_ServiceRequestId] ON [FulfillmentTasks] ([ServiceRequestId]);
                CREATE INDEX [IX_FulfillmentTasks_AssignedToId] ON [FulfillmentTasks] ([AssignedToId]);
            END
        ");

        migrationBuilder.Sql(@"
            IF OBJECT_ID(N'[RequestAuditLogs]', N'U') IS NULL
            BEGIN
                CREATE TABLE [RequestAuditLogs] (
                    [Id] int NOT NULL IDENTITY,
                    [ServiceRequestId] int NOT NULL,
                    [Action] nvarchar(max) NOT NULL,
                    [Details] nvarchar(max) NOT NULL,
                    [PerformedById] int NULL,
                    [Timestamp] datetime2 NOT NULL,
                    CONSTRAINT [PK_RequestAuditLogs] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_RequestAuditLogs_ServiceRequests_ServiceRequestId] FOREIGN KEY ([ServiceRequestId]) REFERENCES [ServiceRequests] ([Id]) ON DELETE CASCADE,
                    CONSTRAINT [FK_RequestAuditLogs_Users_PerformedById] FOREIGN KEY ([PerformedById]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
                );

                CREATE INDEX [IX_RequestAuditLogs_ServiceRequestId] ON [RequestAuditLogs] ([ServiceRequestId]);
                CREATE INDEX [IX_RequestAuditLogs_PerformedById] ON [RequestAuditLogs] ([PerformedById]);
            END
        ");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            IF OBJECT_ID(N'[RequestAuditLogs]', N'U') IS NOT NULL DROP TABLE [RequestAuditLogs];
            IF OBJECT_ID(N'[FulfillmentTasks]', N'U') IS NOT NULL DROP TABLE [FulfillmentTasks];
            IF OBJECT_ID(N'[ApprovalRequests]', N'U') IS NOT NULL DROP TABLE [ApprovalRequests];
        ");
    }
}
