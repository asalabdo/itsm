import { workflowsAPI } from './api';

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const workflowStagesByService = {
  incident: ['Intake', 'Classify', 'Assign', 'ERP fan-out', 'Resolve', 'Close'],
  service_request: ['Request', 'Approval', 'ERP sync', 'Fulfill', 'Close'],
  service: ['Request', 'Approval', 'ERP sync', 'Fulfill', 'Close'],
  change: ['Request', 'Risk review', 'CAB approval', 'Implement', 'Validate', 'Close'],
  problem: ['Detect', 'Analyze', 'Root cause', 'Mitigate', 'Close'],
  asset: ['Request', 'Verify', 'Assign owner', 'Update registry', 'Close'],
  maintenance: ['Request', 'Plan', 'Approve', 'Execute', 'Validate', 'Close'],
  default: ['Intake', 'Match service/org', 'Manager review', 'ERP fan-out', 'Third-party submit', 'Close'],
};

const workflowKeywords = [
  { key: 'incident', match: ['incident', 'incident management', 'incident workflow'] },
  { key: 'service_request', match: ['service request', 'service-request', 'request', 'fulfillment'] },
  { key: 'change', match: ['change', 'change request', 'cab'] },
  { key: 'problem', match: ['problem', 'problem management'] },
  { key: 'asset', match: ['asset', 'inventory', 'registry'] },
  { key: 'maintenance', match: ['maintenance', 'scheduled maintenance', 'planned maintenance'] },
];

export const getWorkflowServiceKey = (ticket = {}) => {
  const candidates = [
    ticket?.workflowKey,
    ticket?.serviceKey,
    ticket?.serviceType,
    ticket?.service,
    ticket?.category,
    ticket?.type,
    ticket?.requestType,
    ticket?.itemType,
  ].map(normalizeText).filter(Boolean);

  for (const candidate of candidates) {
    const matched = workflowKeywords.find(({ match }) => match.some((term) => candidate.includes(term)));
    if (matched) return matched.key;

    if (workflowStagesByService[candidate]) {
      return candidate;
    }
  }

  return 'default';
};

export const getWorkflowStepsForService = (ticket = {}) => {
  const key = getWorkflowServiceKey(ticket);
  return workflowStagesByService[key] || workflowStagesByService.default;
};

export const getWorkflowActiveStepForTicket = (ticket = {}) => {
  const key = getWorkflowServiceKey(ticket);
  const status = normalizeText(ticket?.status);

  const workflowProgressByService = {
    incident: {
      open: 1,
      'in progress': 3,
      pending: 2,
      resolved: 5,
      closed: 5,
    },
    service_request: {
      open: 0,
      pending: 1,
      approved: 2,
      'in progress': 3,
      resolved: 4,
      closed: 4,
    },
    service: {
      open: 0,
      pending: 1,
      approved: 2,
      'in progress': 3,
      resolved: 4,
      closed: 4,
    },
    change: {
      open: 0,
      pending: 1,
      approved: 2,
      'in progress': 3,
      resolved: 5,
      closed: 5,
    },
    problem: {
      open: 0,
      pending: 1,
      'in progress': 2,
      resolved: 4,
      closed: 4,
    },
    asset: {
      open: 0,
      pending: 1,
      'in progress': 2,
      resolved: 4,
      closed: 4,
    },
    maintenance: {
      open: 0,
      pending: 1,
      approved: 2,
      'in progress': 3,
      resolved: 5,
      closed: 5,
    },
    default: {
      open: 1,
      pending: 2,
      approved: 3,
      'in progress': 3,
      resolved: 5,
      closed: 5,
    },
  };

  const serviceMap = workflowProgressByService[key] || workflowProgressByService.default;
  return serviceMap[status] ?? 0;
};

export const workflowStagesByServiceKey = workflowStagesByService;

const workflowCache = {
  loadedAt: 0,
  items: [],
};

const CACHE_TTL_MS = 2 * 60 * 1000;
const WORKFLOW_OVERRIDES_KEY = 'itsm:workflow-overrides';

const pickFirstString = (...values) => values.find((value) => normalizeText(value));

