using ITSMBackend.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ITSMBackend.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260325114500_AutomationTables")]
public partial class AutomationTables : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            IF OBJECT_ID(N'[AutomationRules]', N'U') IS NULL
            BEGIN
                CREATE TABLE [AutomationRules] (
                    [Id] int NOT NULL IDENTITY,
                    [Name] nvarchar(max) NOT NULL,
                    [Description] nvarchar(max) NOT NULL,
                    [TargetEntity] nvarchar(max) NOT NULL,
                    [TriggerEvent] nvarchar(max) NOT NULL,
                    [IsActive] bit NOT NULL,
                    [ConditionsJson] nvarchar(max) NOT NULL,
                    [ActionsJson] nvarchar(max) NOT NULL,
                    [CreatedAt] datetime2 NOT NULL,
                    [UpdatedAt] datetime2 NOT NULL,
                    CONSTRAINT [PK_AutomationRules] PRIMARY KEY ([Id])
                );
            END

            IF OBJECT_ID(N'[AutomationExecutionLogs]', N'U') IS NULL
            BEGIN
                CREATE TABLE [AutomationExecutionLogs] (
                    [Id] int NOT NULL IDENTITY,
                    [RuleId] int NOT NULL,
                    [EntityId] nvarchar(max) NOT NULL,
                    [Success] bit NOT NULL,
                    [ErrorMessage] nvarchar(max) NULL,
                    [ActionSummary] nvarchar(max) NULL,
                    [ExecutedAt] datetime2 NOT NULL,
                    CONSTRAINT [PK_AutomationExecutionLogs] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_AutomationExecutionLogs_AutomationRules_RuleId] FOREIGN KEY ([RuleId]) REFERENCES [AutomationRules] ([Id]) ON DELETE CASCADE
                );

                CREATE INDEX [IX_AutomationExecutionLogs_RuleId] ON [AutomationExecutionLogs] ([RuleId]);
            END
        ");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            IF OBJECT_ID(N'[AutomationExecutionLogs]', N'U') IS NOT NULL
                DROP TABLE [AutomationExecutionLogs];

            IF OBJECT_ID(N'[AutomationRules]', N'U') IS NOT NULL
                DROP TABLE [AutomationRules];
        ");
    }
}
