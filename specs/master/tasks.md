# Tasks: ITSM Analytics Hub

**Input**: Design documents from `/specs/master/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - not requested in specification, so excluded from this task list.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/` directory (.NET 10)
- **Frontend**: `src/` directory (React 18 + Vite)
- **Database**: SQL Server with EF Core migrations

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure per implementation plan
- [X] T002 Initialize .NET 10 backend project with ASP.NET Core dependencies
- [X] T003 Initialize React 18 frontend project with Vite and dependencies
- [X] T004 [P] Configure linting and formatting tools for backend
- [X] T005 [P] Configure linting and formatting tools for frontend

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Setup SQL Server database schema and EF Core migrations
- [X] T007 [P] Implement JWT authentication and authorization framework
- [X] T008 [P] Setup ASP.NET Core API routing and middleware structure
- [X] T009 Create base models/entities that all stories depend on
- [X] T010 Configure global error handling and logging infrastructure
- [ ] T011 Setup environment configuration management for appsettings.json
- [ ] T012 [P] Configure Docker containerization for backend
- [ ] T013 [P] Configure Docker containerization for frontend

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Incident Management Foundation (Priority: P1) 🎯 MVP

**Goal**: Complete incident creation, tracking, and basic lifecycle management with SLA support

**Independent Test**: Can create incidents, assign them, update status, and view incident list/dashboard independently

### Implementation for User Story 1

- [x] T014 [P] [US1] Enhance Ticket model with SLA fields in backend/Models/Ticket.cs
- [x] T015 [P] [US1] Create SLAAlert model in backend/Models/SLAAlert.cs
- [x] T016 [US1] Implement TicketService with SLA calculation logic in backend/Services/TicketService.cs
- [x] T017 [US1] Enhance TicketsController with SLA endpoints in backend/Controllers/TicketsController.cs
- [ ] T018 [US1] Setup incident escalation procedures and notifications
- [ ] T019 [US1] Implement resolution recording and knowledge base integration
- [ ] T020 [US1] Configure major incident handling and communication workflow
- [x] T021 [US1] Create step-by-step incident creation wizard
- [x] T022 [US1] Implement incident list with real-time status and SLA indicators
- [x] T023 [US1] Develop detailed incident workspace with multi-tab information
- [x] T024 [US1] Create timeline visualization for incident lifecycle events
- [ ] T025 [US1] Implement root cause analysis (RCA) tracking and reporting
 functionality

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - User Management & Authentication (In Progress - Backend Core complete, fixing legacy breaks)

**Goal**: Complete user lifecycle management with role-based access control and authentication

**Independent Test**: Can register users, manage roles/permissions, authenticate, and view user profiles independently

### Implementation for User Story 2

    - [x] Add BCrypt.Net-Next dependency
    - [x] Update `User.cs` model with Role and profile fields
    - [x] Create `UserRole.cs` enum
    - [x] Implement `UserService.cs` with auth logic and password hashing
    - [x] Create `UsersController.cs` with login endpoint
    - [ ] [/] Fix legacy code breaks (AuthController, Ticket model synchrony)
    - [ ] [ ] Add and apply EF Core migrations
    - [ ] [ ] Frontend: Create Auth service and Login page
    - [ ] [ ] Frontend: Create User Management administration page
- [ ] T028 [US2] Enhance UsersController with authentication endpoints in backend/Controllers/UsersController.cs
- [ ] T029 [US2] Implement role-based authorization middleware
- [ ] T030 [US2] Add user registration and profile management
- [ ] T031 [US2] Implement password reset and account recovery
- [ ] T032 [P] [US2] Create user management page in src/pages/user-management/
- [ ] T033 [P] [US2] Create authentication components in src/components/auth/
- [ ] T034 [US2] Implement user CRUD operations in src/services/api.js
- [ ] T035 [US2] Add user form validation and role management UI
- [ ] T036 [US2] Implement user search and permission management

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Basic Dashboards (Priority: P1)

**Goal**: Implement real-time dashboards with key metrics and SLA monitoring

**Independent Test**: Can view dashboard with ticket metrics, SLA status, and basic analytics independently

### Implementation for User Story 3

- [ ] T037 [P] [US3] Enhance Metrics model for dashboard data in backend/Models/Metrics.cs
- [ ] T038 [US3] Implement DashboardService with metrics calculation in backend/Services/DashboardService.cs
- [ ] T039 [US3] Enhance DashboardController with SLA metrics in backend/Controllers/DashboardController.cs
- [ ] T040 [US3] Implement real-time metrics aggregation
- [ ] T041 [US3] Add dashboard data caching and performance optimization
- [ ] T042 [P] [US3] Create dashboard page in src/pages/dashboard/
- [ ] T043 [P] [US3] Create chart components using Recharts in src/components/charts/
- [ ] T044 [US3] Implement dashboard API calls in src/services/api.js
- [ ] T045 [US3] Add dashboard filtering and date range selection
- [ ] T046 [US3] Implement responsive dashboard layout

