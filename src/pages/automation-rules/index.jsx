import React, { useEffect, useState } from 'react';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import automationService from '../../services/automationService';

const emptyForm = {
  name: '',
  description: '',
  targetEntity: 'Ticket',
  triggerEvent: 'Created',
  conditionsJson: '{"all": []}',
  actionsJson: '[]',
  isActive: true,
};

const targetOptions = [
  { value: 'Ticket', label: 'Ticket' },
  { value: 'ChangeRequest', label: 'Change Request' },
  { value: 'ServiceRequest', label: 'Service Request' },
  { value: 'Asset', label: 'Asset' },
  { value: 'User', label: 'User' },
];

const triggerOptions = [
  { value: 'Created', label: 'Created' },
  { value: 'Updated', label: 'Updated' },
  { value: 'StatusChanged', label: 'Status Changed' },
  { value: 'PriorityChanged', label: 'Priority Changed' },
  { value: 'Scheduled', label: 'Scheduled' },
];

const AutomationManagement = () => {
  const [rules, setRules] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

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

    if (!form.name.trim()) nextErrors.name = 'Name is required';
    if (!form.description.trim()) nextErrors.description = 'Description is required';
    if (!form.targetEntity.trim()) nextErrors.targetEntity = 'Target entity is required';
    if (!form.triggerEvent.trim()) nextErrors.triggerEvent = 'Trigger event is required';

    try {
      JSON.parse(form.conditionsJson || '{}');
    } catch {
      nextErrors.conditionsJson = 'Conditions must be valid JSON';
    }

    try {
      JSON.parse(form.actionsJson || '[]');
    } catch {
      nextErrors.actionsJson = 'Actions must be valid JSON';
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
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Automation Rules</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage backend automation rules and review recent execution logs.
            </p>
          </div>
          <Button iconName="Plus" iconPosition="left" onClick={openCreate}>
            New Rule
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr] gap-6">
          <section className="rounded-2xl border border-border bg-card shadow-elevation-1 overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Rules</h2>
                <p className="text-sm text-muted-foreground">{rules.length} backend rules loaded</p>
              </div>
              <Button variant="outline" size="sm" onClick={loadData}>
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="p-10 text-center text-muted-foreground">
                <Icon name="Loader2" size={28} className="mx-auto mb-3 animate-spin" />
                Loading automation rules...
              </div>
            ) : rules.length === 0 ? (
              <div className="p-10 text-center">
                <Icon name="Zap" size={40} className="mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium text-foreground">No automation rules yet</p>
                <p className="text-sm text-muted-foreground mt-1">Create the first rule to connect the backend engine.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Rule</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Target</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Trigger</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{rule.name}</div>
                          <div className="text-xs text-muted-foreground">{rule.description}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">{rule.targetEntity || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{rule.triggerEvent || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${rule.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                            {rule.isActive ? 'Active' : 'Inactive'}
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
              <h2 className="text-lg font-semibold text-foreground">Execution Logs</h2>
              <p className="text-sm text-muted-foreground">Recent backend automation runs</p>
            </div>
            <div className="p-5 space-y-3 max-h-[40rem] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-sm text-muted-foreground">No execution logs returned by the backend yet.</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="rounded-xl border border-border bg-muted/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-foreground">{log.ruleName}</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${log.success ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                        {log.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{log.actionSummary || log.errorMessage || 'No details available.'}</p>
                    <div className="mt-2 text-xs text-muted-foreground">{log.executedAt ? new Date(log.executedAt).toLocaleString() : 'Unknown time'}</div>
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
                <h2 className="text-xl font-semibold text-foreground">New Automation Rule</h2>
                <p className="text-sm text-muted-foreground">Matches the backend `CreateAutomationRuleDto` contract.</p>
              </div>
              <Button variant="ghost" size="sm" type="button" onClick={() => setShowForm(false)}>
                <Icon name="X" size={18} />
              </Button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto">
              <Input
                label="Name"
                value={form.name}
                onChange={(e) => setField('name', e?.target?.value)}
                error={errors.name}
                required
              />
              <Select
                label="Target Entity"
                options={targetOptions}
                value={form.targetEntity}
                onChange={(value) => setField('targetEntity', value)}
                error={errors.targetEntity}
              />
              <div className="md:col-span-2">
                <Input
                  label="Description"
                  value={form.description}
                  onChange={(e) => setField('description', e?.target?.value)}
                  error={errors.description}
                  required
                />
              </div>
              <Select
                label="Trigger Event"
                options={triggerOptions}
                value={form.triggerEvent}
                onChange={(value) => setField('triggerEvent', value)}
                error={errors.triggerEvent}
              />
              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Active</span>
                <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setField('isActive', e.target.checked)}
                  />
                  <span className="text-sm text-muted-foreground">Enable the rule immediately</span>
                </div>
              </label>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Conditions JSON</label>
                <textarea
                  rows={5}
                  value={form.conditionsJson}
                  onChange={(e) => setField('conditionsJson', e?.target?.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary font-mono"
                />
                {errors.conditionsJson && <p className="mt-2 text-sm text-error">{errors.conditionsJson}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Actions JSON</label>
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
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Create Rule'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AutomationManagement;
