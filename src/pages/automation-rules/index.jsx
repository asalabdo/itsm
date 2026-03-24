import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import apiClient from '../../services/apiClient';

const AutomationManagement = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiClient.get('/automation-rules');
        setRules(res.data || []);
      } catch {
        setRules([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleToggle = async (id, active) => {
    try {
      await apiClient.put(`/automation-rules/${id}`, { active: !active });
      setRules(prev => prev.map(r => r.id === id ? { ...r, active: !active } : r));
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this automation rule?')) return;
    try {
      await apiClient.delete(`/automation-rules/${id}`);
      setRules(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BreadcrumbTrail />
      <main className="px-4 md:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Automation Rules</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage automated workflows and triggers</p>
          </div>
          <Button iconName="Plus" iconPosition="left">New Rule</Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Icon name="Loader" size={40} className="animate-spin opacity-30" color="var(--color-muted-foreground)" />
          </div>
        ) : rules.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Icon name="Zap" size={48} className="mx-auto mb-4 opacity-20" color="var(--color-muted-foreground)" />
            <h3 className="text-lg font-medium text-foreground mb-2">No automation rules</h3>
            <p className="text-sm text-muted-foreground mb-4">Create rules to automate repetitive tasks and workflows.</p>
            <Button iconName="Plus" iconPosition="left">Create First Rule</Button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg shadow-elevation-1 overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  {['Rule Name', 'Trigger', 'Action', 'Status', 'Last Run', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rules.map(rule => (
                  <tr key={rule.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm text-foreground">{rule.name}</div>
                      <div className="text-xs text-muted-foreground">{rule.description}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{rule.trigger || 'Manual'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{rule.action || 'Notify'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${rule.active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {rule.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {rule.lastRun ? new Date(rule.lastRun).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleToggle(rule.id, rule.active)}>
                          <Icon name={rule.active ? 'PauseCircle' : 'PlayCircle'} size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(rule.id)}>
                          <Icon name="Trash2" size={16} className="text-error" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AutomationManagement;
