# Implementation Plan: ITSM Analytics Hub / ITSM Backend stabilization and spec onboarding

**Branch**: `master` | **Date**: 2026-03-23 | **Spec**: `specs/master/spec.md` (missing, generated placeholder)  
**Input**: Feature specification from `/specs/master/spec.md`

**Note**: This plan is authored by the `/speckit.plan` workflow manually because `/speckit.plan` command is not available in this environment.

## Summary

This plan bootstraps the ITSM Analytics Hub and backend service documentation and architecture for the current repository. Primary goal:
- recover the missing `specs/master/spec.md`,
- establish a feature-level scope for one actionable enhancement (e.g., “Add support for ticket SLA alerts with dashboard and APIs”),
- define architecture and integration contract for existing technology stack.

From research, the dominant codebase is a .NET 10 backend (API + EF Core) with a React 18/Vite frontend.

## Technical Context

**Language/Version**: .NET 10 (backend), JavaScript/React 18 (frontend)  
**Primary Dependencies**: Microsoft.EntityFrameworkCore 10.0.0, AutoMapper.Extensions.Microsoft.DependencyInjection 12.0.1, Swashbuckle.AspNetCore 10.1.5, React 18.2.0, Redux Toolkit 2.6.1, Vite 5.0.0, Tailwind CSS 3.4.6  
**Storage**: SQL Server via Entity Framework Core (Migrations folder present)  
**Testing**: no tests detected in repo; add xUnit / Playwright / React Testing Library as next step  
**Target Platform**: Cross-platform container with ASP.NET Core web service + SPA (Windows/Linux/Cloud)  
**Project Type**: Web application (backend API + frontend SPA)  
**Performance Goals**:  500 concurrent users, sub-200ms API p95 for key dashboards, data loads within 1s for default dashboard query  
**Constraints**: Must be deployable from Docker Compose; adapt to remote DB connection string from `appsettings.json`  
**Scale/Scope**: Organization-level ITSM with ~10k tickets, ~1k assets, multi-tenant reporting scope.  

## Constitution Check

No project constitution rules are defined in `.specify/memory/constitution.md`; continue with standard quality gates:
- existing .NET API controllers should include validation and exception handling,
- any new endpoint must include integration tests and API contract updates.

## Project Structure

### Documentation (this feature)

```text
specs/master/
├── plan.md              # This file (speckit.plan output)
├── research.md          # Phase 0 output (speckit.plan output)
├── data-model.md        # Phase 1 output (speckit.plan output)
├── quickstart.md        # Phase 1 output (speckit.plan output)
├── contracts/
│   └── api-contract.md  # Phase 1 output (speckit.plan output)
└── tasks.md             # Phase 2 output (speckit.tasks - not created yet)
```

### Source Code (repository root)

```text
backend/
├── Controllers/ (Approval/Asset/ChangeRequest/Dashboard/ServiceRequest/Ticket/User/Workflow)
├── Data/ApplicationDbContext.cs
├── DTOs/
├── Helpers/MappingProfile.cs
├── Migrations/ (EF Core initial migration)
├── Models/ (domain entities: ApprovalItem, Asset, AuditLog,ChangeRequest,Metrics,ServiceRequest,Ticket,User,Workflow)
└── Services/ (business-layer services)

src/ (frontend)
├── components/
├── crud/
├── pages/ (domain-specific feature pages)
├── services/
├── styles/
└── utils/
```

**Structure Decision**: Choose Option 2 (Web application with backend API + frontend SPA). Existing code is already split into `backend/` and `src/`.

## Complexity Tracking

No constitution check violations in this plan; standard architecture is used.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
