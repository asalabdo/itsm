# Ticket and Service Request Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Phase 1 customer portal foundation feel like one coherent flow for incident intake, service-request submission, and knowledge-driven self-service.

**Architecture:** The current portal already has the right high-level surfaces: portal dashboard, ticket creation, service catalog, and knowledge content. The implementation should preserve those module boundaries while wiring a shared refresh contract, keeping ticket entry reliable, and making service-request submission feel like a natural continuation of the portal rather than a separate path. The backend controller/service contracts stay intact unless a task proves a specific data or state gap.

**Tech Stack:** React 18, Vite, ASP.NET Core, .NET 10, existing ITSM API services, React Router, localStorage/sessionStorage, existing knowledge-base localization helpers.

---

### Task 1: Portal Refresh and Activity Wiring

**Files:**
- Modify: `src/pages/customer-portal/index.jsx`
- Modify: `src/pages/customer-portal/components/QuickActionsPanel.jsx`
- Modify: `src/pages/customer-portal/components/KnowledgeBaseSection.jsx`
- Test: `npm run build`

- [x] **Step 1: Write the portal refresh contract into the customer portal**

```jsx
useEffect(() => {
  const handleRefresh = () => {
    void loadCustomerTickets();
  };

  window.addEventListener('itsm:refresh', handleRefresh);
  return () => window.removeEventListener('itsm:refresh', handleRefresh);
}, [loadCustomerTickets]);
```

- [x] **Step 2: Pass real ticket data into the quick-actions panel so recent activity reflects the loaded portal state**

```jsx
<QuickActionsPanel tickets={tickets} />
```

- [x] **Step 3: Wire the knowledge section to the same refresh event so portal users can refresh the article list without a page reload**

```jsx
useEffect(() => {
  const loadArticles = async () => {
    try {
      const res = await knowledgeBaseAPI.getArticles();
      setRawArticles(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setRawArticles([]);
    }
  };

  void loadArticles();

  const handleRefresh = () => {
    void loadArticles();
  };

  window.addEventListener('itsm:refresh', handleRefresh);
  return () => window.removeEventListener('itsm:refresh', handleRefresh);
}, []);
```

- [x] **Step 4: Verify the portal refresh path with a production build**

Run: `npm run build`
Expected: Vite build succeeds with no new errors.

- [x] **Step 5: Commit the portal refresh wiring**

```bash
git add src/pages/customer-portal/index.jsx src/pages/customer-portal/components/QuickActionsPanel.jsx src/pages/customer-portal/components/KnowledgeBaseSection.jsx
git commit -m "feat: wire customer portal refresh flow"
```

### Task 2: Ticket Intake Hardening

**Files:**
- Modify: `src/pages/ticket-creation/index.jsx`
- Modify: `src/pages/customer-portal/components/TicketCreationCard.jsx`
- Modify: `backend/Controllers/TicketsController.cs`
- Modify: `backend/Services/TicketService.cs`
- Test: `npm run build`
- Test: `dotnet build backend/ITSMBackend.csproj -p:UseAppHost=false --no-restore`

- [x] **Step 1: Keep ticket intake anchored to the existing incident form and defaults**

```jsx
const initialFormData = {
  module: '',
  category: '',
  service: null,
  employee: null,
  priority: '',
  subject: '',
  description: '',
  dueDate: '',
  department: '',
  impact: '',
  urgency: '',
  attachments: [],
};
```

- [x] **Step 2: Preserve the current SLA lookup and ERP department loading paths while making the form easier to continue from the portal**

```jsx
useEffect(() => {
  let mounted = true;
  loadErpDepartmentDirectory()
    .then((departments) => {
      if (mounted) setErpDepartments(Array.isArray(departments) ? departments : []);
    })
    .catch((error) => {
      console.error('Failed to load ERP departments:', error);
      if (mounted) setErpDepartments([]);
    });
  return () => {
    mounted = false;
  };
}, []);
```

- [x] **Step 3: Keep ticket submission flowing through the existing controller/service contract so the portal remains a single entry path**

```csharp
[HttpPost]
public async Task<ActionResult<TicketDto>> CreateTicket([FromBody] CreateTicketDto dto)
{
    var currentUserId = await GetCurrentActiveUserIdAsync();
    if (currentUserId == null)
    {
        return Forbid();
    }

    int requestedById = currentUserId.Value;
    var ticket = await _ticketService.CreateTicketAsync(dto, requestedById);
    return CreatedAtAction(nameof(GetTicketById), new { id = ticket.Id }, ticket);
}
```

- [x] **Step 4: Verify the ticket flow on both frontend and backend**

Run: `npm run build`
Expected: frontend build succeeds.

Run: `dotnet build backend/ITSMBackend.csproj -p:UseAppHost=false --no-restore`
Expected: backend build succeeds.

- [x] **Step 5: Commit the ticket intake hardening**

```bash
git add src/pages/ticket-creation/index.jsx src/pages/customer-portal/components/TicketCreationCard.jsx backend/Controllers/TicketsController.cs backend/Services/TicketService.cs
git commit -m "feat: harden ticket intake flow"
```

### Task 3: Service-Request Submission Continuity

**Files:**
- Modify: `src/pages/service-catalog/index.jsx`
- Modify: `backend/Controllers/ServiceRequestsController.cs`
- Modify: `backend/Services/ServiceRequestService.cs`
- Test: `npm run build`
- Test: `dotnet build backend/ITSMBackend.csproj -p:UseAppHost=false --no-restore`

- [x] **Step 1: Keep catalog browsing, filtering, and localization in the same component so service-request entry still feels like part of the portal**