**Checkpoint**: All P1 user stories should now be independently functional

---

## Phase 6: User Story 4 - Change Management (Priority: P2)

**Goal**: Complete change request lifecycle with approval workflows and risk assessment

**Independent Test**: Can create change requests, manage approvals, track implementation independently

### Implementation for User Story 4

- [ ] T047 [P] [US4] Enhance ChangeRequest model with approval workflow in backend/Models/ChangeRequest.cs
- [ ] T048 [US4] Implement ChangeRequestService with approval logic in backend/Services/ChangeRequestService.cs
- [ ] T049 [US4] Enhance ChangeRequestsController with workflow endpoints in backend/Controllers/ChangeRequestsController.cs
- [ ] T050 [US4] Implement change risk assessment and scheduling
- [ ] T051 [US4] Add change approval routing and notifications
- [ ] T052 [P] [US4] Create change management page in src/pages/change-management/
- [ ] T053 [P] [US4] Create approval workflow components in src/components/approvals/
- [ ] T054 [US4] Implement change request CRUD operations in src/services/api.js
- [ ] T055 [US4] Add change request form with risk assessment
- [ ] T056 [US4] Implement change calendar and scheduling view

**Checkpoint**: Change management functionality complete and independently testable

---

## Phase 7: User Story 5 - Asset Management (Priority: P2)

**Goal**: Implement comprehensive CMDB with asset lifecycle tracking and maintenance

**Independent Test**: Can manage assets, track lifecycle, schedule maintenance independently

### Implementation for User Story 5

- [ ] T057 [P] [US5] Enhance Asset model with lifecycle fields in backend/Models/Asset.cs
- [ ] T058 [US5] Implement AssetService with maintenance scheduling in backend/Services/AssetService.cs
- [ ] T059 [US5] Enhance AssetsController with lifecycle endpoints in backend/Controllers/AssetsController.cs
- [ ] T060 [US5] Implement asset cost tracking and depreciation
- [ ] T061 [US5] Add contract and warranty management
- [ ] T062 [P] [US5] Create asset management page in src/pages/asset-management/
- [ ] T063 [P] [US5] Create asset components in src/components/assets/
- [ ] T064 [US5] Implement asset CRUD operations in src/services/api.js
- [ ] T065 [US5] Add asset search and filtering functionality
- [ ] T066 [US5] Implement asset maintenance scheduling UI

**Checkpoint**: Asset management functionality complete and independently testable

---

## Phase 8: User Story 6 - Workflow Automation (Priority: P2)

**Goal**: Implement visual workflow designer with automated business processes

**Independent Test**: Can design workflows, execute automated processes independently

### Implementation for User Story 6

- [ ] T067 [P] [US6] Enhance Workflow model with visual designer support in backend/Models/Workflow.cs
- [ ] T068 [US6] Implement WorkflowService with execution engine in backend/Services/WorkflowService.cs
- [ ] T069 [US6] Enhance WorkflowsController with designer endpoints in backend/Controllers/WorkflowsController.cs
- [ ] T070 [US6] Implement workflow step execution and branching
- [ ] T071 [US6] Add workflow analytics and performance tracking
- [ ] T072 [P] [US6] Create workflow designer page in src/pages/workflow-designer/
- [ ] T073 [P] [US6] Create workflow components in src/components/workflows/
- [ ] T074 [US6] Implement workflow CRUD operations in src/services/api.js
- [ ] T075 [US6] Add drag-and-drop workflow designer UI
- [ ] T076 [US6] Implement workflow execution monitoring

**Checkpoint**: Workflow automation functionality complete and independently testable

---

## Phase 9: User Story 7 - Advanced Analytics (Priority: P2)

**Goal**: Implement predictive analytics and comprehensive reporting capabilities

**Independent Test**: Can generate reports, view trends, and predictive analytics independently

### Implementation for User Story 7

- [ ] T077 [P] [US7] Create Analytics model for advanced metrics in backend/Models/Analytics.cs
- [ ] T078 [US7] Implement AnalyticsService with predictive algorithms in backend/Services/AnalyticsService.cs
- [ ] T079 [US7] Create AnalyticsController with reporting endpoints in backend/Controllers/AnalyticsController.cs
- [ ] T080 [US7] Implement trend analysis and forecasting
- [ ] T081 [US7] Add custom reporting with data export
- [ ] T082 [P] [US7] Create analytics dashboard page in src/pages/analytics/
- [ ] T083 [P] [US7] Create advanced chart components in src/components/analytics/
- [ ] T084 [US7] Implement analytics API calls in src/services/api.js
- [ ] T085 [US7] Add report builder with custom queries
- [ ] T086 [US7] Implement data export functionality

