using ITSMBackend.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ITSMBackend.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260326093000_CoreItsmGovernance")]
public partial class CoreItsmGovernance : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "IsDeleted",
            table: "Tickets",
            type: "bit",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<DateTime>(
            name: "DeletedAt",
            table: "Tickets",
            type: "datetime2",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "TenantId",
            table: "Tickets",
            type: "int",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "PriorityId",
            table: "Tickets",
            type: "int",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "StatusId",
            table: "Tickets",
            type: "int",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "CategoryId",
            table: "Tickets",
            type: "int",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "SlaId",
            table: "Tickets",
            type: "int",
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "IsDeleted",
            table: "Users",
            type: "bit",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<DateTime>(
            name: "DeletedAt",
            table: "Users",
            type: "datetime2",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "TenantId",
            table: "Users",
            type: "int",
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "IsDeleted",
            table: "Assets",
            type: "bit",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<DateTime>(
            name: "DeletedAt",
            table: "Assets",
            type: "datetime2",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "TenantId",
            table: "Assets",
            type: "int",
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "IsDeleted",
            table: "ServiceRequests",
            type: "bit",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<DateTime>(
            name: "DeletedAt",
            table: "ServiceRequests",
            type: "datetime2",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "TenantId",
            table: "ServiceRequests",
            type: "int",
            nullable: true);

        migrationBuilder.CreateTable(
            name: "SLAs",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                Priority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                ResponseTimeMinutes = table.Column<int>(type: "int", nullable: false),
                ResolutionTimeMinutes = table.Column<int>(type: "int", nullable: false),
                IsActive = table.Column<bool>(type: "bit", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_SLAs", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "TicketPriorities",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                Level = table.Column<int>(type: "int", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_TicketPriorities", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "TicketStatuses",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_TicketStatuses", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "TicketCategories",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                ParentId = table.Column<int>(type: "int", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_TicketCategories", x => x.Id);
                table.ForeignKey(
                    name: "FK_TicketCategories_TicketCategories_ParentId",
                    column: x => x.ParentId,
                    principalTable: "TicketCategories",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateTable(
            name: "TicketStatusHistory",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                TicketId = table.Column<int>(type: "int", nullable: false),
                OldStatus = table.Column<string>(type: "nvarchar(max)", nullable: true),
                NewStatus = table.Column<string>(type: "nvarchar(max)", nullable: true),
                ChangedById = table.Column<int>(type: "int", nullable: true),
                ChangedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_TicketStatusHistory", x => x.Id);
                table.ForeignKey(
                    name: "FK_TicketStatusHistory_Tickets_TicketId",
                    column: x => x.TicketId,
                    principalTable: "Tickets",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_TicketStatusHistory_Users_ChangedById",
                    column: x => x.ChangedById,
                    principalTable: "Users",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateTable(
            name: "TicketAssignments",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                TicketId = table.Column<int>(type: "int", nullable: false),
                AssignedToId = table.Column<int>(type: "int", nullable: false),
                AssignedById = table.Column<int>(type: "int", nullable: false),
                AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_TicketAssignments", x => x.Id);
                table.ForeignKey(
                    name: "FK_TicketAssignments_Tickets_TicketId",
                    column: x => x.TicketId,
                    principalTable: "Tickets",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_TicketAssignments_Users_AssignedById",
                    column: x => x.AssignedById,
                    principalTable: "Users",
                    principalColumn: "Id");
                table.ForeignKey(
                    name: "FK_TicketAssignments_Users_AssignedToId",
                    column: x => x.AssignedToId,
                    principalTable: "Users",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateTable(
            name: "Tags",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Tags", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "Roles",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Roles", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "Permissions",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Permissions", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "TicketTags",
            columns: table => new
            {
                TicketId = table.Column<int>(type: "int", nullable: false),
                TagId = table.Column<int>(type: "int", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_TicketTags", x => new { x.TicketId, x.TagId });
                table.ForeignKey(
                    name: "FK_TicketTags_Tags_TagId",
                    column: x => x.TagId,
                    principalTable: "Tags",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_TicketTags_Tickets_TicketId",
                    column: x => x.TicketId,
                    principalTable: "Tickets",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "RolePermissions",
            columns: table => new
            {
                RoleId = table.Column<int>(type: "int", nullable: false),
                PermissionId = table.Column<int>(type: "int", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_RolePermissions", x => new { x.RoleId, x.PermissionId });
                table.ForeignKey(
                    name: "FK_RolePermissions_Permissions_PermissionId",
                    column: x => x.PermissionId,
                    principalTable: "Permissions",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_RolePermissions_Roles_RoleId",
                    column: x => x.RoleId,
                    principalTable: "Roles",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "UserRoles",
            columns: table => new
            {
                UserId = table.Column<int>(type: "int", nullable: false),
                RoleId = table.Column<int>(type: "int", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_UserRoles", x => new { x.UserId, x.RoleId });
                table.ForeignKey(
                    name: "FK_UserRoles_Roles_RoleId",
                    column: x => x.RoleId,
                    principalTable: "Roles",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_UserRoles_Users_UserId",
                    column: x => x.UserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_SLAs_Name_Priority",
            table: "SLAs",
            columns: new[] { "Name", "Priority" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_TicketPriorities_Name",
            table: "TicketPriorities",
            column: "Name",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_TicketStatuses_Name",
            table: "TicketStatuses",
            column: "Name",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_TicketCategories_Name_ParentId",
            table: "TicketCategories",
            columns: new[] { "Name", "ParentId" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_TicketStatusHistory_TicketId",
            table: "TicketStatusHistory",
            column: "TicketId");

        migrationBuilder.CreateIndex(
            name: "IX_TicketStatusHistory_ChangedById",
            table: "TicketStatusHistory",
            column: "ChangedById");

        migrationBuilder.CreateIndex(
            name: "IX_TicketAssignments_TicketId",
            table: "TicketAssignments",
            column: "TicketId");

        migrationBuilder.CreateIndex(
            name: "IX_TicketAssignments_AssignedToId",
            table: "TicketAssignments",
            column: "AssignedToId");

        migrationBuilder.CreateIndex(
            name: "IX_TicketAssignments_AssignedById",
            table: "TicketAssignments",
            column: "AssignedById");

        migrationBuilder.CreateIndex(
            name: "IX_Tags_Name",
            table: "Tags",
            column: "Name",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_Roles_Name",
            table: "Roles",
            column: "Name",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_Permissions_Name",
            table: "Permissions",
            column: "Name",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_TicketTags_TagId",
            table: "TicketTags",
            column: "TagId");

        migrationBuilder.CreateIndex(
            name: "IX_RolePermissions_PermissionId",
            table: "RolePermissions",
            column: "PermissionId");

        migrationBuilder.CreateIndex(
            name: "IX_UserRoles_RoleId",
            table: "UserRoles",
            column: "RoleId");

        migrationBuilder.CreateIndex(name: "IX_Tickets_SlaId", table: "Tickets", column: "SlaId");
        migrationBuilder.CreateIndex(name: "IX_Tickets_PriorityId", table: "Tickets", column: "PriorityId");
        migrationBuilder.CreateIndex(name: "IX_Tickets_StatusId", table: "Tickets", column: "StatusId");
        migrationBuilder.CreateIndex(name: "IX_Tickets_CategoryId", table: "Tickets", column: "CategoryId");
        migrationBuilder.CreateIndex(name: "IX_Tickets_IsDeleted", table: "Tickets", column: "IsDeleted");
        migrationBuilder.CreateIndex(name: "IX_Tickets_TenantId", table: "Tickets", column: "TenantId");
        migrationBuilder.CreateIndex(name: "IX_Users_IsDeleted", table: "Users", column: "IsDeleted");
        migrationBuilder.CreateIndex(name: "IX_Users_TenantId", table: "Users", column: "TenantId");
        migrationBuilder.CreateIndex(name: "IX_Assets_IsDeleted", table: "Assets", column: "IsDeleted");
        migrationBuilder.CreateIndex(name: "IX_Assets_TenantId", table: "Assets", column: "TenantId");
        migrationBuilder.CreateIndex(name: "IX_ServiceRequests_IsDeleted", table: "ServiceRequests", column: "IsDeleted");
        migrationBuilder.CreateIndex(name: "IX_ServiceRequests_TenantId", table: "ServiceRequests", column: "TenantId");

        migrationBuilder.AddForeignKey(
            name: "FK_Tickets_SLAs_SlaId",
            table: "Tickets",
            column: "SlaId",
            principalTable: "SLAs",
            principalColumn: "Id");

        migrationBuilder.AddForeignKey(
            name: "FK_Tickets_TicketPriorities_PriorityId",
            table: "Tickets",
            column: "PriorityId",
            principalTable: "TicketPriorities",
            principalColumn: "Id");

        migrationBuilder.AddForeignKey(
            name: "FK_Tickets_TicketStatuses_StatusId",
            table: "Tickets",
            column: "StatusId",
            principalTable: "TicketStatuses",
            principalColumn: "Id");

        migrationBuilder.AddForeignKey(
            name: "FK_Tickets_TicketCategories_CategoryId",
            table: "Tickets",
            column: "CategoryId",
            principalTable: "TicketCategories",
            principalColumn: "Id");

        var seedTimestamp = DateTime.UtcNow;

        migrationBuilder.InsertData(
            table: "TicketPriorities",
            columns: new[] { "Id", "Name", "Level" },
            values: new object[,]
            {
                { 1, "Low", 1 },
                { 2, "Medium", 2 },
                { 3, "High", 3 },
                { 4, "Critical", 4 }
            });

        migrationBuilder.InsertData(
            table: "TicketStatuses",
            columns: new[] { "Id", "Name" },
            values: new object[,]
            {
                { 1, "Open" },
                { 2, "In Progress" },
                { 3, "Pending" },
                { 4, "Resolved" },
                { 5, "Closed" }
            });

        migrationBuilder.InsertData(
            table: "SLAs",
            columns: new[] { "Id", "Name", "Priority", "ResponseTimeMinutes", "ResolutionTimeMinutes", "IsActive", "CreatedAt" },
            values: new object[,]
            {
                { 1, "Low Priority SLA", "Low", 240, 2880, true, seedTimestamp },
                { 2, "Medium Priority SLA", "Medium", 120, 1440, true, seedTimestamp },
                { 3, "High Priority SLA", "High", 60, 480, true, seedTimestamp },
                { 4, "Critical Priority SLA", "Critical", 15, 120, true, seedTimestamp }
            });

        migrationBuilder.InsertData(
            table: "Roles",
            columns: new[] { "Id", "Name" },
            values: new object[,]
            {
                { 1, "EndUser" },
                { 2, "Technician" },
                { 3, "Manager" },
                { 4, "Administrator" }
            });

        migrationBuilder.InsertData(
            table: "Permissions",
            columns: new[] { "Id", "Name" },
            values: new object[,]
            {
                { 1, "Tickets.View" },
                { 2, "Tickets.Create" },
                { 3, "Tickets.Update" },
                { 4, "Tickets.Assign" },
                { 5, "Tickets.Close" },
                { 6, "Assets.View" },
                { 7, "Assets.Manage" },
                { 8, "Requests.View" },
                { 9, "Requests.Manage" },
                { 10, "Admin.ManageUsers" },
                { 11, "Admin.ManageRoles" },
                { 12, "Reports.View" },
                { 13, "SLAs.Manage" }
            });

        migrationBuilder.InsertData(
            table: "TicketCategories",
            columns: new[] { "Id", "Name", "ParentId" },
            values: new object[,]
            {
                { 1, "Incident", DBNull.Value },
                { 2, "Service Request", DBNull.Value },
                { 3, "Change", DBNull.Value },
                { 4, "Problem", DBNull.Value },
                { 5, "Asset", DBNull.Value },
                { 6, "Access", DBNull.Value },
                { 7, "Maintenance", DBNull.Value },
                { 8, "Knowledge Base", DBNull.Value },
                { 9, "ERP", DBNull.Value },
                { 10, "HR", DBNull.Value },
                { 11, "Software Licensing", DBNull.Value },
                { 12, "Infrastructure", DBNull.Value },
                { 13, "Network", DBNull.Value },
                { 14, "Security", DBNull.Value },
                { 15, "Development", DBNull.Value },
                { 16, "QA/QC", DBNull.Value },
                { 17, "Digital Transformation", DBNull.Value },
                { 18, "Technical Support", DBNull.Value },
                { 19, "Project Management", DBNull.Value },
                { 20, "Other", DBNull.Value }
            });

        migrationBuilder.InsertData(
            table: "RolePermissions",
            columns: new[] { "RoleId", "PermissionId" },
            values: new object[,]
            {
                { 1, 1 },
                { 1, 2 },
                { 1, 5 },
                { 1, 8 },
                { 1, 12 },
                { 2, 1 },
                { 2, 2 },
                { 2, 3 },
                { 2, 4 },
                { 2, 5 },
                { 2, 6 },
                { 2, 7 },
                { 2, 8 },
                { 2, 9 },
                { 2, 12 },
                { 3, 1 },
                { 3, 2 },
                { 3, 3 },
                { 3, 4 },
                { 3, 5 },
                { 3, 6 },
                { 3, 7 },
                { 3, 8 },
                { 3, 9 },
                { 3, 12 },
                { 3, 13 },
                { 4, 1 },
                { 4, 2 },
                { 4, 3 },
                { 4, 4 },
                { 4, 5 },
                { 4, 6 },
                { 4, 7 },
                { 4, 8 },
                { 4, 9 },
                { 4, 10 },
                { 4, 11 },
                { 4, 12 },
                { 4, 13 }
            });

        migrationBuilder.Sql(@"
            INSERT INTO [UserRoles] ([UserId], [RoleId])
            SELECT [u].[Id],
                CASE [u].[Role]
                    WHEN 0 THEN 1
                    WHEN 1 THEN 2
                    WHEN 2 THEN 3
                    WHEN 3 THEN 4
                    ELSE 1
                END
            FROM [Users] AS [u]
            WHERE NOT EXISTS (
                SELECT 1
                FROM [UserRoles] AS [ur]
                WHERE [ur].[UserId] = [u].[Id]
            );

            UPDATE [t]
            SET [PriorityId] = [tp].[Id],
                [SlaId] = [s].[Id]
            FROM [Tickets] AS [t]
            LEFT JOIN [TicketPriorities] AS [tp] ON [tp].[Name] = [t].[Priority]
            LEFT JOIN [SLAs] AS [s] ON [s].[Priority] = [t].[Priority];

            UPDATE [t]
            SET [StatusId] = [ts].[Id]
            FROM [Tickets] AS [t]
            LEFT JOIN [TicketStatuses] AS [ts] ON [ts].[Name] = [t].[Status];

            UPDATE [t]
            SET [CategoryId] = [tc].[Id]
            FROM [Tickets] AS [t]
            LEFT JOIN [TicketCategories] AS [tc] ON [tc].[Name] = [t].[Category];
        ");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(name: "IX_Tickets_SlaId", table: "Tickets");
        migrationBuilder.DropIndex(name: "IX_Tickets_PriorityId", table: "Tickets");
        migrationBuilder.DropIndex(name: "IX_Tickets_StatusId", table: "Tickets");
        migrationBuilder.DropIndex(name: "IX_Tickets_CategoryId", table: "Tickets");
        migrationBuilder.DropIndex(name: "IX_Tickets_IsDeleted", table: "Tickets");
        migrationBuilder.DropIndex(name: "IX_Tickets_TenantId", table: "Tickets");

        migrationBuilder.DropIndex(name: "IX_Users_IsDeleted", table: "Users");
        migrationBuilder.DropIndex(name: "IX_Users_TenantId", table: "Users");
        migrationBuilder.DropIndex(name: "IX_Assets_IsDeleted", table: "Assets");
        migrationBuilder.DropIndex(name: "IX_Assets_TenantId", table: "Assets");
        migrationBuilder.DropIndex(name: "IX_ServiceRequests_IsDeleted", table: "ServiceRequests");
        migrationBuilder.DropIndex(name: "IX_ServiceRequests_TenantId", table: "ServiceRequests");

        migrationBuilder.DropForeignKey(
            name: "FK_Tickets_SLAs_SlaId",
            table: "Tickets");

        migrationBuilder.DropForeignKey(
            name: "FK_Tickets_TicketPriorities_PriorityId",
            table: "Tickets");

        migrationBuilder.DropForeignKey(
            name: "FK_Tickets_TicketStatuses_StatusId",
            table: "Tickets");

        migrationBuilder.DropForeignKey(
            name: "FK_Tickets_TicketCategories_CategoryId",
            table: "Tickets");

        migrationBuilder.DropTable(name: "RolePermissions");
        migrationBuilder.DropTable(name: "TicketAssignments");
        migrationBuilder.DropTable(name: "TicketStatusHistory");
        migrationBuilder.DropTable(name: "TicketTags");
        migrationBuilder.DropTable(name: "UserRoles");
        migrationBuilder.DropTable(name: "Permissions");
        migrationBuilder.DropTable(name: "Roles");
        migrationBuilder.DropTable(name: "Tags");
        migrationBuilder.DropTable(name: "TicketCategories");
        migrationBuilder.DropTable(name: "TicketStatuses");
        migrationBuilder.DropTable(name: "TicketPriorities");
        migrationBuilder.DropTable(name: "SLAs");

        migrationBuilder.DropColumn(name: "IsDeleted", table: "Tickets");
        migrationBuilder.DropColumn(name: "DeletedAt", table: "Tickets");
        migrationBuilder.DropColumn(name: "TenantId", table: "Tickets");
        migrationBuilder.DropColumn(name: "PriorityId", table: "Tickets");
        migrationBuilder.DropColumn(name: "StatusId", table: "Tickets");
        migrationBuilder.DropColumn(name: "CategoryId", table: "Tickets");
        migrationBuilder.DropColumn(name: "SlaId", table: "Tickets");

        migrationBuilder.DropColumn(name: "IsDeleted", table: "Users");
        migrationBuilder.DropColumn(name: "DeletedAt", table: "Users");
        migrationBuilder.DropColumn(name: "TenantId", table: "Users");

        migrationBuilder.DropColumn(name: "IsDeleted", table: "Assets");
        migrationBuilder.DropColumn(name: "DeletedAt", table: "Assets");
        migrationBuilder.DropColumn(name: "TenantId", table: "Assets");

        migrationBuilder.DropColumn(name: "IsDeleted", table: "ServiceRequests");
        migrationBuilder.DropColumn(name: "DeletedAt", table: "ServiceRequests");
        migrationBuilder.DropColumn(name: "TenantId", table: "ServiceRequests");
    }
}
