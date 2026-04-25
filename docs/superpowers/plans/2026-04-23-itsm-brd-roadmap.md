# ITSM BRD Delivery Roadmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the BRD into a phased, testable delivery roadmap that covers foundation, core ITSM processes, integrations, migration, adoption, and optimization.

**Architecture:** We will keep the roadmap anchored to the BRD phases already described in the requirements document, then map each phase to concrete repo modules, documentation artifacts, and verification gates. The current codebase already has a broad ITSM foundation, so the work is mostly about aligning delivery order, filling BRD gaps, and formalizing readiness criteria rather than inventing a new platform shape.

**Tech Stack:** React 18, Vite, .NET 10, ASP.NET Core, Entity Framework Core, SQL Server, existing ITSM UI modules, existing backend controllers/services, Markdown documentation.

---

### Task 1: Publish the BRD Traceability and Scope Baseline

**Files:**
- Create: `docs/brd-traceability-matrix.md`
- Create: `docs/implementation-roadmap.md`
- Modify: `task.md`

- [ ] **Step 1: Capture the BRD-to-repo coverage baseline in a traceability matrix**

```md
## BRD Traceability Matrix

| BRD Area | Repo Modules | Status | Delivery Gap |
|---|---|---|---|
| Incident Management | backend/Controllers/TicketsController.cs, backend/Services/TicketService.cs, src/pages/incident-management-workflow | Partial | Major incident flow, parent-child linking, SLA escalation tuning |
| Service Request Management | backend/Controllers/ServiceRequestsController.cs, backend/Services/ServiceRequestService.cs, src/pages/service-catalog | Partial | Dynamic forms, approvals, fulfillment routing |
| Problem Management | backend/Controllers/ProblemsController.cs, backend/Services/ProblemManagementService.cs, src/pages/problems | Partial | KEDB, RCA templates, linked incident workflows |
| Change Management | backend/Controllers/ChangeRequestsController.cs, backend/Services/ChangeRequestService.cs, src/pages/change-management | Partial | CAB calendar, blackout windows, PIR enforcement |
| CMDB / Asset Management | backend/Models/Asset.cs, backend/Models/AssetRelationship.cs, backend/Services/AssetService.cs | Partial | CI hierarchy, discovery reconciliation, service dependency maps |
| Knowledge Management | backend/Controllers/KnowledgeBaseController.cs, src/pages/knowledge-base | Partial | Article lifecycle, review, ratings, surfacing in tickets |
| SLA / Reporting / Integrations | backend/Controllers/SlaController.cs, backend/Controllers/ReportsController.cs, backend/Controllers/MonitoringController.cs | Partial | Business-hours calendars, scheduled reports, HR/AD/SSO sync |
```

- [ ] **Step 2: Record the scope boundary and the phase order that will govern delivery**

```md
## Delivery Scope

Phase 1: Foundation
Phase 2: Advanced ITSM
Phase 3: Integration and Analytics
Phase 4: Migration, Adoption, and Hardening
Phase 5: Optimization
```

- [ ] **Step 3: Update the current task list so it no longer reads like a single bugfix thread**

```md
- [ ] Phase 0: scope lock and governance setup
- [ ] Phase 1: foundation delivery
- [ ] Phase 2: advanced ITSM delivery
- [ ] Phase 3: integration and analytics delivery
- [ ] Phase 4: migration, adoption, and hardening
- [ ] Phase 5: optimization and CSI
```

- [ ] **Step 4: Verify the markdown renders cleanly and the roadmap links resolve**

Run: `Get-Content docs/brd-traceability-matrix.md -TotalCount 40`
Expected: matrix content is present and readable.

- [ ] **Step 5: Commit the planning baseline**

```bash
git add docs/brd-traceability-matrix.md docs/implementation-roadmap.md task.md
git commit -m "docs: add ITSM brd traceability baseline"
```

