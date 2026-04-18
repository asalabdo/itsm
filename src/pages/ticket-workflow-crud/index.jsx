import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import DashboardCard from '../../components/ui/DashboardCard';
import Icon from '../../components/AppIcon';
import { getStoredWorkflowOverrides } from '../../services/workflowStages';

const TicketWorkflowCrud = () => {
  const workflowOverrides = useMemo(() => getStoredWorkflowOverrides(), []);

  const quickLinks = [
    { label: 'Open workflow list', path: '/manage/ticket_workflow', icon: 'List' },
    { label: 'Create workflow', path: '/manage/ticket_workflow/new', icon: 'Plus' },
    { label: 'Edit workflow', path: '/manage/ticket_workflow/edit/1', icon: 'Pencil' },
    { label: 'Delete workflow', path: '/manage/ticket_workflow', icon: 'Trash2' },
    { label: 'Open workflow builder', path: '/workflow-builder-studio', icon: 'GitBranch' },
    { label: 'See ticket workflow', path: '/ticket-details/4521', icon: 'Workflow' },
  ];

  return (
    <>
      <Helmet>
        <title>Ticket Workflow CRUD</title>
        <meta
          name="description"
          content="Manage ticket workflow definitions with create, read, update, and delete links."
        />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <BreadcrumbTrail />
        <main className="pt-16">
          <div className="px-4 md:px-6 lg:px-8 py-6 space-y-6">
            <section className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-muted-foreground">
                    Workflow Admin
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    Ticket Workflow CRUD
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground max-w-3xl">
                    Use this page to jump into list, create, edit, and delete routes for ticket workflow definitions.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="default" iconName="GitBranch" iconPosition="left">
                    <Link to="/workflow-builder-studio">Open builder</Link>
                  </Button>
                  <Button asChild variant="outline" iconName="Workflow" iconPosition="left">
                    <Link to="/ticket-details/4521">Preview ticket workflow</Link>
                  </Button>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DashboardCard title="Saved Overrides" value={String(workflowOverrides.length)} subtitle="Local workflow edits stored in this browser">
                <Icon name="Database" size={20} className="text-primary" />
              </DashboardCard>
              <DashboardCard title="CRUD Routes" value="4" subtitle="List, create, edit, delete links">
                <Icon name="FolderKanban" size={20} className="text-primary" />
              </DashboardCard>
              <DashboardCard title="Design View" value="Studio" subtitle="Use the workflow builder for full edits">
                <Icon name="GitBranch" size={20} className="text-primary" />
              </DashboardCard>
            </div>

            <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">CRUD links</h2>
                  <p className="text-sm text-muted-foreground">
                    These routes map to the generic CRUD page and the workflow editor.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {quickLinks.map((item, index) => (
                  <Link
                    key={`${item.path}-${item.label}-${index}`}
                    to={item.path}
                    className="group rounded-2xl border border-border bg-background p-4 hover:border-primary hover:shadow-sm transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <Icon name={item.icon} size={20} />
                        </div>
                        <h3 className="font-semibold text-foreground">{item.label}</h3>
                        <p className="text-xs text-muted-foreground break-all">{item.path}</p>
                      </div>
                      <Icon name="ArrowUpRight" size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">Current local overrides</h2>
              {workflowOverrides.length === 0 ? (
                <p className="text-sm text-muted-foreground">No local workflow overrides have been saved yet.</p>
              ) : (
                <div className="space-y-3">
                  {workflowOverrides.map((workflow) => (
                    <div key={`${workflow.serviceKey}-${workflow.organizationKey}-${workflow.id || workflow.name}`} className="rounded-xl border border-border bg-muted/20 p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{workflow.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {workflow.serviceKey} • {workflow.organizationKey} • {workflow.entityKinds?.join(', ') || 'ticket'}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {workflow.steps?.length || 0} stages
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default TicketWorkflowCrud;
