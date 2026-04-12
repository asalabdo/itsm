# Research: ITSM Analytics Hub / Backend stabilization

## Decision: Align with existing repository stack
- Chosen: Keep `.NET 10` backend with EF Core + SQL Server, and React 18 + Vite frontend.
- Add a first feature scope around `ticket SLA alerting with dashboard visibility` as an exemplar.

## Rationale:
- Backend already contains full domain models (tickets, change requests, workflows, assets, approvals) and controllers.
- Frontend has canned dashboards and route structure under `src/pages`.
- Missing `spec.md` indicates this is a placeholder feature plan; first action is to create minimal spec for approved feature.

## Alternatives considered:
1. Rewrite backend to .NET 8 or 9: rejected because existing code uses .NET 10 and migration risk is unnecessary.
2. Introduce full multi-tenant schema: add later—start with single-tenant with clean model extension.
3. Build GraphQL API: postponed; REST API already implemented.

## Unresolved items (NEEDS CLARIFICATION):
- Concrete feature statement from stakeholders (missing original spec)  
- Acceptance criteria for SLA workflow, alert levels, and dashboard filters  
- Testing strategy (unit/integration/e2e) to be added via team policy
