import { matchOrganizationUnitLabel } from './organizationUnits';

const normalize = (value) => String(value || '').trim().toLowerCase();

export const inferTicketDepartment = (ticket = {}, departmentDirectory = []) => {
  const candidates = [
    ticket?.category,
    ticket?.department,
    ticket?.title,
    ticket?.description,
  ].map(normalize).filter(Boolean);

  const matches = [
    { department: 'Service Desk', keywords: ['technical support', 'email', 'printer', 'network', 'device', 'hardware'] },
    { department: 'Security Operations', keywords: ['access', 'password', 'vpn', 'mfa', 'security', 'unlock'] },
    { department: 'IT Asset Team', keywords: ['asset', 'laptop', 'inventory', 'audit', 'transfer'] },
    { department: 'Change Advisory Board', keywords: ['change', 'release', 'deployment', 'rollback'] },
    { department: 'HR Shared Services', keywords: ['hr', 'leave', 'attendance', 'onboarding'] },
    { department: 'Finance Applications', keywords: ['finance', 'erp', 'procurement', 'reporting', 'data'] },
    { department: 'Facilities Operations', keywords: ['facility', 'meeting room', 'maintenance', 'phone'] },
    { department: 'Incident Commander', keywords: ['incident', 'outage', 'major incident', 'data loss'] },
    { department: 'Knowledge Team', keywords: ['knowledge', 'article', 'documentation'] },
  ];

  const match = matches.find((entry) =>
    candidates.some((candidate) => entry.keywords.some((keyword) => candidate.includes(keyword)))
  );

  const rawDepartment =
    ticket?.department ||
    ticket?.requestedBy?.department ||
    ticket?.requestedBy?.organizationUnitName ||
    ticket?.organizationUnitName ||
    ticket?.organizationUnit?.displayName ||
    ticket?.category ||
    'General Support';

  return matchOrganizationUnitLabel(match?.department || rawDepartment, departmentDirectory) || rawDepartment;
};

export const groupTicketsByDepartment = (tickets = [], departmentDirectory = []) => {
  const buckets = new Map();

  tickets.forEach((ticket) => {
    const department = inferTicketDepartment(ticket, departmentDirectory);
    if (!buckets.has(department)) {
      buckets.set(department, {
        department,
        tickets: [],
        total: 0,
        open: 0,
        overdue: 0,
        critical: 0,
      });
    }

    const bucket = buckets.get(department);
    const status = normalize(ticket?.status);
    bucket.total += 1;
    if (!['resolved', 'closed'].includes(status)) bucket.open += 1;
    if (['critical', 'high'].includes(normalize(ticket?.priority))) bucket.critical += 1;
    if (ticket?.slaHours != null && Number(ticket.slaHours) < 0) bucket.overdue += 1;
    bucket.tickets.push(ticket);
  });

  return Array.from(buckets.values()).sort((a, b) => b.total - a.total);
};
