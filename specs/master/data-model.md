# Data Model

## Existing domain entities (source: backend/Models)
- ApprovalItem
- Asset
- AuditLog
- ChangeRequest
- Metrics
- ServiceRequest
- Ticket
- User
- Workflow

### Core entities for SLA + analytics feature (target extension)
- Ticket
  - id, title, description, status, priority, assignedTo, createdAt, updatedAt
  - slaDueDate (new, nullable)
  - slaStatus (new: on_track, at_risk, breached)

- Workflow
  - id, name, steps, active

- Metrics
  - may already capture event telemetry; ensure insert/update from Ticket and Workflow transitions

### Relationships
- Ticket -> User (assignee, createdBy)
- Ticket -> Workflow (optional workflow id)
- ChangeRequest/ServiceRequest -> Ticket/Workflow (per existing domain mapping)

## Validation and constraints
- Ticket.priority in [Low, Medium, High, Critical]
- slaDueDate must be >= createdAt
- status transitions must follow finite states from `backend/Controllers/TicketsController.cs` logic

## Proposed new entity for plans
- SLAAlert
  - tickerId, alertLevel, triggeredAt, acknowledgedBy, resolvedAt, reason

## State transitions (SLA domain)
- on_track -> at_risk when remainingTime <= 20% threshold
- at_risk -> breached when now > slaDueDate
- any -> resolved when status transitions to Closed