**Checkpoint**: Advanced analytics functionality complete and independently testable

---

## Phase 10: User Story 8 - Service Request Management (Priority: P2)

**Goal**: Implement self-service request catalog with automated fulfillment

**Independent Test**: Can browse catalog, submit requests, track fulfillment independently

### Implementation for User Story 8

- [ ] T087 [P] [US8] Enhance ServiceRequest model with catalog support in backend/Models/ServiceRequest.cs
- [ ] T088 [US8] Implement ServiceRequestService with fulfillment logic in backend/Services/ServiceRequestService.cs
- [ ] T089 [US8] Enhance ServiceRequestsController with catalog endpoints in backend/Controllers/ServiceRequestsController.cs
- [ ] T090 [US8] Implement request catalog and approval workflows
- [ ] T091 [US8] Add service level agreement tracking
- [ ] T092 [P] [US8] Create service catalog page in src/pages/service-catalog/
- [ ] T093 [P] [US8] Create request components in src/components/requests/
- [ ] T094 [US8] Implement service request CRUD operations in src/services/api.js
- [ ] T095 [US8] Add request catalog browsing and search
- [ ] T096 [US8] Implement request tracking and status updates

**Checkpoint**: Service request management functionality complete and independently testable

---

## Phase 11: User Story 9 - External Integrations (Priority: P3)

**Goal**: Implement integrations with ManageEngine, ServiceNow, and other external systems

**Independent Test**: Can synchronize data with external systems and handle webhooks independently

### Implementation for User Story 9

- [ ] T097 [P] [US9] Create Integration model for external systems in backend/Models/Integration.cs
- [ ] T098 [US9] Implement ManageEngineService for bidirectional sync in backend/Services/ManageEngineService.cs
- [ ] T099 [US9] Enhance ManageEngineController with sync endpoints in backend/Controllers/ManageEngineController.cs
- [ ] T100 [US9] Implement webhook handling for external events
- [ ] T101 [US9] Add email/SMS notification integrations
- [ ] T102 [P] [US9] Create integration management page in src/pages/integrations/
- [ ] T103 [P] [US9] Create integration components in src/components/integrations/
- [ ] T104 [US9] Implement integration API calls in src/services/api.js
- [ ] T105 [US9] Add integration configuration and monitoring
- [ ] T106 [US9] Implement error handling and retry mechanisms

**Checkpoint**: External integrations functionality complete and independently testable

---

## Phase 12: User Story 10 - Advanced Reporting (Priority: P3)

**Goal**: Implement executive dashboards and comprehensive compliance reporting

**Independent Test**: Can generate executive reports and compliance documentation independently

### Implementation for User Story 10

- [ ] T107 [P] [US10] Create Report model for executive reporting in backend/Models/Report.cs
- [ ] T108 [US10] Implement ReportService with compliance logic in backend/Services/ReportService.cs
- [ ] T109 [US10] Create ReportsController with export endpoints in backend/Controllers/ReportsController.cs
- [ ] T110 [US10] Implement executive dashboard with KPIs
- [ ] T111 [US10] Add compliance reporting and audit trails
- [ ] T112 [P] [US10] Create executive dashboard page in src/pages/executive-dashboard/
- [ ] T113 [P] [US10] Create report components in src/components/reports/
- [ ] T114 [US10] Implement reporting API calls in src/services/api.js
- [ ] T115 [US10] Add report scheduling and distribution
- [ ] T116 [US10] Implement compliance documentation generation

**Checkpoint**: Advanced reporting functionality complete and independently testable

---

## Phase 13: User Story 11 - API Ecosystem (Priority: P3)

**Goal**: Implement comprehensive REST API with OpenAPI documentation and ecosystem support

**Independent Test**: Can access all endpoints via API and generate documentation independently

### Implementation for User Story 11

- [ ] T117 [US11] Configure OpenAPI/Swagger documentation for all controllers
- [ ] T118 [US11] Implement API versioning and backward compatibility
- [ ] T119 [US11] Add comprehensive input validation and error responses
- [ ] T120 [US11] Implement API rate limiting and throttling
- [ ] T121 [US11] Add API analytics and usage tracking
- [ ] T122 [P] [US11] Create API documentation page in src/pages/api-docs/
- [ ] T123 [P] [US11] Create API client components in src/components/api/
- [ ] T124 [US11] Enhance API service layer in src/services/api.js
- [ ] T125 [US11] Add API testing and sandbox functionality
- [ ] T126 [US11] Implement API key management and authentication

**Checkpoint**: API ecosystem functionality complete and independently testable

