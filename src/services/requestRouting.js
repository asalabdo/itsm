import { matchOrganizationUnitLabel } from './organizationUnits';

const normalize = (value) => String(value || '').trim().toLowerCase();

const SERVICE_KEYWORDS = [
  {
    key: 'technical-support',
    label: 'Technical Support',
    department: 'Service Desk',
    matches: ['technical support', 'service desk', 'device', 'email', 'printer', 'network', 'laptop', 'monitor'],
  },
  {
    key: 'access-management',
    label: 'Access Management',
    department: 'Security Operations',
    matches: ['access', 'password', 'mfa', 'vpn', 'permission', 'unlock', 'account'],
  },
  {
    key: 'asset-management',
    label: 'Asset Management',
    department: 'IT Asset Team',
    matches: ['asset', 'register', 'transfer', 'audit', 'dispose', 'inventory'],
  },
  {
    key: 'change-management',
    label: 'Change Management',
    department: 'Change Advisory Board',
    matches: ['change', 'deployment', 'rollback', 'config', 'release'],
  },
  {
    key: 'cyber-security',
    label: 'Cyber Security',
    department: 'Security Team',
    matches: ['security', 'phishing', 'breach', 'vpn', 'usb', 'antivirus', 'suspicious'],
  },
  {
    key: 'hr-services',
    label: 'HR Services',
    department: 'HR Shared Services',
    matches: ['hr', 'leave', 'attendance', 'onboarding', 'employee'],
  },
  {
    key: 'finance-erp',
    label: 'Finance & ERP',
    department: 'Finance Applications',
    matches: ['erp', 'procurement', 'finance', 'reporting', 'data correction', 'data corrections'],
  },
  {
    key: 'facilities',
    label: 'Facilities',
    department: 'Facilities Operations',
    matches: ['facility', 'meeting room', 'car service', 'maintenance', 'phone service'],
  },
  {
    key: 'incident-management',
    label: 'Incident Management',
    department: 'Incident Commander',
    matches: ['incident', 'outage', 'data loss', 'major incident'],
  },
  {
    key: 'knowledge-base',
    label: 'Knowledge Base',
    department: 'Knowledge Team',
    matches: ['knowledge', 'article', 'documentation', 'kb'],
  },
  {
    key: 'service-requests',
    label: 'Service Requests',
    department: 'Fulfillment Team',
    matches: ['request', 'fulfillment', 'workspace', 'equipment', 'software', 'onboarding'],
  },
  {
    key: 'software-licensing',
    label: 'Software Licensing',
    department: 'Software Asset Team',
    matches: ['license', 'licensing', 'renew', 'transfer', 'revoke'],
  },
];

export const inferServiceRouting = (request = {}, departmentDirectory = []) => {
  const candidates = [
    request?.catalogItemName,
    request?.serviceType,
    request?.title,
    request?.category,
    request?.description,
  ].map(normalize).filter(Boolean);

  const match = SERVICE_KEYWORDS.find((entry) =>
    candidates.some((candidate) => entry.matches.some((keyword) => candidate.includes(keyword)))
  );

  const rawDepartment = request?.department ||
    request?.requestedBy?.department ||
    request?.requestedBy?.organizationUnitName ||
    request?.organizationUnitName ||
    request?.organizationUnit?.displayName ||
    match?.department ||
    'General Support';

  return match || {
    key: 'general',
    label: 'General',
    department: matchOrganizationUnitLabel(rawDepartment, departmentDirectory) || rawDepartment,
    matches: [],
  };
};

export const groupRequestsByDepartment = (requests = [], departmentDirectory = []) => {
  const buckets = new Map();

  requests.forEach((request) => {
    const routing = inferServiceRouting(request, departmentDirectory);
    const department = matchOrganizationUnitLabel(
      routing.department || request?.department || request?.requestedBy?.department || request?.requestedBy?.organizationUnitName,
      departmentDirectory
    ) || routing.department || 'General Support';
    if (!buckets.has(department)) {
      buckets.set(department, {
        department,
        services: new Map(),
        total: 0,
        urgent: 0,
        overdue: 0,
        open: 0,
      });
    }

    const bucket = buckets.get(department);
    const serviceName = routing.label || request?.catalogItemName || request?.serviceType || 'General';
    const serviceKey = routing.key || normalize(serviceName);
    const serviceEntry = bucket.services.get(serviceKey) || {
      key: serviceKey,
      name: serviceName,
      count: 0,
      pending: 0,
      assigned: 0,
    };

    bucket.total += 1;
    if (['urgent', 'high', 'critical'].includes(normalize(request?.priority))) {
      bucket.urgent += 1;
    }
    if (!['completed', 'fulfilled', 'closed', 'resolved', 'rejected'].includes(normalize(request?.status))) {
      bucket.open += 1;
    }

    const dueDate = request?.slaDueDate ? new Date(request.slaDueDate) : null;
    if (dueDate && !Number.isNaN(dueDate.getTime()) && dueDate < new Date() && !['completed', 'fulfilled', 'closed', 'resolved', 'rejected'].includes(normalize(request?.status))) {
      bucket.overdue += 1;
    }

    serviceEntry.count += 1;
    if (request?.assignedToId || request?.assignedTo?.id) {
      serviceEntry.assigned += 1;
    } else {
      serviceEntry.pending += 1;
    }
    bucket.services.set(serviceKey, serviceEntry);
  });

  return Array.from(buckets.values())
    .map((bucket) => ({
      ...bucket,
      services: Array.from(bucket.services.values()).sort((a, b) => b.count - a.count),
    }))
    .sort((a, b) => b.total - a.total);
};
