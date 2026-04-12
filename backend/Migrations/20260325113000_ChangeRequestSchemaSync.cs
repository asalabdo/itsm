using ITSMBackend.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ITSMBackend.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260325113000_ChangeRequestSchemaSync")]
public partial class ChangeRequestSchemaSync : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            IF COL_LENGTH('ChangeRequests', 'Category') IS NULL
                ALTER TABLE [ChangeRequests] ADD [Category] nvarchar(max) NOT NULL CONSTRAINT [DF_ChangeRequests_Category] DEFAULT ('Normal') WITH VALUES;

            IF COL_LENGTH('ChangeRequests', 'ImplementationPlan') IS NULL
                ALTER TABLE [ChangeRequests] ADD [ImplementationPlan] nvarchar(max) NULL;

            IF COL_LENGTH('ChangeRequests', 'BackoutPlan') IS NULL
                ALTER TABLE [ChangeRequests] ADD [BackoutPlan] nvarchar(max) NULL;

            IF COL_LENGTH('ChangeRequests', 'TestingPlan') IS NULL
                ALTER TABLE [ChangeRequests] ADD [TestingPlan] nvarchar(max) NULL;

            IF COL_LENGTH('ChangeRequests', 'RiskLevel') IS NULL
                ALTER TABLE [ChangeRequests] ADD [RiskLevel] nvarchar(max) NOT NULL CONSTRAINT [DF_ChangeRequests_RiskLevel] DEFAULT ('Low') WITH VALUES;

            IF COL_LENGTH('ChangeRequests', 'ScheduledStartDate') IS NULL
                ALTER TABLE [ChangeRequests] ADD [ScheduledStartDate] datetime2 NULL;

            IF COL_LENGTH('ChangeRequests', 'ScheduledEndDate') IS NULL
                ALTER TABLE [ChangeRequests] ADD [ScheduledEndDate] datetime2 NULL;
        ");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            IF COL_LENGTH('ChangeRequests', 'ScheduledEndDate') IS NOT NULL
                ALTER TABLE [ChangeRequests] DROP COLUMN [ScheduledEndDate];

            IF COL_LENGTH('ChangeRequests', 'ScheduledStartDate') IS NOT NULL
                ALTER TABLE [ChangeRequests] DROP COLUMN [ScheduledStartDate];

            IF COL_LENGTH('ChangeRequests', 'RiskLevel') IS NOT NULL
                ALTER TABLE [ChangeRequests] DROP COLUMN [RiskLevel];

            IF COL_LENGTH('ChangeRequests', 'TestingPlan') IS NOT NULL
                ALTER TABLE [ChangeRequests] DROP COLUMN [TestingPlan];

            IF COL_LENGTH('ChangeRequests', 'BackoutPlan') IS NOT NULL
                ALTER TABLE [ChangeRequests] DROP COLUMN [BackoutPlan];

            IF COL_LENGTH('ChangeRequests', 'ImplementationPlan') IS NOT NULL
                ALTER TABLE [ChangeRequests] DROP COLUMN [ImplementationPlan];

            IF COL_LENGTH('ChangeRequests', 'Category') IS NOT NULL
                ALTER TABLE [ChangeRequests] DROP COLUMN [Category];
        ");
    }
}
