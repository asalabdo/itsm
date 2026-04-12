using ITSMBackend.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ITSMBackend.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260326123000_ServiceRequestBackfill")]
    public partial class ServiceRequestBackfill : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
UPDATE ServiceRequests
SET RequestedById = COALESCE(RequestedById, 1),
    AssignedToId = COALESCE(AssignedToId, CASE
        WHEN Status IN ('Pending Approval', 'Open') THEN 1
        WHEN Status IN ('In Progress', 'In Fulfillment') THEN 2
        ELSE 1
    END)
WHERE RequestedById IS NULL OR AssignedToId IS NULL;

INSERT INTO ApprovalRequests (ServiceRequestId, ApproverId, Status, Comments, DecidedAt, CreatedAt)
SELECT sr.Id, 1, 'Pending', NULL, NULL, GETUTCDATE()
FROM ServiceRequests sr
LEFT JOIN ApprovalRequests ar ON ar.ServiceRequestId = sr.Id
WHERE sr.WorkflowStage = 'Approval' AND ar.Id IS NULL;

INSERT INTO FulfillmentTasks (ServiceRequestId, Title, Description, Status, AssignedToId, CompletedAt, CreatedAt)
SELECT sr.Id,
       CONCAT('Fulfill ', sr.RequestNumber),
       CONCAT('Service request ', sr.Title, ' is in fulfillment.'),
       CASE WHEN sr.Status IN ('Completed', 'Fulfilled') THEN 'Completed' ELSE 'Pending' END,
       sr.AssignedToId,
       CASE WHEN sr.Status IN ('Completed', 'Fulfilled') THEN GETUTCDATE() ELSE NULL END,
       GETUTCDATE()
FROM ServiceRequests sr
LEFT JOIN FulfillmentTasks ft ON ft.ServiceRequestId = sr.Id
WHERE sr.WorkflowStage = 'Fulfillment' AND ft.Id IS NULL;
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DELETE FROM FulfillmentTasks WHERE ServiceRequestId IN (SELECT Id FROM ServiceRequests WHERE WorkflowStage = 'Fulfillment');
DELETE FROM ApprovalRequests WHERE ServiceRequestId IN (SELECT Id FROM ServiceRequests WHERE WorkflowStage = 'Approval');
UPDATE ServiceRequests SET RequestedById = NULL, AssignedToId = NULL WHERE RequestNumber LIKE 'SR-%' OR RequestNumber LIKE 'REQ-%';
");
        }
    }
}
