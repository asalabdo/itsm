import React from 'react';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';

const coreFields = [
  'TicketID',
  'Title',
  'Description',
  'Category',
  'Subcategory',
  'Priority',
  'Impact',
  'Urgency',
  'Status',
  'AssignedGroup',
  'AssignedAgent',
  'SLA',
  'DueDate',
  'Requester',
  'CreatedDate',
  'ClosedDate'
];

const lifecycle = ['New', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Closed', 'Reopened'];
const ticketTypes = ['Incident', 'Service Request', 'Problem', 'Change', 'Task', 'Approval', 'Alert'];

const moduleCards = [
  {
    title: 'Service Desk / Ticketing',
    icon: 'Ticket',
    tone: 'bg-blue-50 text-blue-700 border-blue-200',
    summary: 'Every interaction becomes a governed ticket with classification, routing, SLA, assignment, history, and audit controls.',
    responsibilities: ['Receive requests from users', 'Assign priority and route to teams', 'Track lifecycle, ownership, and SLA timers']
  },
  {
    title: 'Incident Management',
    icon: 'Siren',
    tone: 'bg-red-50 text-red-700 border-red-200',
    summary: 'Restores service quickly when an outage or interruption occurs and keeps the response coordinated.',
    responsibilities: ['Log incident tickets', 'Assign recovery teams', 'Feed fixes back into knowledge']
  },
  {
    title: 'Service Requests',
    icon: 'ClipboardList',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    summary: 'Handles planned requests such as laptops, VPN access, software installation, and account setup.',
    responsibilities: ['Serve a catalog', 'Run approvals', 'Trigger fulfillment and asset updates']
  },
  {
    title: 'Problem Management',
    icon: 'SearchCheck',
    tone: 'bg-amber-50 text-amber-700 border-amber-200',
    summary: 'Finds root causes behind recurring incidents so the same service interruptions stop repeating.',
    responsibilities: ['Analyze recurring incidents', 'Create known errors', 'Define permanent fixes']
  },
  {
    title: 'Change Management',
    icon: 'GitPullRequest',
    tone: 'bg-violet-50 text-violet-700 border-violet-200',
    summary: 'Controls production changes through risk review, approval, scheduling, implementation, and impact tracking.',
    responsibilities: ['Submit and assess change requests', 'Manage approvals and schedules', 'Protect service continuity']
  },
  {
    title: 'CMDB / Configuration',
    icon: 'Network',
    tone: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    summary: 'Maps services to servers, applications, databases, cloud resources, and dependencies for impact analysis.',
    responsibilities: ['Store configuration items', 'Model dependencies', 'Link tickets to affected CIs']
  },
  {
    title: 'Asset Management',
    icon: 'Package',
    tone: 'bg-orange-50 text-orange-700 border-orange-200',
    summary: 'Tracks physical and digital assets across ownership, warranty, lifecycle, cost, and location.',
    responsibilities: ['Track ownership and lifecycle', 'Support fulfillment workflows', 'Keep operational inventory accurate']
  },
  {
    title: 'Knowledge Base',
    icon: 'BookOpen',
    tone: 'bg-lime-50 text-lime-700 border-lime-200',
    summary: 'Stores FAQs, fixes, workarounds, and resolution articles that speed up support and self-service.',
    responsibilities: ['Suggest solutions to tickets', 'Capture resolved learnings', 'Support standard procedures']
  },
  {
    title: 'SLA Management',
    icon: 'Clock3',
    tone: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    summary: 'Measures response and resolution obligations and escalates when risk or breach thresholds are hit.',
    responsibilities: ['Start timers on creation', 'Track response and resolution', 'Trigger escalations automatically']
  },
  {
    title: 'Monitoring & Events',
    icon: 'Activity',
    tone: 'bg-slate-100 text-slate-700 border-slate-300',
    summary: 'Turns server, application, network, and cloud alerts into actionable incident records automatically.',
    responsibilities: ['Ingest monitoring alerts', 'Create incident tickets', 'Notify responders and leaders']
  }
];

const flowSteps = [
  'Monitoring detects server failure',
  'Incident ticket is created automatically',
  'Ticket is routed to the support team',
  'Support investigates and restores service',
  'Recurring pattern is promoted to a problem record',
  'A change request is raised for the permanent fix',
  'Implementation is executed with approval and rollback planning',
  'Ticket is resolved and closed',
  'Knowledge article is published for future reuse'
];

const dataModelGroups = [
  { title: 'Ticket Core', items: ['Ticket', 'TicketStatus', 'TicketPriority', 'TicketCategory', 'TicketAssignment'] },
  { title: 'Collaboration', items: ['TicketComment', 'TicketAttachment', 'TicketHistory', 'Approvals', 'Tasks'] },
  { title: 'Control Plane', items: ['TicketSLA', 'TicketWorkflow', 'Audit Log', 'Automation Rules', 'Escalation Rules'] },
  { title: 'Relationships', items: ['Parent Ticket', 'Child Ticket', 'Linked Ticket', 'Duplicate Ticket', 'Major Incident'] }
];

const advancedFeatures = [
  'Auto categorization from rules, AI, or keywords',
  'Priority calculation from impact and urgency',
  'Skill, department, location, and system based intelligent routing',
  'Major incident timeline and leadership notification workflow',
  'Queue management for network, security, application, and infrastructure teams',
  'Full audit trail for compliance and security review'
];

const ServiceDeskBlueprint = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BreadcrumbTrail />
      <main className="pt-16">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <section className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 text-white shadow-2xl">
            <div className="grid gap-8 px-8 py-10 lg:grid-cols-[1.4fr_0.9fr]">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-medium">
                  <Icon name="Layers3" size={16} />
                  Enterprise ITSM Blueprint
                </div>
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight">Service desk operations mapped around a single ticketing engine</h1>
                <p className="mt-4 max-w-3xl text-sm text-slate-200 sm:text-base">
                  This page reviews the current ITSM application against the operating model you outlined and shows the
                  full lifecycle from monitoring alert through incident, problem, change, fulfillment, SLA governance,
                  CMDB impact, and knowledge capture.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <div className="text-3xl font-semibold">10</div>
                    <div className="mt-1 text-sm text-slate-200">Core ITSM modules aligned</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <div className="text-3xl font-semibold">7</div>
                    <div className="mt-1 text-sm text-slate-200">Ticket lifecycle states tracked</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <div className="text-3xl font-semibold">6</div>
                    <div className="mt-1 text-sm text-slate-200">Enterprise automation controls highlighted</div>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
                <h2 className="text-lg font-semibold">Critical incident SLA example</h2>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-cyan-200">Response</div>
                    <div className="mt-2 text-3xl font-semibold">15 min</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-cyan-200">Resolution</div>
                    <div className="mt-2 text-3xl font-semibold">2 hours</div>
                  </div>
                  <div className="rounded-2xl bg-cyan-400/10 p-4 text-sm text-slate-100">
                    IF priority is critical, THEN notify manager, escalate, create incident bridge, and start the SLA timer immediately.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <div className="mb-5 flex items-center gap-3">
              <Icon name="Blocks" size={20} className="text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Module coverage</h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {moduleCards.map((module) => (
                <article key={module.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-2xl border px-3 py-3 ${module.tone}`}>
                      <Icon name={module.icon} size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-foreground">{module.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.summary}</p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {module.responsibilities.map((item) => (
                      <div key={item} className="rounded-2xl bg-muted/50 p-3 text-sm text-foreground">
                        {item}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-10 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Icon name="Workflow" size={20} className="text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">End-to-end logical flow</h2>
              </div>
              <div className="mt-6 grid gap-4">
                {flowSteps.map((step, index) => (
                  <div key={step} className="flex items-start gap-4 rounded-2xl border border-border/70 bg-background p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-sm text-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <Icon name="Rows3" size={20} className="text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Ticket lifecycle</h2>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  {lifecycle.map((state) => (
                    <span key={state} className="rounded-full border border-border bg-muted px-4 py-2 text-sm text-foreground">
                      {state}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <Icon name="Tags" size={20} className="text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Ticket types</h2>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {ticketTypes.map((type) => (
                    <div key={type} className="rounded-2xl bg-muted/60 px-4 py-3 text-sm text-foreground">
                      {type}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Icon name="Database" size={20} className="text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Core ticket fields</h2>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {coreFields.map((field) => (
                  <div key={field} className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground">
                    {field}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Icon name="Cpu" size={20} className="text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Advanced controls</h2>
              </div>
              <div className="mt-6 space-y-3">
                {advancedFeatures.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 rounded-2xl bg-muted/50 p-4">
                    <Icon name="CheckCheck" size={16} className="mt-0.5 text-emerald-600" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Icon name="GitBranchPlus" size={20} className="text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Enterprise data model</h2>
            </div>
            <div className="mt-6 grid gap-5 lg:grid-cols-4">
              {dataModelGroups.map((group) => (
                <div key={group.title} className="rounded-3xl border border-border/70 bg-background p-5">
                  <h3 className="text-base font-semibold text-foreground">{group.title}</h3>
                  <div className="mt-4 space-y-2">
                    {group.items.map((item) => (
                      <div key={item} className="rounded-2xl bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ServiceDeskBlueprint;
