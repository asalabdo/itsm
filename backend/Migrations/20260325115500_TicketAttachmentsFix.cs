using ITSMBackend.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ITSMBackend.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260325115500_TicketAttachmentsFix")]
public partial class TicketAttachmentsFix : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            IF OBJECT_ID(N'[TicketAttachments]', N'U') IS NULL
            BEGIN
                CREATE TABLE [TicketAttachments] (
                    [Id] int NOT NULL IDENTITY,
                    [TicketId] int NOT NULL,
                    [UserId] int NOT NULL,
                    [FileName] nvarchar(max) NOT NULL,
                    [ContentType] nvarchar(max) NOT NULL,
                    [ContentLength] bigint NOT NULL,
                    [FileData] varbinary(max) NOT NULL,
                    [CreatedAt] datetime2 NOT NULL,
                    CONSTRAINT [PK_TicketAttachments] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_TicketAttachments_Tickets_TicketId] FOREIGN KEY ([TicketId]) REFERENCES [Tickets] ([Id]) ON DELETE CASCADE,
                    CONSTRAINT [FK_TicketAttachments_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
                );

                CREATE INDEX [IX_TicketAttachments_TicketId] ON [TicketAttachments] ([TicketId]);
                CREATE INDEX [IX_TicketAttachments_UserId] ON [TicketAttachments] ([UserId]);
            END
        ");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            IF OBJECT_ID(N'[TicketAttachments]', N'U') IS NOT NULL
                DROP TABLE [TicketAttachments];
        ");
    }
}
