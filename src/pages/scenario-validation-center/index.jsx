import React, { useMemo, useState } from 'react';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const scenarioGroups = [
  {
    title: 'Security And Access',
    scenarios: [
      { id: 1, name: 'Disable User', expected: 'Inactive users cannot login or create tickets.', page: '/user-management' },
      { id: 38, name: 'Unauthorized Access', expected: 'Users cannot view tickets from other departments.', page: '/ticket-management-center' },
      { id: 39, name: 'SQL Injection Test', expected: 'Unsafe input is rejected and sanitized.', page: null },
      { id: 40, name: 'Session Timeout', expected: 'Users are logged out after inactivity.', page: '/settings' }
    ]
  },
  {
    title: 'Ticket Management',
    scenarios: [
      { id: 5, name: 'Create Ticket', expected: 'Ticket created with ticket number, status Open, created at, requester.', page: '/ticket-creation' },
      { id: 6, name: 'Auto Ticket Number Generation', expected: 'System generates TCK-000001 style numbers.', page: '/ticket-management-center' },
      { id: 7, name: 'Assign Ticket', expected: 'AssignedToId updates and activity is logged.', page: '/ticket-details' },
      { id: 8, name: 'Add Ticket Comment', expected: 'TicketComments row is inserted.', page: '/ticket-details' },
      { id: 9, name: 'Attach File', expected: 'TicketAttachments row is inserted.', page: '/ticket-details' },
      { id: 10, name: 'Resolve Ticket', expected: 'ResolvedAt and ResolutionNotes are populated.', page: '/ticket-details' },
      { id: 11, name: 'SLA Breach', expected: 'SlaStatus becomes Breached when overdue.', page: '/ticket-sla' },
      { id: 12, name: 'Reopen Ticket', expected: 'Resolved tickets can be reopened to Open.', page: '/ticket-details' },
      { id: 44, name: 'Ticket -> Approval -> Workflow', expected: 'Ticket creation can trigger approvals and workflows.', page: '/ticket-management-center' },
      { id: 45, name: 'Ticket -> Asset Link', expected: 'Ticket can reference an AssetId.', page: '/ticket-details' },
      { id: 47, name: 'Missing Required Fields', expected: 'Validation errors are shown before submit.', page: '/ticket-creation' },
      { id: 48, name: 'Invalid Email Format', expected: 'Invalid user emails are rejected.', page: '/user-management' },
      { id: 54, name: 'VIP Ticket', expected: 'Critical priority gets immediate assignment and short SLA.', page: '/it-operations-command-center' },
      { id: 56, name: 'Bulk Ticket Import', expected: 'Large ticket imports remain responsive.', page: '/ticket-management-center' },
      { id: 58, name: 'Ticket Reassignment', expected: 'Reassignment activity is logged.', page: '/ticket-details' }
    ]
  },
  {
    title: 'Service Requests',
    scenarios: [
      { id: 13, name: 'Create Service Request', expected: 'Record created in ServiceRequests.', page: '/service-request-management' },
      { id: 14, name: 'Assign Request', expected: 'AssignedToId updates.', page: '/fulfillment-center' },
      { id: 15, name: 'Complete Request', expected: 'CompletionDate is populated.', page: '/fulfillment-center' },
      { id: 16, name: 'Estimated vs Actual Hours', expected: 'ActualHours stays aligned with EstimatedHours.', page: '/service-request-management' }
    ]
  },
  {
    title: 'Asset Management',
    scenarios: [
      { id: 17, name: 'Create Asset', expected: 'Record created in Assets.', page: '/manage-assets' },
      { id: 18, name: 'Assign Asset to User', expected: 'OwnerId updates and AssetHistories log is created.', page: '/asset-registry-and-tracking' },
      { id: 19, name: 'Change Asset Status', expected: 'AssetHistories log is created.', page: '/asset-registry-and-tracking' },
      { id: 20, name: 'Decommission Asset', expected: 'DecommissionDate populated and status Retired.', page: '/asset-registry-and-tracking' },
      { id: 46, name: 'Change Request -> Workflow', expected: 'Workflow is triggered automatically.', page: '/change-management-dashboard' }
    ]
  },
  {
    title: 'Change Management',
    scenarios: [
      { id: 21, name: 'Create Change Request', expected: 'Record created in ChangeRequests.', page: '/change-management' },
      { id: 22, name: 'Approve Change', expected: 'ApprovedById populated and status Approved.', page: '/change-management-dashboard' },
      { id: 23, name: 'Schedule Change', expected: 'ScheduledStartDate is set.', page: '/change-management' },
      { id: 24, name: 'Reject Change', expected: 'Status becomes Rejected.', page: '/change-management-dashboard' },
      { id: 25, name: 'Emergency Change', expected: 'RiskLevel becomes High.', page: '/change-management-dashboard' },
      { id: 49, name: 'Past Due Date', expected: 'System warns the user.', page: '/change-management' }
    ]
  },
  {
    title: 'Approval Workflow',
    scenarios: [
      { id: 26, name: 'Submit Approval Request', expected: 'ApprovalItems row created.', page: '/approval-queue-manager' },
      { id: 27, name: 'Approve Item', expected: 'Status becomes Approved and ResolvedAt is populated.', page: '/approval-queue-manager' },
      { id: 28, name: 'Reject Item', expected: 'Status becomes Rejected.', page: '/approval-queue-manager' }
    ]
  },
  {
    title: 'Workflow Engine',
    scenarios: [
      { id: 29, name: 'Trigger Workflow', expected: 'WorkflowInstances row created.', page: '/workflow-builder' },
      { id: 30, name: 'Execute Workflow Step', expected: 'WorkflowInstanceSteps row created.', page: '/workflow-builder-studio' },
      { id: 31, name: 'Complete Workflow', expected: 'CompletedAt populated.', page: '/workflow-builder' }
    ]
  },
  {
    title: 'Automation Rules',
    scenarios: [
      { id: 32, name: 'Auto Assign Ticket', expected: 'Rule execution logs are created.', page: '/automation-rules' },
      { id: 33, name: 'Failed Automation', expected: 'Success is false and ErrorMessage is populated.', page: '/automation-rules' }
    ]
  },
  {
    title: 'Audit And Reporting',
    scenarios: [
      { id: 34, name: 'Update Ticket', expected: 'AuditLogs row created.', page: '/audit-trail-and-compliance-viewer' },
      { id: 35, name: 'Delete Asset', expected: 'Audit log created.', page: '/audit-trail-and-compliance-viewer' },
      { id: 36, name: 'Generate Dashboard Metrics', expected: 'DashboardMetrics row inserted.', page: '/reporting-and-analytics-hub' },
      { id: 37, name: 'Performance Trend Calculation', expected: 'Trend values calculate up or down.', page: '/service-performance-analytics' },
      { id: 55, name: 'Major Incident', expected: 'Multiple tickets linked and incident workflow triggered.', page: '/incident-management-workflow' }
    ]
  },
  {
    title: 'Security And Reliability',
    scenarios: [
      { id: 41, name: 'Create 10,000 Tickets', expected: 'System remains responsive.', page: null },
      { id: 42, name: 'Concurrent Users', expected: '100 users can create tickets simultaneously.', page: null },
      { id: 43, name: 'Large Attachment Upload', expected: '100MB file upload is accepted.', page: '/ticket-details' },
      { id: 50, name: 'System Crash Recovery', expected: 'No data loss on recovery.', page: null }
    ]
  },
  {
    title: 'Database Validation',
    scenarios: [
      { id: 51, name: 'Foreign Key Validation', expected: 'TicketComments require a valid TicketId.', page: null },
      { id: 52, name: 'Cascade Delete', expected: 'Deleting a ticket removes related comments, activities, and attachments.', page: null },
      { id: 53, name: 'Data Integrity', expected: 'No orphan records remain.', page: null }
    ]
  },
  {
    title: 'Real World Operations',
    scenarios: [
      { id: 57, name: 'SLA Escalation', expected: 'Manager notified before SLA breach.', page: '/it-operations-command-center' }
    ]
  }
];

