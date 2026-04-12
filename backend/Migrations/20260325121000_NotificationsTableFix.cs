using ITSMBackend.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ITSMBackend.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260325121000_NotificationsTableFix")]
public partial class NotificationsTableFix : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            IF OBJECT_ID(N'[Notifications]', N'U') IS NULL
            BEGIN
                CREATE TABLE [Notifications] (
                    [Id] int NOT NULL IDENTITY,
                    [UserId] int NOT NULL,
                    [Title] nvarchar(max) NOT NULL,
                    [Message] nvarchar(max) NOT NULL,
                    [Type] nvarchar(max) NOT NULL,
                    [Link] nvarchar(max) NULL,
                    [IsRead] bit NOT NULL,
                    [CreatedAt] datetime2 NOT NULL,
                    CONSTRAINT [PK_Notifications] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_Notifications_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
                );

                CREATE INDEX [IX_Notifications_UserId] ON [Notifications] ([UserId]);
                CREATE INDEX [IX_Notifications_CreatedAt] ON [Notifications] ([CreatedAt]);
            END
        ");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            IF OBJECT_ID(N'[Notifications]', N'U') IS NOT NULL
                DROP TABLE [Notifications];
        ");
    }
}
