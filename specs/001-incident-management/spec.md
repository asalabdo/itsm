# Incident Management Workflow Enhancement

## Goal

Implement a robust incident management workflow in the ITSM system with full SLA tracking, incident lifecycle states, and integrated dashboard reporting.

## Scope

- Backend API endpoints for incidents: create/read/update/close
- SLA fields and status calculations (on_track/at_risk/breached)
- Incident lifecycle management (new/assigned/in_progress/resolved/closed)
- Notification rules for SLA breach alerts
- Frontend incident management page with filters, details, analytics
- **ManageEngine integration**: bidirectional sync of incidents, users, and assets

## Acceptance Criteria

- Endpoint POST /api/incidents creates incidents with SLA deadlines
- Endpoint GET /api/incidents supports query params for status/priority/assignee
- Endpoint PUT /api/incidents/{id} updates status and SLA state
- UI allows incident creation, list, detail view, and analytics tabs
- SLA dashboard shows on_track/at_risk/breached counts and overdues
- **ManageEngine sync endpoints**: POST /api/integrations/manageengine/sync imports incidents from ManageEngine
- **ManageEngine webhook support**: POST /api/webhooks/manageengine receives incident updates from ManageEngine
- **Bidirectional sync**: incidents created in either system are synchronized with configurable field mapping

## Non-goals

- Full third-party alerting integration (PagerDuty/SMS) in initial phase
- Multi-tenant account segregation (future phase)

## Dependencies

- Backend: .NET 10, EF Core, SQL Server
- Frontend: React 18, Redux Toolkit, Vite, Tailwind CSS
- **External**: ManageEngine ServiceDesk Plus API access and webhook configuration

## Notes

- Existing src/pages/incident-management-workflow is the baseline interactive UI.
- Implement new incident API in ackend/Controllers and model updates in ackend/Models.- **ManageEngine Integration**: 
  - Configure API credentials in `appsettings.json` under `ManageEngine` section
  - Webhook endpoint: `POST /api/webhooks/manageengine` for real-time incident updates
  - Sync endpoint: `POST /api/manageengine/sync` for batch incident import
  - Field mapping supports customizable attribute translation between systems