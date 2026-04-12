using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ITSMBackend.Migrations
{
    /// <inheritdoc />
    public partial class UsersSchemaFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF OBJECT_ID(N'[Users]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [Users] (
                        [Id] int NOT NULL IDENTITY,
                        [Username] nvarchar(450) NOT NULL,
                        [Email] nvarchar(450) NOT NULL,
                        [FirstName] nvarchar(max) NOT NULL,
                        [LastName] nvarchar(max) NOT NULL,
                        [Role] nvarchar(450) NOT NULL CONSTRAINT [DF_Users_Role] DEFAULT('EndUser'),
                        [Department] nvarchar(max) NOT NULL CONSTRAINT [DF_Users_Department] DEFAULT(''),
                        [IsActive] bit NOT NULL CONSTRAINT [DF_Users_IsActive] DEFAULT(1),
                        [CreatedAt] datetime2 NOT NULL CONSTRAINT [DF_Users_CreatedAt] DEFAULT (SYSUTCDATETIME()),
                        [UpdatedAt] datetime2 NOT NULL CONSTRAINT [DF_Users_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
                        [AvatarUrl] nvarchar(max) NULL,
                        CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
                    );

                    CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]);
                    CREATE UNIQUE INDEX [IX_Users_Username] ON [Users] ([Username]);
                END
            ");

            migrationBuilder.Sql(@"
                IF COL_LENGTH('Users', 'PasswordHash') IS NULL
                BEGIN
                    ALTER TABLE [Users] ADD [PasswordHash] nvarchar(max) NOT NULL CONSTRAINT [DF_Users_PasswordHash] DEFAULT('');
                END
            ");

            migrationBuilder.Sql(@"
                IF COL_LENGTH('Users', 'JobTitle') IS NULL
                BEGIN
                    ALTER TABLE [Users] ADD [JobTitle] nvarchar(max) NOT NULL CONSTRAINT [DF_Users_JobTitle] DEFAULT('');
                END
            ");

            migrationBuilder.Sql(@"
                IF COL_LENGTH('Users', 'PhoneNumber') IS NULL
                BEGIN
                    ALTER TABLE [Users] ADD [PhoneNumber] nvarchar(max) NULL;
                END
            ");

            migrationBuilder.Sql(@"
                IF COL_LENGTH('Users', 'LastLoginAt') IS NULL
                BEGIN
                    ALTER TABLE [Users] ADD [LastLoginAt] datetime2 NULL;
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Username] = 'admin')
                BEGIN
                    INSERT INTO [Users] ([Username], [Email], [FirstName], [LastName], [Role], [Department], [IsActive], [CreatedAt], [UpdatedAt], [AvatarUrl])
                    VALUES
                        ('admin', 'admin@itsm.com', 'Admin', 'User', 'Administrator', 'IT', 1, SYSUTCDATETIME(), SYSUTCDATETIME(), NULL),
                        ('agent1', 'agent1@itsm.com', 'John', 'Agent', 'Technician', 'IT', 1, SYSUTCDATETIME(), SYSUTCDATETIME(), NULL),
                        ('agent2', 'agent2@itsm.com', 'Sarah', 'Support', 'Technician', 'Support', 1, SYSUTCDATETIME(), SYSUTCDATETIME(), NULL),
                        ('network1', 'network1@itsm.com', 'Nadia', 'Network', 'Technician', 'Network Support', 1, SYSUTCDATETIME(), SYSUTCDATETIME(), NULL),
                        ('security1', 'security1@itsm.com', 'Samir', 'Security', 'Technician', 'Security Operations', 1, SYSUTCDATETIME(), SYSUTCDATETIME(), NULL),
                        ('manager1', 'manager1@itsm.com', 'Jane', 'Manager', 'Manager', 'IT', 1, SYSUTCDATETIME(), SYSUTCDATETIME(), NULL),
                        ('user1', 'user1@company.com', 'Robert', 'Employee', 'EndUser', 'Finance', 1, SYSUTCDATETIME(), SYSUTCDATETIME(), NULL),
                        ('user2', 'user2@company.com', 'Emma', 'Staff', 'EndUser', 'HR', 1, SYSUTCDATETIME(), SYSUTCDATETIME(), NULL);
                END
            ");

            migrationBuilder.Sql($@"
                UPDATE [Users]
                SET [PasswordHash] = CASE [Username]
                    WHEN 'admin' THEN '{BCrypt.Net.BCrypt.HashPassword("Admin123!")}'
                    WHEN 'agent1' THEN '{BCrypt.Net.BCrypt.HashPassword("Agent123!")}'
                    WHEN 'manager1' THEN '{BCrypt.Net.BCrypt.HashPassword("Manager123!")}'
                    ELSE [PasswordHash]
                END,
                [JobTitle] = CASE [Username]
                    WHEN 'admin' THEN 'Administrator'
                    WHEN 'agent1' THEN 'Technician'
                    WHEN 'manager1' THEN 'Manager'
                    ELSE [JobTitle]
                END;
            ");

            migrationBuilder.Sql(@"
                DECLARE @RoleType nvarchar(128);
                SELECT @RoleType = DATA_TYPE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'Users'
                  AND COLUMN_NAME = 'Role';

                BEGIN TRY
                    IF @RoleType IN ('nvarchar', 'varchar', 'nchar', 'char')
                    BEGIN
                        IF COL_LENGTH('Users', 'RoleInt') IS NULL
                        BEGIN
                            ALTER TABLE [Users] ADD [RoleInt] int NOT NULL CONSTRAINT [DF_Users_RoleInt] DEFAULT 0;
                        END

                        -- Use dynamic SQL for RoleInt assignment to avoid parser errors
                        EXEC(N'UPDATE [Users]
                               SET [RoleInt] = CASE [Role]
                                   WHEN ''EndUser'' THEN 0
                                   WHEN ''User'' THEN 0
                                   WHEN ''Agent'' THEN 1
                                   WHEN ''Technician'' THEN 1
                                   WHEN ''Manager'' THEN 2
                                   WHEN ''Admin'' THEN 3
                                   WHEN ''Administrator'' THEN 3
                                   ELSE 0
                               END');

                        DECLARE @RoleDefaultConstraint sysname;
                        SELECT @RoleDefaultConstraint = dc.name
                        FROM sys.default_constraints dc
                        INNER JOIN sys.columns c
                            ON c.default_object_id = dc.object_id
                        WHERE dc.parent_object_id = OBJECT_ID(N'[Users]')
                          AND c.name = N'Role';

                        IF @RoleDefaultConstraint IS NOT NULL
                        BEGIN
                            EXEC(N'ALTER TABLE [Users] DROP CONSTRAINT [' + @RoleDefaultConstraint + ']');
                        END

                        IF COL_LENGTH('Users', 'Role') IS NOT NULL
                        BEGIN
                            ALTER TABLE [Users] DROP COLUMN [Role];
                        END

                        IF COL_LENGTH('Users', 'RoleInt') IS NOT NULL AND COL_LENGTH('Users', 'Role') IS NULL
                        BEGIN
                            EXEC sp_rename 'Users.RoleInt', 'Role', 'COLUMN';
                        END
                    END
                    ELSE IF @RoleType = 'int'
                    BEGIN
                        IF COL_LENGTH('Users', 'RoleInt') IS NOT NULL
                        BEGIN
                            -- Use dynamic SQL for RoleInt references
                            EXEC(N'UPDATE [Users] SET [RoleInt] = [Role]');

                            DECLARE @RoleIntDefaultConstraint sysname;
                            SELECT @RoleIntDefaultConstraint = dc.name
                            FROM sys.default_constraints dc
                            INNER JOIN sys.columns c
                                ON c.default_object_id = dc.object_id
                            WHERE dc.parent_object_id = OBJECT_ID(N'[Users]')
                              AND c.name = N'RoleInt';

                            IF @RoleIntDefaultConstraint IS NOT NULL
                            BEGIN
                                EXEC(N'ALTER TABLE [Users] DROP CONSTRAINT [' + @RoleIntDefaultConstraint + ']');
                            END

                            ALTER TABLE [Users] DROP COLUMN [RoleInt];
                        END
                    END
                END TRY
                BEGIN CATCH
                    PRINT 'Warning: RoleInt transition failed, continuing... Error: ' + ERROR_MESSAGE();
                END CATCH
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE [Users] ADD [RoleText] nvarchar(450) NOT NULL CONSTRAINT [DF_Users_RoleText] DEFAULT '';
            ");

            migrationBuilder.Sql(@"
                UPDATE [Users]
                SET [RoleText] = CASE [Role]
                    WHEN 0 THEN 'EndUser'
                    WHEN 1 THEN 'Technician'
                    WHEN 2 THEN 'Manager'
                    WHEN 3 THEN 'Administrator'
                    ELSE 'EndUser'
                END;
            ");

            migrationBuilder.Sql(@"
                ALTER TABLE [Users] DROP COLUMN [Role];
            ");

            migrationBuilder.Sql(@"
                EXEC sp_rename 'Users.RoleText', 'Role', 'COLUMN';
            ");

            migrationBuilder.Sql(@"
                IF COL_LENGTH('Users', 'PasswordHash') IS NOT NULL
                BEGIN
                    ALTER TABLE [Users] DROP CONSTRAINT IF EXISTS [DF_Users_PasswordHash];
                    ALTER TABLE [Users] DROP COLUMN [PasswordHash];
                END
            ");

            migrationBuilder.Sql(@"
                IF COL_LENGTH('Users', 'JobTitle') IS NOT NULL
                BEGIN
                    ALTER TABLE [Users] DROP CONSTRAINT IF EXISTS [DF_Users_JobTitle];
                    ALTER TABLE [Users] DROP COLUMN [JobTitle];
                END
            ");

            migrationBuilder.Sql(@"
                IF COL_LENGTH('Users', 'PhoneNumber') IS NOT NULL
                BEGIN
                    ALTER TABLE [Users] DROP COLUMN [PhoneNumber];
                END
            ");

            migrationBuilder.Sql(@"
                IF COL_LENGTH('Users', 'LastLoginAt') IS NOT NULL
                BEGIN
                    ALTER TABLE [Users] DROP COLUMN [LastLoginAt];
                END
            ");
        }
    }
}