---

## Phase 14: User Story 12 - Performance Optimization (Priority: P4)

**Goal**: Optimize system performance for 500+ concurrent users with sub-200ms response times

**Independent Test**: Can handle load testing and performance benchmarks independently

### Implementation for User Story 12

- [ ] T127 [US12] Implement Redis caching for frequently accessed data
- [ ] T128 [US12] Add database query optimization and indexing
- [ ] T129 [US12] Implement background job processing with Hangfire
- [ ] T130 [US12] Add performance monitoring and Application Insights
- [ ] T131 [US12] Optimize frontend bundle size and loading
- [ ] T132 [P] [US12] Create performance monitoring dashboard in src/pages/performance/
- [ ] T133 [US12] Implement lazy loading and code splitting
- [ ] T134 [US12] Add database connection pooling and optimization
- [ ] T135 [US12] Implement CDN integration for static assets
- [ ] T136 [US12] Add automated performance testing

**Checkpoint**: Performance optimization complete and system meets performance goals

---

## Phase 15: User Story 13 - Multi-tenant Support (Priority: P4)

**Goal**: Implement multi-tenant architecture with data isolation and tenant management

**Independent Test**: Can manage multiple tenants with proper data isolation independently

### Implementation for User Story 13

- [ ] T137 [P] [US13] Create Tenant model for multi-tenant support in backend/Models/Tenant.cs
- [ ] T138 [US13] Implement tenant data isolation in ApplicationDbContext.cs
- [ ] T139 [US13] Add tenant middleware for request routing
- [ ] T140 [US13] Implement tenant provisioning and management
- [ ] T141 [US13] Add tenant-specific configuration and branding
- [ ] T142 [P] [US13] Create tenant management page in src/pages/tenant-management/
- [ ] T143 [US13] Implement tenant switching in frontend
- [ ] T144 [US13] Add tenant data migration and backup
- [ ] T145 [US13] Implement tenant billing and usage tracking
- [ ] T146 [US13] Add tenant security and access controls

**Checkpoint**: Multi-tenant support complete and independently testable

---

## Phase 16: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T147 [P] Documentation updates in README.md and docs/
- [ ] T148 Code cleanup and refactoring across all modules
- [ ] T149 Security hardening and vulnerability fixes
- [ ] T150 [P] Environment configuration validation
- [ ] T151 Run quickstart.md validation and setup verification
- [ ] T152 [P] Docker Compose orchestration setup
- [ ] T153 Final integration testing across all user stories
- [ ] T154 Performance benchmarking and optimization validation
- [ ] T155 [P] Production deployment preparation
- [ ] T156 User acceptance testing coordination

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-15)**: All depend on Foundational phase completion
  - P1 stories (US1-US3) can proceed in parallel or priority order
  - P2 stories (US4-US8) can proceed in parallel after P1 completion
  - P3 stories (US9-US11) can proceed in parallel after P2 completion
  - P4 stories (US12-US13) can proceed in parallel after P3 completion
- **Polish (Phase 16)**: Depends on all desired user stories being complete

### User Story Dependencies

- **P1 Stories**: Can start after Foundational - No dependencies on other stories
- **P2 Stories**: Can start after P1 completion - May integrate with P1 stories but independently testable
- **P3 Stories**: Can start after P2 completion - May integrate with earlier stories but independently testable
- **P4 Stories**: Can start after P3 completion - May integrate with earlier stories but independently testable

### Within Each User Story

- Models before services
- Services before controllers
- Backend before frontend
- Core implementation before advanced features
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel
- Once Foundational completes, P1 stories can start in parallel
- Models within a story marked [P] can run in parallel
- Frontend components marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all models for User Story 1 together:
Task: "Enhance Ticket model with SLA fields in backend/Models/Ticket.cs"
Task: "Create SLAAlert model in backend/Models/SLAAlert.cs"

# Launch all frontend components for User Story 1 together:
Task: "Create incident management page in src/pages/incident-management/"
Task: "Create incident detail view component in src/components/incidents/"
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3-5: P1 User Stories (Incident, User, Dashboard)
4. **STOP and VALIDATE**: Test P1 stories independently
5. Deploy/demo MVP if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add P1 Stories → Test independently → Deploy/Demo (MVP!)
3. Add P2 Stories → Test independently → Deploy/Demo
4. Add P3 Stories → Test independently → Deploy/Demo
5. Add P4 Stories → Test independently → Deploy/Demo
6. Each phase adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: P1 Stories (Incident + User Management)
   - Developer B: P2 Stories (Change + Asset Management)
   - Developer C: P3 Stories (Integrations + Reporting)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence</content>
<parameter name="filePath">D:\itsm-main\specs\master\tasks.md