### Task 2: Deliver Phase 1 Foundation

**Files:**
- Modify: `backend/Controllers/AuthController.cs`
- Modify: `backend/Controllers/TicketsController.cs`
- Modify: `backend/Controllers/ServiceRequestsController.cs`
- Modify: `backend/Controllers/KnowledgeBaseController.cs`
- Modify: `src/pages/customer-portal/index.jsx`
- Modify: `src/pages/ticket-creation/index.jsx`
- Modify: `src/pages/service-catalog/index.jsx`
- Modify: `src/pages/knowledge-base/index.jsx`

- [ ] **Step 1: Align the foundation work to the BRD entries for SSO, portal access, incident intake, requests, and knowledge search**

```md
## Phase 1 Scope

- SSO login and role-aware session handling
- Self-service portal entry points
- Incident logging from portal and email
- Service request submission from catalog
- Knowledge article search and surfacing
```

- [ ] **Step 2: Wire the portal and intake flows to the existing backend controllers**

```md
## Implementation Notes

- Keep the existing ticket and service request controller shapes.
- Add only the minimum contract changes needed to support BRD foundation flows.
- Do not introduce a second portal pattern; reuse the existing customer portal and ticket creation pages.
```

- [ ] **Step 3: Add or update focused tests for foundation flows**

```md
## Verification

- Portal login returns the correct role.
- Ticket creation still succeeds from the portal.
- Service catalog submission still routes to the backend.
- Knowledge search returns seeded article results.
```

- [ ] **Step 4: Verify the phase with a production build and the relevant backend tests**

Run: `npm run build`
Expected: frontend build succeeds.

Run: `dotnet build backend/ITSMBackend.csproj -p:UseAppHost=false --no-restore`
Expected: backend build succeeds.

- [ ] **Step 5: Commit the foundation phase changes**

```bash
git add backend/Controllers/AuthController.cs backend/Controllers/TicketsController.cs backend/Controllers/ServiceRequestsController.cs backend/Controllers/KnowledgeBaseController.cs src/pages/customer-portal/index.jsx src/pages/ticket-creation/index.jsx src/pages/service-catalog/index.jsx src/pages/knowledge-base/index.jsx
git commit -m "feat: deliver itsm foundation phase"
```

### Task 3: Deliver Phase 2 Advanced ITSM

**Files:**
- Modify: `backend/Controllers/ChangeRequestsController.cs`
- Modify: `backend/Controllers/ProblemsController.cs`
- Modify: `backend/Controllers/SlaController.cs`
- Modify: `backend/Models/Workflow.cs`
- Modify: `backend/Models/ProblemRecord.cs`
- Modify: `src/pages/change-management/index.jsx`
- Modify: `src/pages/problems/index.jsx`
- Modify: `src/pages/sla-policies/index.jsx`
- Modify: `src/pages/ticket-sla/index.jsx`

- [ ] **Step 1: Map the BRD process requirements to change, problem, and SLA modules**

```md
## Phase 2 Scope

- CAB approval workflow for normal changes
- Emergency change handling with PIR
- Problem record lifecycle with RCA and known errors
- Business-hours SLA clocks, pauses, and breach notifications
- CMDB relationships needed for impact analysis
```

- [ ] **Step 2: Tighten workflow and data model support for the BRD rules**

```md
## Implementation Notes

- Keep change types limited to Standard, Normal, and Emergency.
- Keep problem records linked to incidents and known errors.
- Keep SLA pausing rules explicit and auditable.
```

- [ ] **Step 3: Add tests for approval routing, SLA pause logic, and problem linking**

```md
## Verification

- Normal changes require the expected approval path.
- Emergency changes generate a PIR requirement.
- Problem records can attach related incidents.
- SLA pauses resume correctly for user and vendor waiting states.
```

- [ ] **Step 4: Verify the phase with targeted backend and frontend builds**

