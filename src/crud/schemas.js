// Lightweight schema definitions for the CRUD generator
const schemas = {
  users: {
    label: 'Users',
    fields: [
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'full_name', label: 'Full name', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'role', label: 'Role', type: 'select', options: ['technician', 'requester', 'manager'] },
      { key: 'teams', label: 'Teams', type: 'multiselect', relation: 'teams' }
    ]
  },
  teams: {
    label: 'Teams',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'members', label: 'Members', type: 'multiselect', relation: 'users' }
    ]
  },
  services: {
    label: 'Services',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' }
    ]
  },
  categories: {
    label: 'Categories',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true }
    ]
  },
  priorities: {
    label: 'Priorities',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'target_hours', label: 'Target (hours)', type: 'number' }
    ]
  },
  sla_policies: {
    label: 'SLA Policies',
    fields: [
      { key: 'service', label: 'Service', type: 'select', relation: 'services' },
      { key: 'priority', label: 'Priority', type: 'select', relation: 'priorities' },
      { key: 'target_hours', label: 'Target (hours)', type: 'number' }
    ]
  },
  tickets: {
    label: 'Tickets',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'requester_id', label: 'Requester', type: 'select', relation: 'users' },
      { key: 'assignee_id', label: 'Assignee', type: 'select', relation: 'users' },
      { key: 'team_id', label: 'Team', type: 'select', relation: 'teams' },
      { key: 'service_id', label: 'Service', type: 'select', relation: 'services' },
      { key: 'category_id', label: 'Category', type: 'select', relation: 'categories' },
      { key: 'priority_id', label: 'Priority', type: 'select', relation: 'priorities' },
      { key: 'status', label: 'Status', type: 'select', options: ['new','open','pending','resolved','closed'] },
      { key: 'custom_fields', label: 'Custom Fields', type: 'json' }
    ]
  },
  ticket_history: {
    label: 'Ticket History',
    fields: [
      { key: 'ticket_id', label: 'Ticket', type: 'select', relation: 'tickets' },
      { key: 'event', label: 'Event', type: 'text' },
      { key: 'metadata', label: 'Metadata', type: 'json' }
    ]
  },
  ticket_comments: {
    label: 'Ticket Comments',
    fields: [
      { key: 'ticket_id', label: 'Ticket', type: 'select', relation: 'tickets' },
      { key: 'author_id', label: 'Author', type: 'select', relation: 'users' },
      { key: 'body', label: 'Comment', type: 'textarea' }
    ]
  },
  ticket_attachments: {
    label: 'Ticket Attachments',
    fields: [
      { key: 'ticket_id', label: 'Ticket', type: 'select', relation: 'tickets' },
      { key: 'filename', label: 'Filename', type: 'text' },
      { key: 'url', label: 'URL', type: 'text' }
    ]
  },
  ticket_sla: {
    label: 'Ticket SLA',
    fields: [
      { key: 'ticket_id', label: 'Ticket', type: 'select', relation: 'tickets' },
      { key: 'status', label: 'Status', type: 'select', options: ['on_time','at_risk','breached'] },
      { key: 'breach_at', label: 'Breach At', type: 'datetime' }
    ]
  },
  escalations: {
    label: 'Escalations',
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'rule', label: 'Rule', type: 'text' }
    ]
  },
  assets: {
    label: 'Assets',
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'serial', label: 'Serial', type: 'text' },
      { key: 'department', label: 'Department', type: 'text' }
    ]
  },
  changes: {
    label: 'Changes',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['planned','in_progress','completed','failed'] }
    ]
  }
};

export default schemas;
