# BRD Traceability Matrix

Source of truth: `docs/superpowers/plans/2026-04-23-itsm-brd-roadmap.md`

| BRD Area | Repo Modules | Status | Delivery Gap | Notes |
|---|---|---|---|---|
| Incident Management | `backend/Controllers/TicketsController.cs`, `backend/Services/TicketService.cs`, `src/pages/incident-management-workflow` | Partial | Major incident flow, parent-child linking, SLA escalation tuning | BRD phases still need explicit major-incident governance. |
| Service Request Management | `backend/Controllers/ServiceRequestsController.cs`, `backend/Services/ServiceRequestService.cs`, `src/pages/service-catalog` | Partial | Dynamic forms, approvals, fulfillment routing | Request catalog depth is still below BRD target. |
| Problem Management | `backend/Controllers/ProblemsController.cs`, `backend/Services/ProblemManagementService.cs`, `src/pages/problems` | Partial | KEDB, RCA templates, linked incident workflows | Existing module supports the domain but not the full BRD flow. |
| Change Management | `backend/Controllers/ChangeRequestsController.cs`, `backend/Services/ChangeRequestService.cs`, `src/pages/change-management` | Partial | CAB calendar, blackout windows, PIR enforcement | Governance and scheduling depth still need to be hardened. |
| CMDB / Asset Management | `backend/Models/Asset.cs`, `backend/Models/AssetRelationship.cs`, `backend/Services/AssetService.cs` | Partial | CI hierarchy, discovery reconciliation, service dependency maps | Discovery and relationship quality remain the main gap. |
| Knowledge Management | `backend/Controllers/KnowledgeBaseController.cs`, `src/pages/knowledge-base` | Partial | Article lifecycle, review, ratings, surfacing in tickets | Agent surfacing and publication workflow still need work. |
| Self-Service Portal | `src/pages/customer-portal`, `src/pages/ticket-creation`, `src/pages/service-catalog` | Partial | Mobile-ready portal flow, live ticket status, proactive notifications | Portal UX and status visibility still need validation. |
| SLA Management | `backend/Controllers/SlaController.cs`, `backend/Models/SLAAlert.cs`, `src/pages/sla-policies`, `src/pages/ticket-sla` | Partial | Business-hours calendars, pause rules, breach warnings | Pause-state semantics and calendars need tightening. |
| Reporting & Analytics | `backend/Controllers/ReportsController.cs`, `backend/Controllers/AnalyticsController.cs`, `backend/Services/ReportingService.cs`, `backend/Services/DashboardService.cs` | Partial | Scheduled reports, exports, KPI scorecards, ad hoc reporting depth | Coverage is broad but not yet fully BRD-aligned. |
| Integrations | `backend/Services/ErpIntegrationService.cs`, `backend/Controllers/MonitoringController.cs`, `backend/Controllers/WebhooksController.cs`, `backend/Models/ExternalIntegration.cs` | Partial | AD/LDAP, SSO/SAML, HR sync, Teams/Slack, discovery feeds | External system coverage is present but incomplete. |
| Security & Compliance | `backend/Controllers/AuthController.cs`, `backend/Models/UserRole.cs`, `backend/Models/AuditLog.cs`, `src/pages/audit-trail-and-compliance-viewer` | Partial | MFA enforcement, retention rules, DSAR support, evidence packs | Audit and retention controls need formalization. |
| Data Migration | `backend/Models/User.cs`, `backend/Models/Asset.cs`, `backend/Models/ServiceRequest.cs`, `backend/Models/ChangeRequest.cs` | Missing | Active records, KB articles, CMDB, SLA definitions, validation and rollback | Migration work is not yet represented as a dedicated repo module. |
| Testing & UAT | `src/pages/scenario-validation-center`, `backend/README.md` | Missing | SIT, UAT, performance, and security gates with exit criteria | Validation tooling exists only as a partial scaffold. |
| Training & Change Management | `src/pages/service-desk-blueprint`, `src/pages/manager-dashboard` | Missing | Training plan, communications, super-user network, hypercare | Adoption work is mostly outside the current product surface. |
| Governance & CSI | `backend/Models/ITSMGovernanceModels.cs`, `src/pages/escalations`, `src/pages/maintenance-scheduling` | Partial | Governance cadences, ownership model, CSI register, KPI review | Governance models exist, but operating rhythm still needs definition. |
| Vendor Evaluation & Delivery Phasing | `backend/README.md`, `docs/implementation-roadmap.md` | Missing | Vendor scoring, phase gates, procurement milestones, release sequencing | Planning exists in docs, but not as a product module. |

## Scope Notes

- The roadmap is organized as a phased delivery baseline, not a bugfix queue.
- Coverage is intentionally marked `Partial` because the repo has working foundations but not the full BRD depth.
- Delivery gaps identify the next material capability needed for each BRD area.