Run: `dotnet build backend/ITSMBackend.csproj -p:UseAppHost=false --no-restore`
Expected: backend build succeeds.

Run: `npm run build`
Expected: frontend build succeeds.

- [ ] **Step 5: Commit the advanced ITSM phase changes**

```bash
git add backend/Controllers/ChangeRequestsController.cs backend/Controllers/ProblemsController.cs backend/Controllers/SlaController.cs backend/Models/Workflow.cs backend/Models/ProblemRecord.cs src/pages/change-management/index.jsx src/pages/problems/index.jsx src/pages/sla-policies/index.jsx src/pages/ticket-sla/index.jsx
git commit -m "feat: deliver advanced itsm phase"
```

### Task 4: Deliver Phase 3 Integrations and Analytics

**Files:**
- Modify: `backend/Services/ErpIntegrationService.cs`
- Modify: `backend/Controllers/MonitoringController.cs`
- Modify: `backend/Controllers/WebhooksController.cs`
- Modify: `backend/Controllers/ReportsController.cs`
- Modify: `backend/Controllers/AnalyticsController.cs`
- Modify: `backend/Services/ReportingService.cs`
- Modify: `src/pages/reporting-and-analytics-hub/index.jsx`
- Modify: `src/pages/executive-it-service-summary/index.jsx`
- Modify: `src/pages/it-operations-command-center/index.jsx`

- [ ] **Step 1: Align integrations to the BRD list of AD, SSO, HR, monitoring, email, Teams/Slack, and discovery feeds**

```md
## Phase 3 Scope

- Identity and provisioning sync
- Monitoring alert intake
- Scheduled and ad-hoc report delivery
- Executive and operational dashboard surfaces
```

- [ ] **Step 2: Keep integration contracts explicit and documented**

```md
## Implementation Notes

- Treat external systems as asynchronous integration boundaries.
- Keep the backend service layer responsible for normalization and retry behavior.
- Keep the UI focused on configuration, visibility, and monitoring.
```

- [ ] **Step 3: Add tests for webhook ingestion, report generation, and dashboard summaries**

```md
## Verification

- Alert payloads can create or update incidents.
- Scheduled reports generate the correct export format.
- Executive dashboards still render the BRD KPI set.
```

- [ ] **Step 4: Verify the phase with backend and frontend builds**

Run: `dotnet build backend/ITSMBackend.csproj -p:UseAppHost=false --no-restore`
Expected: backend build succeeds.

Run: `npm run build`
Expected: frontend build succeeds.

- [ ] **Step 5: Commit the integrations and analytics changes**

```bash
git add backend/Services/ErpIntegrationService.cs backend/Controllers/MonitoringController.cs backend/Controllers/WebhooksController.cs backend/Controllers/ReportsController.cs backend/Controllers/AnalyticsController.cs backend/Services/ReportingService.cs src/pages/reporting-and-analytics-hub/index.jsx src/pages/executive-it-service-summary/index.jsx src/pages/it-operations-command-center/index.jsx
git commit -m "feat: deliver integrations and analytics phase"
```

### Task 5: Deliver Phase 4 Migration, Adoption, and Hardening

**Files:**
- Create: `docs/migration-plan.md`
- Create: `docs/training-plan.md`
- Create: `docs/go-live-readiness-checklist.md`
- Modify: `backend/README.md`
- Modify: `INTEGRATION_GUIDE.md`
- Modify: `SETUP_COMPLETE.md`

- [ ] **Step 1: Document the migration scope for active records, KB articles, CMDB, and SLA definitions**

```md
## Migration Scope

- Open incidents and requests
- Knowledge base articles
- Configuration items and relationships
- SLA definitions and calendars
```

- [ ] **Step 2: Document the training and hypercare approach**

```md
## Adoption Scope

- End-user portal training
- Agent and manager role-based training
- Super-user network
- Hypercare support window
```

- [ ] **Step 3: Add go-live readiness gates**