const extractStepsFromWorkflow = (workflow = {}) => {
  const directSteps = workflow?.steps || workflow?.workflowSteps || workflow?.definition?.steps || workflow?.workflowDefinition?.steps;
  if (Array.isArray(directSteps) && directSteps.length > 0) {
    return directSteps
      .map((step) => {
        if (typeof step === 'string') return step.trim();
        return pickFirstString(step?.name, step?.title, step?.label, step?.displayName, step?.type) || '';
      })
      .filter(Boolean);
  }

  const nodes = workflow?.nodes || workflow?.definition?.nodes || workflow?.workflowDefinition?.nodes;
  if (Array.isArray(nodes) && nodes.length > 0) {
    return nodes
      .map((node) => pickFirstString(node?.name, node?.title, node?.label, node?.displayName, node?.type))
      .filter(Boolean)
      .filter((value) => !['start', 'end', 'connector', 'note'].includes(normalizeText(value)));
  }

  return [];
};

const normalizeWorkflowDefinition = (workflow = {}) => ({
  raw: workflow,
  id: workflow?.id ?? workflow?.workflowId ?? workflow?.workflowDefinitionId ?? null,
  name: pickFirstString(workflow?.name, workflow?.workflowName, workflow?.title, workflow?.displayName) || 'Workflow',
  serviceKey: pickFirstString(workflow?.serviceKey, workflow?.service, workflow?.category, workflow?.type) || 'default',
  organizationKey: pickFirstString(workflow?.organizationKey, workflow?.organization, workflow?.department, workflow?.orgUnit, workflow?.organizationUnit) || 'all',
  entityKinds: Array.isArray(workflow?.entityKinds)
    ? workflow.entityKinds.map(normalizeText).filter(Boolean)
    : [pickFirstString(workflow?.entityKind, workflow?.kind, workflow?.type)].filter(Boolean),
  managerFirst: Boolean(workflow?.managerFirst ?? workflow?.definition?.managerFirst ?? workflow?.workflowDefinition?.managerFirst),
  integrationMode: pickFirstString(workflow?.integrationMode, workflow?.definition?.integrationMode, workflow?.workflowDefinition?.integrationMode) || 'local',
  steps: extractStepsFromWorkflow(workflow),
});

const loadWorkflowDefinitions = async () => {
  const now = Date.now();
  if (workflowCache.items.length > 0 && now - workflowCache.loadedAt < CACHE_TTL_MS) {
    return workflowCache.items;
  }

  try {
    const response = await workflowsAPI.getAll();
    const items = Array.isArray(response?.data) ? response.data : Array.isArray(response?.data?.data) ? response.data.data : [];
    workflowCache.items = items.map(normalizeWorkflowDefinition);
    workflowCache.loadedAt = now;
    return workflowCache.items;
  } catch {
    return workflowCache.items;
  }
};

const matchesWorkflow = (workflow, ticket = {}) => {
  const serviceKey = getWorkflowServiceKey(ticket);
  const ticketOrg = normalizeText(ticket?.organizationKey || ticket?.organization || ticket?.department || ticket?.requestedBy?.department || ticket?.assignedTo?.department || 'all');
  const workflowService = normalizeText(workflow?.serviceKey || workflow?.raw?.serviceKey || workflow?.raw?.service || workflow?.raw?.category || workflow?.raw?.type);
  const workflowOrg = normalizeText(workflow?.organizationKey || workflow?.raw?.organizationKey || workflow?.raw?.organization || workflow?.raw?.department || workflow?.raw?.orgUnit || 'all');
  const workflowEntities = Array.isArray(workflow?.entityKinds) ? workflow.entityKinds : [];
  const ticketEntityKind = normalizeText(ticket?.entityKind || ticket?.kind || ticket?.type || 'ticket');

  const serviceMatch = workflowService === 'all' || workflowService === 'default' || workflowService === serviceKey;
  const orgMatch = workflowOrg === 'all' || workflowOrg === 'default' || workflowOrg === ticketOrg;
  const entityMatch = workflowEntities.length === 0 || workflowEntities.includes('all') || workflowEntities.includes(ticketEntityKind);

  return serviceMatch && orgMatch && entityMatch;
};

const scoreWorkflow = (workflow, ticket = {}) => {
  let score = 0;
  const serviceKey = getWorkflowServiceKey(ticket);
  const ticketOrg = normalizeText(ticket?.organizationKey || ticket?.organization || ticket?.department || ticket?.requestedBy?.department || ticket?.assignedTo?.department || 'all');
  const workflowService = normalizeText(workflow?.serviceKey || workflow?.raw?.serviceKey || workflow?.raw?.service || workflow?.raw?.category || workflow?.raw?.type);
  const workflowOrg = normalizeText(workflow?.organizationKey || workflow?.raw?.organizationKey || workflow?.raw?.organization || workflow?.raw?.department || workflow?.raw?.orgUnit || 'all');

  if (workflowService === serviceKey) score += 5;
  else if (workflowService === 'all' || workflowService === 'default') score += 1;

  if (workflowOrg === ticketOrg) score += 4;
  else if (workflowOrg === 'all' || workflowOrg === 'default') score += 1;

  if (workflow?.managerFirst) score += 1;
  if (workflow?.steps?.length) score += workflow.steps.length / 100;
  return score;
};

