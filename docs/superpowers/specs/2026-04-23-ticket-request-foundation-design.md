# Ticket and Service Request Foundation Design

**Goal:** Strengthen the Phase 1 foundation by making ticket intake, customer portal refresh behavior, and service-request submission feel like one coherent entry flow.

**Architecture:** The existing backend already exposes ticket, service-request, and knowledge-base APIs, and the customer portal already renders all three surfaces. This design keeps that structure intact and focuses on small behavior changes inside the current portal components so users can refresh data reliably, create tickets with clear defaults, and submit service requests through the catalog without feeling like they are switching products.

**Scope:** Combined ticketing and service-request foundation slice for Phase 1.

---

## Current State

- The customer portal already shows ticket metrics, recent activity, quick actions, and knowledge content.
- The refresh action in the portal now reloads ticket and knowledge data through a shared `itsm:refresh` event.
- Ticket creation already exists as a dedicated flow with SLA lookup and ERP department loading.
- Service catalog submission already exists through the catalog page and request service layer.

## Problem to Solve

- Ticket intake and service-request submission are functionally present but still feel like separate surfaces.
- The portal needs a more reliable refresh path so ticket and knowledge views stay current after user actions.
- The combined foundation slice should make the primary user journey obvious: start in the portal, choose incident or request, then submit and track the item in the same experience.

## Proposed Design

### 1. Portal Refresh and Entry Flow

- Keep the `itsm:refresh` event as the shared refresh contract for customer-portal subcomponents.
- Refresh should reload customer tickets and knowledge articles without requiring a page reload.
- Quick actions should continue to route users to ticket details, service-request management, reports, or chatbot support.
- The portal should present ticket intake and service-request entry as the main actions, not as secondary navigation.

### 2. Ticket Intake

- Keep the current ticket-creation page and backend ticket controller/service.
- Preserve SLA lookup, ERP department loading, draft persistence, and priority defaults.
- Use the portal as the main entry point into ticket creation, but keep the detailed intake form on the dedicated ticket-creation page.
- Ticket submission should continue to write through the existing ticket API without introducing a second ticket model.

### 3. Service-Request Submission

- Keep the service catalog page and service-request backend controller/service.
- Preserve catalog search, localization, and dynamic form rendering.
- Catalog submission should remain the authoritative path for service requests.
- The user experience should make the catalog look like a natural continuation of the portal, not a separate app.

### 4. Knowledge Surfacing

- Keep knowledge articles visible in the portal and knowledge-base page.
- Refresh should reload the article list so portal users see current guidance after updates.
- The knowledge surface remains read-oriented in this slice; article governance stays for later work.

## Component Boundaries

- `src/pages/customer-portal/index.jsx`
  - Owns the combined portal experience, ticket data loading, refresh wiring, and portal section layout.
- `src/pages/customer-portal/components/QuickActionsPanel.jsx`
  - Owns portal shortcuts and recent ticket activity display.
- `src/pages/customer-portal/components/KnowledgeBaseSection.jsx`
  - Owns portal knowledge listings and refresh behavior.
- `src/pages/ticket-creation/index.jsx`
  - Owns detailed incident intake and draft persistence.
- `src/pages/service-catalog/index.jsx`
  - Owns catalog browsing, filtering, localization, and request submission.
- `backend/Controllers/TicketsController.cs`
  - Owns ticket create/read/update behavior and SLA refresh operations.
- `backend/Controllers/ServiceRequestsController.cs`
  - Owns catalog access and request submission.
- `backend/Controllers/KnowledgeBaseController.cs`
  - Owns article retrieval and search.

## Data Flow

1. User opens the customer portal.
2. Portal loads ticket summaries, recent activity, and knowledge articles.
3. User clicks a quick action or navigation link.
4. Ticket creation or service-request submission uses the existing controller/service contract.
5. On success, the portal can refresh using `itsm:refresh` so the user sees updated ticket and knowledge data immediately.

## Error Handling

- If ticket loading fails, the portal should continue rendering with empty or fallback state rather than blocking the whole page.
- If knowledge loading fails, the portal should show the existing load error state and keep the rest of the portal usable.
- If a service catalog submission fails, the user should see the existing submission error message and keep their current form state.
- If refresh fails, the page should remain usable and the user should still be able to navigate manually.

## Acceptance Criteria

- The customer portal refresh action reloads tickets and knowledge without a full page refresh.
- The portal shows real ticket activity when ticket data exists.
- Ticket creation still submits through the existing ticket flow and preserves current defaults.
- Service catalog submission still routes through the existing service-request flow.
- The combined experience keeps portal, ticket, request, and knowledge behavior in the existing module boundaries.

## Test Strategy

- Build the frontend after the portal and knowledge refresh wiring changes.
- Verify the customer portal renders ticket data and knowledge data after a refresh event.
- Verify ticket creation still loads and submits with the current SLA and ERP defaults.
- Verify service-catalog submission still succeeds through the existing request service.
- Verify the knowledge page still loads articles and search results.

## Non-Goals

- No change to change-management, problem-management, or SLA policy depth in this slice.
- No migration work in this slice.
- No new portal module or second customer journey.
- No redesign of the existing backend API shape unless a blocker appears during implementation.
