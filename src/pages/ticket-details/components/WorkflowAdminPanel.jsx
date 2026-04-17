import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';
import {
  getStoredWorkflowOverrides,
  removeWorkflowOverride,
  saveWorkflowOverride,
} from '../../../services/workflowStages';

const WorkflowAdminPanel = ({ ticket, workflowPresentation, onSaved }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);

  const serviceOptions = [
    { value: 'incident', label: t('incident', 'Incident') },
    { value: 'service_request', label: t('serviceRequest', 'Service Request') },
    { value: 'change', label: t('change', 'Change') },
    { value: 'problem', label: t('problem', 'Problem') },
    { value: 'asset', label: t('asset', 'Asset') },
    { value: 'maintenance', label: t('maintenance', 'Maintenance') },
    { value: 'default', label: t('default', 'Default') },
  ];

  const entityKindOptions = [
    { value: 'ticket', label: t('ticket', 'Ticket') },
    { value: 'service_request', label: t('serviceRequest', 'Service Request') },
    { value: 'change_request', label: t('changeRequest', 'Change Request') },
    { value: 'problem', label: t('problem', 'Problem') },
    { value: 'asset', label: t('asset', 'Asset') },
    { value: 'maintenance', label: t('maintenance', 'Maintenance') },
  ];
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
      setMessage(t('addAtLeastOneWorkflowStage', 'Add at least one workflow stage.'));
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

    setMessage(t('workflowOverrideSaved', 'Workflow override saved.'));
    onSaved?.();
  };

  const handleReset = () => {
    removeWorkflowOverride(serviceKey, organizationKey, entityKind);
    setMessage(t('localOverrideRemoved', 'Local override removed.'));
    onSaved?.();
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Settings2" size={16} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">{t('editWorkflowStages', 'Edit Workflow Stages')}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('updateServiceWorkflow', 'Update the service workflow for this ticket context. Changes are saved as a local override and apply immediately in the ticket views.')}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-xs font-semibold">
          <Icon name="ShieldCheck" size={14} />
          {t('localOverride', 'Local override')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Select
          label={t('service', 'Service')}
          value={serviceKey}
          onChange={setServiceKey}
          options={serviceOptions}
        />
        <Input
          label={t('organization', 'Organization')}
          value={organizationKey}
          onChange={(e) => setOrganizationKey(e.target.value)}
          placeholder="all"
        />
        <Select
          label={t('entityKind', 'Entity Kind')}
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
            {t('managerFirst', 'Manager first')}
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={integrationMode !== 'local'}
              onChange={(e) => setIntegrationMode(e.target.checked ? 'third-party' : 'local')}
              className="h-4 w-4 rounded border-border"
            />
            {t('thirdPartySync', 'Third-party sync')}
          </label>
        </div>
      </div>

      <div className="mt-4">
        <Input
          label={t('workflowStages', 'Workflow Stages')}
          multiline
          rows={7}
          value={stepsText}
          onChange={(e) => setStepsText(e.target.value)}
          description={t('workflowStagesDescription', 'One stage per line. Example: Intake, Approval, ERP fan-out, Close.')}
        />
      </div>

      {message && (
        <div className="mt-4 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-foreground">
          {message}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <Button variant="default" iconName="Save" iconPosition="left" onClick={handleSave}>
          {t('saveWorkflow', 'Save workflow')}
        </Button>
        <Button variant="outline" iconName="RotateCcw" iconPosition="left" onClick={handleReset}>
          {t('resetOverride', 'Reset override')}
        </Button>
      </div>
    </section>
  );
};

export default WorkflowAdminPanel;
