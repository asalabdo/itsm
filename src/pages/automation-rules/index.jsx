import React, { useEffect, useState } from 'react';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import automationService from '../../services/automationService';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const emptyForm = {
  name: '',
  description: '',
  targetEntity: 'Ticket',
  triggerEvent: 'Created',
  conditionsJson: '{"all": []}',
  actionsJson: '[]',
  isActive: true,
};

const AutomationManagement = () => {
  const [rules, setRules] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);

  const targetOptions = [
    { value: 'Ticket', label: t('ticket', 'Ticket') },
    { value: 'ChangeRequest', label: t('changeRequest', 'Change Request') },
    { value: 'ServiceRequest', label: t('serviceRequest', 'Service Request') },
    { value: 'Asset', label: t('asset', 'Asset') },
    { value: 'User', label: t('user', 'User') },
  ];

  const triggerOptions = [
    { value: 'Created', label: t('created', 'Created') },
    { value: 'Updated', label: t('updated', 'Updated') },
    { value: 'StatusChanged', label: t('statusChanged', 'Status Changed') },
    { value: 'PriorityChanged', label: t('priorityChanged', 'Priority Changed') },
    { value: 'Scheduled', label: t('scheduled', 'Scheduled') },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesRes, logsRes] = await Promise.all([
        automationService.getRules(),
        automationService.getLogs(10),
      ]);
      setRules(rulesRes?.data || []);
      setLogs(logsRes?.data || []);
    } catch (error) {
      console.error('Failed to load automation data:', error);
      setRules([]);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = t('nameRequired', 'Name is required');
    if (!form.description.trim()) nextErrors.description = t('descriptionRequired', 'Description is required');
    if (!form.targetEntity.trim()) nextErrors.targetEntity = t('targetEntityRequired', 'Target entity is required');
    if (!form.triggerEvent.trim()) nextErrors.triggerEvent = t('triggerEventRequired', 'Trigger event is required');

    try {
      JSON.parse(form.conditionsJson || '{}');
    } catch {
      nextErrors.conditionsJson = t('conditionsValidJson', 'Conditions must be valid JSON');
    }

    try {
      JSON.parse(form.actionsJson || '[]');
    } catch {
      nextErrors.actionsJson = t('actionsValidJson', 'Actions must be valid JSON');
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const openCreate = () => {
    setForm(emptyForm);
    setErrors({});
    setShowForm(true);
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      await automationService.createRule({
        name: form.name.trim(),
        description: form.description.trim(),
        targetEntity: form.targetEntity,
        triggerEvent: form.triggerEvent,
        conditionsJson: form.conditionsJson.trim(),
        actionsJson: form.actionsJson.trim(),
      });
      setShowForm(false);
      await loadData();
    } catch (error) {
      console.error('Failed to create automation rule:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BreadcrumbTrail />
      <main className="px-4 md:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">{t('automationRules', 'Automation Rules')}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('automationRulesDescription', 'Manage backend automation rules and review recent execution logs.')}
            </p>
          </div>
          <Button iconName="Plus" iconPosition="left" onClick={openCreate}>
            {t('newRule', 'New Rule')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr] gap-6">
          <section className="rounded-2xl border border-border bg-card shadow-elevation-1 overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t('rules', 'Rules')}</h2>
                <p className="text-sm text-muted-foreground">{rules.length} {t('rulesLoaded', 'backend rules loaded')}</p>
              </div>
              <Button variant="outline" size="sm" onClick={loadData}>
                {t('refresh', 'Refresh')}
              </Button>
            </div>

            {loading ? (
              <div className="p-10 text-center text-muted-foreground">
                <Icon name="Loader2" size={28} className="mx-auto mb-3 animate-spin" />
                {t('loadingAutomationRules', 'Loading automation rules...')}
              </div>
            ) : rules.length === 0 ? (
              <div className="p-10 text-center">
                <Icon name="Zap" size={40} className="mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium text-foreground">{t('noAutomationRulesYet', 'No automation rules yet')}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('createFirstRule', 'Create the first rule to connect the backend engine.')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('rule', 'Rule')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('target', 'Target')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('trigger', 'Trigger')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('status', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{rule.name}</div>
                          <div className="text-xs text-muted-foreground">{rule.description}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">{rule.targetEntity || t('notAvailable', 'Not available')}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{rule.triggerEvent || t('notAvailable', 'Not available')}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${rule.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                            {rule.isActive ? t('active', 'Active') : t('inactive', 'Inactive')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside className="rounded-2xl border border-border bg-card shadow-elevation-1 overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">{t('executionLogs', 'Execution Logs')}</h2>
              <p className="text-sm text-muted-foreground">{t('recentBackendAutomation', 'Recent backend automation operations')}</p>
            </div>
            <div className="p-5 space-y-3 max-h-[40rem] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-sm text-muted-foreground">{t('noExecutionLogs', 'The backend has not returned any execution logs yet.')}</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="rounded-xl border border-border bg-muted/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-foreground">{log.ruleName}</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${log.success ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                        {log.success ? t('success', 'Success') : t('failure', 'Failure')}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{log.actionSummary || log.errorMessage || t('noDetailsAvailable', 'No details available.')}</p>
                    <div className="mt-2 text-xs text-muted-foreground">{log.executedAt ? new Date(log.executedAt).toLocaleString() : t('unknownTime', 'Unknown time')}</div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-[1500] bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="w-full max-w-3xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">{t('newAutomationRule', 'New Automation Rule')}</h2>
                <p className="text-sm text-muted-foreground">{t('backendContractCompatible', 'Compatible with backend `CreateAutomationRuleDto` contract.')}</p>
              </div>
              <Button variant="ghost" size="sm" type="button" onClick={() => setShowForm(false)}>
                <Icon name="X" size={18} />
              </Button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto">
              <Input
                label={t('name', 'Name')}
                value={form.name}
                onChange={(e) => setField('name', e?.target?.value)}
                error={errors.name}
                required
              />
              <Select
                label={t('targetEntity', 'Target Entity')}
                options={targetOptions}
                value={form.targetEntity}
                onChange={(value) => setField('targetEntity', value)}
                error={errors.targetEntity}
              />
              <div className="md:col-span-2">
                <Input
                  label={t('description', 'Description')}
                  value={form.description}
                  onChange={(e) => setField('description', e?.target?.value)}
                  error={errors.description}
                  required
                />
              </div>
              <Select
                label={t('triggerEvent', 'Trigger Event')}
                options={triggerOptions}
                value={form.triggerEvent}
                onChange={(value) => setField('triggerEvent', value)}
                error={errors.triggerEvent}
              />
              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">{t('activeRule', 'Active')}</span>
                <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setField('isActive', e.target.checked)}
                  />
                  <span className="text-sm text-muted-foreground">{t('enableRuleImmediately', 'Enable rule immediately')}</span>
                </div>
              </label>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">{t('jsonConditions', 'JSON Conditions')}</label>
                <textarea
                  rows={5}
                  value={form.conditionsJson}
                  onChange={(e) => setField('conditionsJson', e?.target?.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary font-mono"
                />
                {errors.conditionsJson && <p className="mt-2 text-sm text-error">{errors.conditionsJson}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">{t('jsonActions', 'JSON Actions')}</label>
                <textarea
                  rows={5}
                  value={form.actionsJson}
                  onChange={(e) => setField('actionsJson', e?.target?.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary font-mono"
                />
                {errors.actionsJson && <p className="mt-2 text-sm text-error">{errors.actionsJson}</p>}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                {t('cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? t('saving', 'Saving...') : t('createRule', 'Create Rule')}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AutomationManagement;