```md
## Readiness Gates

- UAT passed
- Critical defects closed
- Migration reconciliation signed off
- Support model staffed
- Security and compliance sign-off obtained
```

- [ ] **Step 4: Verify the docs are internally consistent and reference the same phase names**

Run: `Get-Content docs/migration-plan.md -TotalCount 80`
Expected: migration phases and readiness gates are visible.

- [ ] **Step 5: Commit the migration and adoption planning set**

```bash
git add docs/migration-plan.md docs/training-plan.md docs/go-live-readiness-checklist.md backend/README.md INTEGRATION_GUIDE.md SETUP_COMPLETE.md
git commit -m "docs: add migration and adoption readiness planning"
```

### Task 6: Deliver Phase 5 Optimization and CSI

**Files:**
- Modify: `backend/Services/PredictiveAnalyticsService.cs`
- Modify: `backend/Controllers/AutomationController.cs`
- Modify: `backend/Models/AutomationRule.cs`
- Modify: `backend/Models/Metrics.cs`
- Modify: `src/pages/advanced-analytics/index.jsx`
- Modify: `src/pages/automation-rules/index.jsx`
- Modify: `src/pages/service-performance-analytics/index.jsx`

- [ ] **Step 1: Map the BRD optimization items to automation, predictive analytics, and CSI tracking**

```md
## Phase 5 Scope

- AI-assisted categorization
- Auto-routing and escalation rules
- Predictive trend analysis
- CSI register and monthly review cadence
```

- [ ] **Step 2: Keep optimization changes additive to the existing foundation**

```md
## Implementation Notes

- Do not destabilize core incident and request flows.
- Treat optimization as an overlay on top of the operational modules.
```

- [ ] **Step 3: Add tests for automation rule evaluation and KPI trend reporting**

```md
## Verification

- Automation rules still evaluate against seeded incidents.
- Analytics pages still load KPI trend data.
```

- [ ] **Step 4: Verify the phase with backend and frontend builds**

Run: `dotnet build backend/ITSMBackend.csproj -p:UseAppHost=false --no-restore`
Expected: backend build succeeds.

Run: `npm run build`
Expected: frontend build succeeds.

- [ ] **Step 5: Commit the optimization phase changes**

```bash
git add backend/Services/PredictiveAnalyticsService.cs backend/Controllers/AutomationController.cs backend/Models/AutomationRule.cs backend/Models/Metrics.cs src/pages/advanced-analytics/index.jsx src/pages/automation-rules/index.jsx src/pages/service-performance-analytics/index.jsx
git commit -m "feat: add optimization and csi phase"
```

### Task 7: Final Roadmap Verification

**Files:**
- Modify: `docs/implementation-roadmap.md`
- Modify: `docs/brd-traceability-matrix.md`

- [ ] **Step 1: Cross-check every BRD section against at least one roadmap phase**

```md
## Coverage Check

- Sections 1-4: scope, stakeholders, and assumptions
- Sections 5-9: process requirements, NFRs, integrations, roles, constraints
- Sections 10-13: KPIs, implementation approach, risks, sign-off
- Sections 14-28: use cases, migration, vendor scoring, training, compliance, QA, CSI
```

- [ ] **Step 2: Confirm the roadmap still reflects the repo’s current module boundaries**

```md
## Boundary Check

- Keep tickets, requests, changes, problems, SLA, KB, reporting, and integrations in their existing modules.
- Avoid introducing duplicate page or controller patterns.
```

- [ ] **Step 3: Validate the roadmap document for readability and execution order**

Run: `Get-Content docs/implementation-roadmap.md -TotalCount 120`
Expected: phases appear in the intended sequence with no missing headings.

- [ ] **Step 4: Commit the completed roadmap package**

```bash
git add docs/implementation-roadmap.md docs/brd-traceability-matrix.md
git commit -m "docs: finalize itsm brd roadmap"
```
