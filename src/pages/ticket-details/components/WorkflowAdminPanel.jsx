import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import {
  getStoredWorkflowOverrides,
  removeWorkflowOverride,
  saveWorkflowOverride,
} from '../../../services/workflowStages';

const serviceOptions = [
  { value: 'incident', label: 'Incident' },
  { value: 'service_request', label: 'Service Request' },
  { value: 'change', label: 'Change' },
  { value: 'problem', label: 'Problem' },
  { value: 'asset', label: 'Asset' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'default', label: 'Default' },
];

const entityKindOptions = [
  { value: 'ticket', label: 'Ticket' },
  { value: 'service_request', label: 'Service Request' },
  { value: 'change_request', label: 'Change Request' },
  { value: 'problem', label: 'Problem' },
  { value: 'asset', label: 'Asset' },
  { value: 'maintenance', label: 'Maintenance' },
];

const WorkflowAdminPanel = ({ ticket, workflowPresentation, onSaved }) => {
  const [serviceKey, setServiceKey] = useState('incident');
  const [organizationKey, setOrganizationKey] = useState('all');
  const [entityKind, setEntityKind] = useState('ticket');
  const [managerFirst, setManagerFirst] = useState(false);
  const [integrationMode, setIntegrationMode] = useState('local');
  const [stepsText, setStepsText] = useState('');
  const [message, setMessage] = useState('');

  const currentWorkflow = useMemo(() => workflowPresentation || null, [workflowPresentation]);

  useEffect(() => {
    const inferredService = currentWorkflow?.serviceKey || 'incident';
    const inferredOrg = currentWorkflow?.organizationKey || ticket?.assignedTo?.department || ticket?.requestedBy?.department || 'all';
    const inferredEntity = currentWorkflow?.entityKinds?.[0] || 'ticket';
    setServiceKey(inferredService);
    setOrganizationKey(inferredOrg);
    setEntityKind(inferredEntity);
    setManagerFirst(Boolean(currentWorkflow?.managerFirst));
    setIntegrationMode(currentWorkflow?.integrationMode || 'local');
    setStepsText((currentWorkflow?.steps || []).join('\n'));
  }, [currentWorkflow, ticket]);

  const handleSave = () => {
    const steps = stepsText
      .split('\n')
      .map((step) => String(step || '').trim())
      .filter(Boolean);

    if (steps.length === 0) {
      setMessage('Add at least one workflow stage.');
      return;
    }

    saveWorkflowOverride({
      serviceKey,
      organizationKey,
      entityKinds: [entityKind],
      managerFirst,
      integrationMode,
      steps,
      name: `${serviceKey} workflow`,
    });

    setMessage('Workflow override saved.');
    onSaved?.();
  };

  const handleReset = () => {
    removeWorkflowOverride(serviceKey, organizationKey, entityKind);
    setMessage('Local override removed.');
    onSaved?.();
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Settings2" size={16} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Edit Workflow Stages</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Update the service workflow for this ticket context. Changes are saved as a local override and apply immediately in the ticket views.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-xs font-semibold">
          <Icon name="ShieldCheck" size={14} />
          Local override
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Select
          label="Service"
          value={serviceKey}
          onChange={setServiceKey}
          options={serviceOptions}
        />
        <Input
          label="Organization"
          value={organizationKey}
          onChange={(e) => setOrganizationKey(e.target.value)}
          placeholder="all"
        />
        <Select
          label="Entity Kind"
          value={entityKind}
          onChange={setEntityKind}
          options={entityKindOptions}
        />
        <div className="flex items-end gap-3">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={managerFirst}
              onChange={(e) => setManagerFirst(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Manager first
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={integrationMode !== 'local'}
              onChange={(e) => setIntegrationMode(e.target.checked ? 'third-party' : 'local')}
              className="h-4 w-4 rounded border-border"
            />
            Third-party sync
          </label>
        </div>
      </div>

      <div className="mt-4">
        <Input
          label="Workflow Stages"
          multiline
          rows={7}
          value={stepsText}
          onChange={(e) => setStepsText(e.target.value)}
          description="One stage per line. Example: Intake, Approval, ERP fan-out, Close."
        />
      </div>

      {message && (
        <div className="mt-4 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-foreground">
          {message}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <Button variant="default" iconName="Save" iconPosition="left" onClick={handleSave}>
          Save workflow
        </Button>
        <Button variant="outline" iconName="RotateCcw" iconPosition="left" onClick={handleReset}>
          Reset override
        </Button>
      </div>
    </section>
  );
};

export default WorkflowAdminPanel;
