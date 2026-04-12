using ITSMBackend.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ITSMBackend.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260412000000_AddServiceRequestExternalFields")]
public partial class AddServiceRequestExternalFields : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "ExternalId",
            table: "ServiceRequests",
            type: "nvarchar(max)",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "ExternalSystem",
            table: "ServiceRequests",
            type: "nvarchar(max)",
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "ExternalId",
            table: "ServiceRequests");

        migrationBuilder.DropColumn(
            name: "ExternalSystem",
            table: "ServiceRequests");
    }
}
