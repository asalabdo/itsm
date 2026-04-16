# Arabic Localization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Localize the most visible English UI into Arabic across dashboards, forms, breadcrumbs, dialogs, and tables while preserving a reliable English fallback.

**Architecture:** We will keep one shared translation helper in `src/services/i18n.js` and use it from reusable UI chrome first, then apply it to the most visible page-level surfaces. RTL layout is already in place, so this pass focuses on text, labels, and table/dialog copy rather than rebuilding the layout system. The work is split so each task remains testable and can be verified with a production build.

**Tech Stack:** React 18, Vite, Tailwind CSS, localStorage-based language state, shared translation helper.

---

### Task 1: Shared Arabic Chrome

**Files:**
- Modify: `src/services/i18n.js`
- Modify: `src/components/ui/BreadcrumbTrail.jsx`
- Modify: `src/components/ui/Header.jsx`
- Modify: `src/components/ui/Sidebar.jsx`

- [ ] **Step 1: Add missing Arabic strings to the shared translation helper**

```js
// Extend the existing translation map with labels used by dashboards,
// forms, breadcrumbs, dialogs, and table chrome.
// Keep English fallback behavior unchanged.
```

- [ ] **Step 2: Wire breadcrumbs and navigation chrome to the helper**

```js
// Breadcrumbs should render translated Home/route labels.
// Header and sidebar should use translated section names and action text.
```

- [ ] **Step 3: Verify the shared chrome still renders in English and Arabic**

Run: `npm run build`
Expected: build succeeds with no new syntax errors.

- [ ] **Step 4: Commit the shared chrome localization**

```bash
git add src/services/i18n.js src/components/ui/BreadcrumbTrail.jsx src/components/ui/Header.jsx src/components/ui/Sidebar.jsx
git commit -m "feat: translate shared navigation chrome"
```

### Task 2: Dashboard Pages

**Files:**
- Modify: `src/pages/it-operations-command-center/index.jsx`
- Modify: `src/pages/executive-it-service-summary/index.jsx`
- Modify: `src/pages/manager-dashboard/index.jsx`
- Modify: `src/pages/service-performance-analytics/index.jsx`
- Modify: `src/pages/service-request-management/index.jsx`
- Modify: `src/pages/agent-dashboard/index.jsx`

- [ ] **Step 1: Translate the dashboard page titles, KPI labels, and action buttons**

```js
// Replace visible English dashboard copy with translations from src/services/i18n.js.
// Preserve numeric formatting and data values.
```

- [ ] **Step 2: Translate dashboard helper components used by those pages**

```js
// Update visible labels inside shared dashboard sections/cards/charts where needed.
// Prefer helper-driven strings over hardcoded inline text.
```

- [ ] **Step 3: Verify the dashboard screens build cleanly**

Run: `npm run build`
Expected: build succeeds with no new syntax errors.

- [ ] **Step 4: Commit dashboard localization**

```bash
git add src/pages/it-operations-command-center/index.jsx src/pages/executive-it-service-summary/index.jsx src/pages/manager-dashboard/index.jsx src/pages/service-performance-analytics/index.jsx src/pages/service-request-management/index.jsx src/pages/agent-dashboard/index.jsx
git commit -m "feat: localize dashboard pages to arabic"
```

### Task 3: Forms, Settings, Dialogs, and Tables

**Files:**
- Modify: `src/pages/settings/index.jsx`
- Modify: `src/pages/ticket-creation/index.jsx`
- Modify: `src/pages/ticket-management-center/index.jsx`
- Modify: `src/pages/ticket-details/index.jsx`
- Modify: `src/pages/customer-portal/index.jsx`
- Modify: `src/components/ui/NotificationCenter.jsx`
- Modify: `src/components/ui/SearchBar.jsx`
- Modify: `src/components/ui/UserProfileMenu.jsx`

- [ ] **Step 1: Translate settings and form labels**

```js
// Translate headings, inputs, button text, and helper copy on settings and other visible forms.
// Keep the current data flow and localStorage language switch intact.
```

- [ ] **Step 2: Translate dialog, drawer, and table-facing copy**

```js
// Translate reusable dialog titles, table headers, empty states, and menu labels.
// Keep the table data values untouched.
```

- [ ] **Step 3: Verify forms and table screens build cleanly**

Run: `npm run build`
Expected: build succeeds with no new syntax errors.

- [ ] **Step 4: Commit forms/settings localization**

```bash
git add src/pages/settings/index.jsx src/pages/ticket-creation/index.jsx src/pages/ticket-management-center/index.jsx src/pages/ticket-details/index.jsx src/pages/customer-portal/index.jsx src/components/ui/NotificationCenter.jsx src/components/ui/SearchBar.jsx src/components/ui/UserProfileMenu.jsx
git commit -m "feat: localize forms and data views to arabic"
```

### Task 4: Verification Sweep

**Files:**
- Modify: any files needed to fix build or lint regressions from the localization pass

- [ ] **Step 1: Run a production build**

Run: `npm run build`
Expected: exit code `0`.

- [ ] **Step 2: Run lint on touched JavaScript files**

Run: `npx eslint src/services/i18n.js src/components/ui/BreadcrumbTrail.jsx src/components/ui/Header.jsx src/components/ui/Sidebar.jsx src/pages/settings/index.jsx`
Expected: zero errors in touched files.

- [ ] **Step 3: Fix any regression found by build/lint**

```js
// Apply only the minimal fix needed for the failing line or component.
```

- [ ] **Step 4: Final commit if verification introduced changes**

```bash
git add <updated files>
git commit -m "fix: finalize arabic localization sweep"
```
