using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ITSMBackend.Migrations
{
    /// <inheritdoc />
    public partial class SchemaSync : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF COL_LENGTH('Tickets', 'ExternalId') IS NULL
                    ALTER TABLE [Tickets] ADD [ExternalId] nvarchar(max) NULL;

                IF COL_LENGTH('Tickets', 'ExternalSystem') IS NULL
                    ALTER TABLE [Tickets] ADD [ExternalSystem] nvarchar(max) NULL;

                IF COL_LENGTH('Tickets', 'SlaDueDate') IS NULL
                    ALTER TABLE [Tickets] ADD [SlaDueDate] datetime2 NULL;

                IF COL_LENGTH('Tickets', 'SlaStatus') IS NULL
                    ALTER TABLE [Tickets] ADD [SlaStatus] nvarchar(max) NULL;

                IF COL_LENGTH('Tickets', 'SubCategory') IS NULL AND COL_LENGTH('Tickets', 'Subcategory') IS NULL
                    ALTER TABLE [Tickets] ADD [SubCategory] nvarchar(max) NULL;

                IF OBJECT_ID(N'[DataPoints]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [DataPoints] (
                        [Id] int NOT NULL IDENTITY,
                        [Category] nvarchar(max) NOT NULL,
                        [SubCategory] nvarchar(max) NULL,
                        [Value] decimal(18,2) NOT NULL,
                        [Timestamp] datetime2 NOT NULL,
                        [MetadataJson] nvarchar(max) NULL,
                        CONSTRAINT [PK_DataPoints] PRIMARY KEY ([Id])
                    );
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF COL_LENGTH('Tickets', 'SubCategory') IS NOT NULL
                    ALTER TABLE [Tickets] DROP COLUMN [SubCategory];

                IF COL_LENGTH('Tickets', 'SlaStatus') IS NOT NULL
                    ALTER TABLE [Tickets] DROP COLUMN [SlaStatus];

                IF COL_LENGTH('Tickets', 'SlaDueDate') IS NOT NULL
                    ALTER TABLE [Tickets] DROP COLUMN [SlaDueDate];

                IF COL_LENGTH('Tickets', 'ExternalSystem') IS NOT NULL
                    ALTER TABLE [Tickets] DROP COLUMN [ExternalSystem];

                IF COL_LENGTH('Tickets', 'ExternalId') IS NOT NULL
                    ALTER TABLE [Tickets] DROP COLUMN [ExternalId];

                IF OBJECT_ID(N'[DataPoints]', N'U') IS NOT NULL
                    DROP TABLE [DataPoints];
            ");
        }
    }
}
