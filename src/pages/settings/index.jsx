import { useEffect, useState } from 'react';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { settingsAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const Settings = () => {
  const [saving, setSaving] = useState(false);
  const { setLanguage, language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [profile, setProfile] = useState({
    displayName: '',
    role: '',
    theme: 'System',
    language: 'en',
    defaultLandingPage: '/it-operations-command-center',
    notificationEmail: '',
    autoRefreshEnabled: true,
    autoRefreshSeconds: 60,
    slaWarningMinutes: 120,
    escalationMinutes: 30,
    enabledModules: [],
    notificationPreferences: {
      emailUpdates: true,
      smsAlerts: false,
      pushNotifications: true,
      weeklyDigest: true,
    },
    integrations: [],
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await settingsAPI.getProfile();
        setProfile((prev) => ({
          ...prev,
          ...(res.data || {}),
          notificationPreferences: {
            ...prev.notificationPreferences,
            ...(res.data?.notificationPreferences || {}),
          },
          integrations: Array.isArray(res.data?.integrations) ? res.data.integrations : prev.integrations,
          enabledModules: Array.isArray(res.data?.enabledModules) ? res.data.enabledModules : prev.enabledModules,
        }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    load();
  }, []);

  const updateField = (key, value) => {
    if (key === 'language') {
      setLanguage(value);
    }
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const toggleModule = (moduleKey) => {
    setProfile((prev) => ({
      ...prev,
      enabledModules: prev.enabledModules.includes(moduleKey)
        ? prev.enabledModules.filter((item) => item !== moduleKey)
        : [...prev.enabledModules, moduleKey],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsAPI.updateProfile(profile);
      window.dispatchEvent(new CustomEvent('itsm:toast', {
        detail: { type: 'success', message: 'Settings saved successfully.' }
      }));
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const moduleOptions = [
    { key: 'incidents', label: t('incidentManagement', 'Incident Management') },
    { key: 'changes', label: t('changeManagement', 'Change Management') },
    { key: 'assets', label: t('assetRegistry', 'Asset Registry') },
    { key: 'requests', label: t('serviceRequestManagement', 'Service Request Management') },
    { key: 'knowledge', label: t('knowledgeBase', 'Knowledge Base') },
    { key: 'approvals', label: t('approvalQueue', 'Approval Queue') },
    { key: 'automation', label: t('automationRules', 'Automation Rules') },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BreadcrumbTrail />
      <main className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <section className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-elevation-1">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Icon name="Settings2" size={14} />
                  {t('settings', 'Settings')}
                </div>
                <h1 className="mt-3 text-3xl font-semibold text-foreground">{t('settingsPageTitle', 'Workspace preferences and ITSM defaults')}</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('settingsPageSubtitle', 'Control the dashboard landing page, alerts, refresh cadence, and which operational modules are visible.')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setProfile((prev) => ({ ...prev, ...{
                  theme: 'System',
                  language: 'en',
                  defaultLandingPage: '/it-operations-command-center',
                  autoRefreshEnabled: true,
                  autoRefreshSeconds: 60,
                  slaWarningMinutes: 120,
                  escalationMinutes: 30,
                  notificationPreferences: {
                    emailUpdates: true,
                    smsAlerts: false,
                    pushNotifications: true,
                    weeklyDigest: true,
                  },
                  }}))}>
                  {t('resetDefaults', 'Reset Defaults')}
                </Button>
                <Button onClick={handleSave} loading={saving}>
                  {t('saveChanges', 'Save Changes')}
                </Button>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1">
                <h2 className="text-lg font-semibold text-foreground mb-4">{t('general', 'General')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">{t('displayName', 'Display Name')}</span>
                    <input
                      value={profile.displayName}
                      onChange={(e) => updateField('displayName', e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">{t('role', 'Role')}</span>
                    <input
                      value={profile.role}
                      onChange={(e) => updateField('role', e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">{t('theme', 'Theme')}</span>
                    <select
                      value={profile.theme}
                      onChange={(e) => updateField('theme', e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="System">{t('systemTheme', 'System')}</option>
                      <option value="Light">{t('lightTheme', 'Light')}</option>
                      <option value="Dark">{t('darkTheme', 'Dark')}</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">{t('languageLabel', 'Language')}</span>
                    <select
                      value={profile.language}
                      onChange={(e) => updateField('language', e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="en">{t('english', 'English')}</option>
                      <option value="ar">{t('arabic', 'Arabic')}</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1">
                <h2 className="text-lg font-semibold text-foreground mb-4">{t('notificationsAndSLA', 'Notifications and SLA')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">{t('notificationEmail', 'Notification Email')}</span>
                    <input
                      value={profile.notificationEmail}
                      onChange={(e) => updateField('notificationEmail', e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">{t('defaultLandingPage', 'Default Landing Page')}</span>
                    <select
                      value={profile.defaultLandingPage}
                      onChange={(e) => updateField('defaultLandingPage', e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="/it-operations-command-center">{t('itOperationsCenter', 'IT Operations Center')}</option>
                      <option value="/agent-dashboard">{t('agentDashboard', 'Agent Dashboard')}</option>
                      <option value="/customer-portal">{t('employeePortal', 'Employee Portal')}</option>
                      <option value="/service-request-management">{t('serviceRequestManagement', 'Service Request Management')}</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">{t('slaWarningMinutes', 'SLA Warning Minutes')}</span>
                    <input
                      type="number"
                      min="15"
                      value={profile.slaWarningMinutes}
                      onChange={(e) => updateField('slaWarningMinutes', Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">{t('escalationMinutes', 'Escalation Minutes')}</span>
                    <input
                      type="number"
                      min="5"
                      value={profile.escalationMinutes}
                      onChange={(e) => updateField('escalationMinutes', Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </label>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    ['emailUpdates', t('emailUpdates', 'Email Updates'), t('emailUpdatesDesc', 'Receive ticket updates via email.')],
                    ['smsAlerts', t('smsAlerts', 'SMS Alerts'), t('smsAlertsDesc', 'Get urgent notifications via text messages.')],
                    ['pushNotifications', t('pushNotifications', 'Browser Notifications'), t('pushNotificationsDesc', 'Instant notifications via browser.')],
                    ['weeklyDigest', t('weeklyDigest', 'Weekly Digest'), t('weeklyDigestDesc', 'Summary of tickets and activity each week.')],
                  ].map(([key, label, description]) => (
                    <label key={key} className="rounded-xl border border-border bg-muted/30 px-4 py-3 flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={profile.notificationPreferences?.[key] ?? false}
                        onChange={(e) => setProfile((prev) => ({
                          ...prev,
                          notificationPreferences: {
                            ...prev.notificationPreferences,
                            [key]: e.target.checked,
                          },
                        }))}
                        className="mt-1"
                      />
                      <span>
                        <span className="block text-sm font-medium text-foreground">{label}</span>
                        <span className="block text-xs text-muted-foreground mt-1">{description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1">
                <h2 className="text-lg font-semibold text-foreground mb-2">{t('integrationSettings', 'Integration Settings')}</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('integrationSettingsDesc', 'Configure delivery systems used in notifications and summaries.')}
                </p>
                <div className="space-y-4">
                  {(profile.integrations || []).map((integration, index) => (
                    <div key={integration?.id || `${integration?.provider || 'integration'}-${index}`} className="rounded-xl border border-border p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">{t('name', 'Name')}</span>
                          <input
                            value={integration.name || ''}
                            onChange={(e) => setProfile((prev) => ({
                              ...prev,
                              integrations: prev.integrations.map((item, itemIndex) => (
                                itemIndex === index ? { ...item, name: e.target.value } : item
                              )),
                            }))}
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">{t('provider', 'Provider')}</span>
                          <input
                            value={integration.provider || ''}
                            onChange={(e) => setProfile((prev) => ({
                              ...prev,
                              integrations: prev.integrations.map((item, itemIndex) => (
                                itemIndex === index ? { ...item, provider: e.target.value } : item
                              )),
                            }))}
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                          />
                        </label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">{t('jsonSettings', 'JSON Settings')}</span>
                          <textarea
                            rows={4}
                            value={integration.configurationJson || '{}'}
                            onChange={(e) => setProfile((prev) => ({
                              ...prev,
                              integrations: prev.integrations.map((item, itemIndex) => (
                                itemIndex === index ? { ...item, configurationJson: e.target.value } : item
                              )),
                            }))}
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary font-mono"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">{t('eventSubscriptions', 'Event Subscriptions')}</span>
                          <textarea
                            rows={4}
                            value={integration.eventSubscriptions || '[]'}
                            onChange={(e) => setProfile((prev) => ({
                              ...prev,
                              integrations: prev.integrations.map((item, itemIndex) => (
                                itemIndex === index ? { ...item, eventSubscriptions: e.target.value } : item
                              )),
                            }))}
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary font-mono"
                          />
                        </label>
                      </div>
                      <label className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3 w-fit">
                        <input
                          type="checkbox"
                          checked={Boolean(integration.isEnabled)}
                          onChange={(e) => setProfile((prev) => ({
                            ...prev,
                            integrations: prev.integrations.map((item, itemIndex) => (
                              itemIndex === index ? { ...item, isEnabled: e.target.checked } : item
                            )),
                          }))}
                        />
                        <span className="text-sm font-medium text-foreground">{t('enabled', 'Enabled')}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1">
                <h2 className="text-lg font-semibold text-foreground mb-4">{t('enabledModules', 'Enabled Modules')}</h2>
                <div className="space-y-2">
                  {moduleOptions.map((module) => (
                    <label key={module.key} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 hover:bg-muted/40">
                      <span className="text-sm font-medium text-foreground">{module.label}</span>
                      <input
                        type="checkbox"
                        checked={profile.enabledModules.includes(module.key)}
                        onChange={() => toggleModule(module.key)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-elevation-1">
                <h2 className="text-lg font-semibold">{t('operationsShortcuts', 'Operations shortcuts')}</h2>
                <p className="mt-2 text-sm text-white/70">{t('operationsShortcutsDesc', 'Navigate directly to places where these settings have an impact.')}</p>
                <div className="mt-4 space-y-2">
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10" onClick={() => window.dispatchEvent(new CustomEvent('itsm:refresh'))}>
                    {t('refreshDashboards', 'Refresh Dashboards')}
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10" onClick={() => window.location.assign('/knowledge-base')}>
                    {t('openKnowledgeBase', 'Open Knowledge Base')}
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10" onClick={() => window.location.assign('/sla-policies')}>
                    {t('reviewSLAPolicies', 'Review SLA Policies')}
                  </Button>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Settings;