const inferLastAction = (ticket = {}, workflow = null) => {
  const activityAction = ticket?.activities?.[0]?.action || ticket?.Activities?.[0]?.action;
  if (activityAction) return activityAction;
  if (workflow?.raw?.lastAction) return workflow.raw.lastAction;
  if (ticket?.status) return ticket.status;
  return 'Waiting for next workflow action';
};

const readWorkflowOverrides = () => {
  try {
    const raw = localStorage.getItem(WORKFLOW_OVERRIDES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeWorkflowOverrides = (items) => {
  try {
    localStorage.setItem(WORKFLOW_OVERRIDES_KEY, JSON.stringify(Array.isArray(items) ? items : []));
  } catch {
    // Ignore storage failures; the UI can still fall back to backend workflows.
  }
};

export const getStoredWorkflowOverrides = () => readWorkflowOverrides();

export const saveWorkflowOverride = (override = {}) => {
  const current = readWorkflowOverrides();
  const normalized = normalizeWorkflowDefinition({
    ...override,
    source: 'local-override',
    updatedAt: new Date().toISOString(),
  });

  const next = current.filter((item) => !(
    normalizeText(item?.serviceKey) === normalizeText(normalized.serviceKey) &&
    normalizeText(item?.organizationKey) === normalizeText(normalized.organizationKey) &&
    normalizeText(item?.raw?.entityKind || item?.raw?.kind || item?.raw?.type) === normalizeText(normalized.entityKinds?.[0] || 'ticket')
  ));

  next.unshift({
    ...normalized,
    source: 'local-override',
    updatedAt: new Date().toISOString(),
  });

  writeWorkflowOverrides(next);
  return next[0];
};

export const removeWorkflowOverride = (serviceKey, organizationKey = 'all', entityKind = 'ticket') => {
  const next = readWorkflowOverrides().filter((item) => !(
    normalizeText(item?.serviceKey) === normalizeText(serviceKey) &&
    normalizeText(item?.organizationKey) === normalizeText(organizationKey) &&
    normalizeText(item?.entityKinds?.[0] || item?.raw?.entityKind || item?.raw?.kind || item?.raw?.type) === normalizeText(entityKind)
  ));
  writeWorkflowOverrides(next);
  return next;
};

export const resolveWorkflowPresentationForTicket = async (ticket = {}) => {
  const definitions = await loadWorkflowDefinitions();
  const overrides = readWorkflowOverrides().map(normalizeWorkflowDefinition).map((item) => ({
    ...item,
    source: 'local-override',
  }));
  const matching = [...overrides, ...definitions].filter((workflow) => matchesWorkflow(workflow, ticket));
  const fallbackKey = getWorkflowServiceKey(ticket);
  const fallbackSteps = workflowStagesByService[fallbackKey] || workflowStagesByService.default;
  const selected = matching.sort((a, b) => scoreWorkflow(b, ticket) - scoreWorkflow(a, ticket))[0] || null;
  const steps = selected?.steps?.length ? selected.steps : fallbackSteps;

  return {
    id: selected?.id,
    name: selected?.name || `${fallbackKey} workflow`,
    serviceKey: selected?.serviceKey || fallbackKey,
    organizationKey: selected?.organizationKey || normalizeText(ticket?.organizationKey || ticket?.organization || ticket?.department || ticket?.requestedBy?.department || ticket?.assignedTo?.department || 'all'),
    entityKinds: selected?.entityKinds || ['ticket'],
    managerFirst: selected?.managerFirst ?? false,
    integrationMode: selected?.integrationMode || 'local',
    steps,
    activeStep: selected?.steps?.length ? Math.min(selected.steps.length - 1, getWorkflowActiveStepForTicket(ticket)) : getWorkflowActiveStepForTicket(ticket),
    lastAction: inferLastAction(ticket, selected),
    source: selected?.source || (selected ? 'backend' : 'local'),
  };
};
