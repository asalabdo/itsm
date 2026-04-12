using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ITSMBackend.Migrations
{
    public partial class AddExternalUserMappingV2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Safely add ExternalId Column
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[Users]') AND name = N'ExternalId')
                BEGIN
                    ALTER TABLE [Users] ADD [ExternalId] nvarchar(450) NULL;
                END
            ");

            // Safely add ExternalSource Column
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[Users]') AND name = N'ExternalSource')
                BEGIN
                    ALTER TABLE [Users] ADD [ExternalSource] nvarchar(450) NULL;
                END
            ");

            // Safely add Unique Index
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Users_ExternalId_ExternalSource' AND object_id = OBJECT_ID(N'[Users]'))
                BEGIN
                    CREATE UNIQUE INDEX [IX_Users_ExternalId_ExternalSource] ON [Users] ([ExternalId], [ExternalSource]) 
                    WHERE [ExternalId] IS NOT NULL AND [ExternalSource] IS NOT NULL;
                END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Note: We don't drop the index or columns here because they might have been added manually
            // and we want to keep them if we rollback this specific migration.
        }
    }
}