const ScenarioValidationCenter = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const flatScenarios = useMemo(() => scenarioGroups.flatMap((group) =>
    group.scenarios.map((scenario) => ({ ...scenario, group: group.title }))
  ), []);

  const filteredGroups = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return scenarioGroups;

    return scenarioGroups
      .map((group) => ({
        ...group,
        scenarios: group.scenarios.filter((scenario) =>
          [scenario.id, scenario.name, scenario.expected, group.title]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(search))
        )
      }))
      .filter((group) => group.scenarios.length > 0);
  }, [query]);

  const summary = useMemo(() => {
    const total = flatScenarios.length;
    const withPages = flatScenarios.filter((scenario) => scenario.page).length;
    const backendOnly = total - withPages;
    return { total, withPages, backendOnly };
  }, [flatScenarios]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BreadcrumbTrail />
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2">
              Scenario Validation Center
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Central checklist for the ITSM scenarios, with direct links to existing pages and backend-only validation items.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/user-management')}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Open Core Pages
            </button>
            <button
              type="button"
              onClick={() => navigate('/ticket-management-center')}
              className="px-4 py-2 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors text-sm font-medium"
            >
              Ticket Center
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1">
            <div className="text-sm text-muted-foreground">Total Scenarios</div>
            <div className="text-3xl font-semibold text-foreground mt-2">{summary.total}</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1">
            <div className="text-sm text-muted-foreground">Mapped To Pages</div>
            <div className="text-3xl font-semibold text-success mt-2">{summary.withPages}</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1">
            <div className="text-sm text-muted-foreground">Backend Only</div>
            <div className="text-3xl font-semibold text-warning mt-2">{summary.backendOnly}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 md:p-5 shadow-elevation-1">
          <label className="block text-sm font-medium text-foreground mb-2">Search scenarios</label>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by scenario number, name, module, or expected result..."
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <section key={group.title} className="rounded-2xl border border-border bg-card shadow-elevation-1 overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{group.title}</h2>
                  <p className="text-sm text-muted-foreground">{group.scenarios.length} scenarios</p>
                </div>
                <Icon name="ClipboardCheck" size={20} className="text-muted-foreground" />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-5">
                {group.scenarios.map((scenario) => (
                  <div key={scenario.id} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Scenario {scenario.id}
                        </div>
                        <h3 className="text-base font-semibold text-foreground mt-1">{scenario.name}</h3>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${scenario.page ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {scenario.page ? 'Page exists' : 'Backend only'}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{scenario.expected}</p>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Module:</span> {scenario.group}
                      </div>
                      {scenario.page ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(scenario.page)}
                        >
                          Open Page
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">No dedicated screen required</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ScenarioValidationCenter;