```jsx
const filteredCatalog = useMemo(() => {
  const query = searchQuery.trim().toLowerCase();
  const mergedCatalog = [
    ...catalog,
    ...externalCatalog.map((item) => ({
      id: `${item.source}-${item.externalId}`,
      name: item.name,
      description: item.description,
      category: item.category || item.source,
      icon: item.source === 'OpManager' ? 'Radar' : 'Layers3',
      defaultSlaHours: item.itemType === 'alert' ? 1 : 0,
      requiresApproval: false,
      formConfigJson: '[]',
      sourceSystem: item.source,
      sourceType: item.itemType,
      sourceStatus: item.status,
      sourcePriority: item.priority,
      owner: item.owner,
      externalUrl: item.externalUrl,
      metadata: item.metadata || {},
      isExternal: true,
    }))
  ];

  const visibleCatalog = mergedCatalog.filter((item) => !isHiddenCatalogItem(item));
  if (!query) return visibleCatalog;
  return visibleCatalog.filter((item) => {
    const name = localizeName(item);
    const desc = localizeDescription(item);
    const cat = localizeText(item?.category, CATALOG_CATEGORY_LABELS_AR);
    return [name, desc, cat].join(' ').toLowerCase().includes(query);
  });
}, [catalog, externalCatalog, searchQuery, localizeDescription, localizeName, localizeText]);
```

- [x] **Step 2: Keep the request submission path bound to the existing request service instead of introducing a second workflow**

```jsx
await serviceRequestService.submitRequest({
  title: `${t('requestFor', 'Request for')} ${localizedSelectedName}`,
  description: `${t('userRequested', 'User requested')} ${localizedSelectedName} ${t('viaServiceCatalog', 'via Service Catalog.')}`,
  catalogItemId: selectedItem.id,
  customDataJson: JSON.stringify(formData)
});
```

- [x] **Step 3: Keep the controller action aligned with the logged-in user identity so portal submission stays consistent**

```csharp
[HttpPost]
public async Task<ActionResult<ServiceRequestDto>> Create([FromBody] CreateServiceRequestDto dto)
{
    var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
    {
        return Unauthorized();
    }

    var request = await _service.CreateAsync(dto, userId);
    return CreatedAtAction(nameof(GetById), new { id = request.Id }, request);
}
```

- [x] **Step 4: Verify service-request continuity with frontend and backend builds**

Run: `npm run build`
Expected: frontend build succeeds.

Run: `dotnet build backend/ITSMBackend.csproj -p:UseAppHost=false --no-restore`
Expected: backend build succeeds.

- [x] **Step 5: Commit the service-request continuity changes**

```bash
git add src/pages/service-catalog/index.jsx backend/Controllers/ServiceRequestsController.cs backend/Services/ServiceRequestService.cs
git commit -m "feat: tighten service request continuity"
```

### Task 4: Knowledge Surfacing Regression Check

**Files:**
- Modify: `src/pages/knowledge-base/index.jsx`
- Modify: `src/pages/customer-portal/components/KnowledgeBaseSection.jsx`
- Test: `npm run build`

- [ ] **Step 1: Keep the knowledge-base page and portal section on the same article source and localization helpers**

```jsx
const loadArticles = async () => {
  setLoading(true);
  setLoadError('');

  try {
    const res = query.trim()
      ? await knowledgeBaseAPI.search(query.trim())
      : await knowledgeBaseAPI.getArticles();
    const data = Array.isArray(res.data) ? res.data : [];
    setArticles(data);
    setSelectedArticle(data[0] || null);
  } catch {
    setArticles([]);
    setSelectedArticle(null);
    setLoadError(loadErrorText);
  } finally {
    setLoading(false);
  }
};
```

- [ ] **Step 2: Verify the same refresh behavior still leaves the knowledge page usable**

```jsx
const handleRefresh = () => {
  void loadArticles();
};
```

- [ ] **Step 3: Run the frontend build to make sure the portal and knowledge changes stay compatible**

Run: `npm run build`
Expected: Vite build succeeds.

- [ ] **Step 4: Commit the knowledge-surface regression check**

```bash
git add src/pages/knowledge-base/index.jsx src/pages/customer-portal/components/KnowledgeBaseSection.jsx
git commit -m "feat: keep knowledge surfacing aligned"
```

### Task 5: Final Verification Sweep

**Files:**
- Modify: any files needed to fix issues found during verification

- [ ] **Step 1: Run the frontend build after the combined foundation changes**

Run: `npm run build`
Expected: exit code `0`.

- [ ] **Step 2: Run the backend build after the ticket and request changes**

Run: `dotnet build backend/ITSMBackend.csproj -p:UseAppHost=false --no-restore`
Expected: exit code `0`.

- [ ] **Step 3: Fix only the regressions found by the build commands**

Edit only the file and line reported by the failing build output, then rerun the same build command until it passes.

- [ ] **Step 4: Commit the final foundation sweep**

```bash
git add src/pages/customer-portal/index.jsx src/pages/customer-portal/components/QuickActionsPanel.jsx src/pages/customer-portal/components/KnowledgeBaseSection.jsx src/pages/ticket-creation/index.jsx src/pages/customer-portal/components/TicketCreationCard.jsx src/pages/service-catalog/index.jsx src/pages/knowledge-base/index.jsx backend/Controllers/TicketsController.cs backend/Services/TicketService.cs backend/Controllers/ServiceRequestsController.cs backend/Services/ServiceRequestService.cs
git commit -m "feat: finalize ticket and request foundation"
```
