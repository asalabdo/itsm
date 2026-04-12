# API Contract: ITSM Backend REST endpoints

## Base URL
`https://{host}/api`

## GET /tickets
- Response: 200
- Body: array of ticket objects

## GET /tickets/{id}
- Response: 200 ticket object or 404

## POST /tickets
- Request: {title, description, priority, assignedTo, slaDueDate?}
- Response: 201 created ticket

## PUT /tickets/{id}
- Request: any updatable fields (status, priority, assignedTo, slaDueDate)
- Response: 200 updated ticket

## GET /dashboard
- Response: 200 dashboard metrics, e.g. totalTickets, openTickets, slaBreachedCount, etc.

## SLA alert extension contract (proposed)
### GET /sla/alerts
- query: `status=active|acknowledged|resolved`
- Response: 200 {alerts: [...], summary: {...}}

### POST /sla/alerts/{id}/acknowledge
- Response: 200 with updated alert state

### GET /sla/summary
- Response: 200 aggregated SLA metrics (on_track, at_risk, breached)
