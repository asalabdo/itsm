import { useEffect, useState } from 'react';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { manageEngineAPI, settingsAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const Settings = () => {
  const [saving, setSaving] = useState(false);
  const [testingManageEngine, setTestingManageEngine] = useState(false);
  const [syncingManageEngine, setSyncingManageEngine] = useState(false);
  const [manageEngineMessage, setManageEngineMessage] = useState(null);
  const [manageEngineSyncStatus, setManageEngineSyncStatus] = useState(null);
  const { setLanguage, language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const isArabic = language === 'ar';
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
  const [manageEngineSettings, setManageEngineSettings] = useState({
    syncEnabled: false,
    syncDirection: 'import',
    syncIntervalMinutes: 15,
    webhookSecret: '',
    serviceDesk: {
      profile: 'serviceDeskPlus151',
      baseUrl: '',
      apiKey: '',
      technicianKey: '',
      authMode: 'header',
      portalId: '',
      apiKeyHeaderName: 'authtoken',
      apiKeyQueryName: 'apiKey',
      technicianHeaderName: 'TECHNICIAN_KEY',
      catalogEndpoint: '/api/v3/request_templates',
      knowledgeBaseEndpoint: '/api/v3/solutions',
      requestsEndpoint: '/api/v3/requests',
      approvalsEndpoint: '/api/v3/approvals',
      changesEndpoint: '/api/v3/changes',
      assetEndpoint: '/api/v3/assets',
      servicesEndpoint: '/api/v3/service_catalog/items',
      alertsEndpoint: '/api/v3/requests',
    },
    opManager: {
      profile: 'opManager',
      baseUrl: '',
      apiKey: '',
      technicianKey: '',
      authMode: 'query',
      portalId: '',
      apiKeyHeaderName: 'authtoken',
      apiKeyQueryName: 'apiKey',
      technicianHeaderName: 'TECHNICIAN_KEY',
      catalogEndpoint: '/api/json/device/listDevices',
      requestsEndpoint: '/api/json/device/listDevices',
      servicesEndpoint: '/api/json/device/listDevices',
      alertsEndpoint: '/api/json/alarm/listAlarms',
    },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, manageEngineRes, syncRes] = await Promise.all([
          settingsAPI.getProfile(),
          manageEngineAPI.getSettings().catch(() => ({ data: null })),
          manageEngineAPI.getSyncStatus().catch(() => ({ data: null })),
        ]);
        setProfile((prev) => ({
          ...prev,
          ...(profileRes.data || {}),
          notificationPreferences: {
            ...prev.notificationPreferences,
            ...(profileRes.data?.notificationPreferences || {}),
          },
          integrations: Array.isArray(profileRes.data?.integrations) ? profileRes.data.integrations : prev.integrations,
          enabledModules: Array.isArray(profileRes.data?.enabledModules) ? profileRes.data.enabledModules : prev.enabledModules,
        }));
        if (manageEngineRes?.data) {
          applyManageEngineSettings(manageEngineRes.data);
        }
        setManageEngineSyncStatus(syncRes?.data || null);
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

  const updateManageEngineField = (section, key, value) => {
    if (!section) {
      setManageEngineSettings((prev) => ({ ...prev, [key]: value }));
      return;
    }

    setManageEngineSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const applyManageEngineSettings = (data) => {
    if (!data) {
      return;
    }

    setManageEngineSettings((prev) => ({
      ...prev,
      ...data,
      serviceDesk: { ...prev.serviceDesk, ...(data.serviceDesk || {}) },
      opManager: { ...prev.opManager, ...(data.opManager || {}) },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const [, manageEngineResponse] = await Promise.all([
        settingsAPI.updateProfile(profile),
        manageEngineAPI.updateSettings(manageEngineSettings),
      ]);
      applyManageEngineSettings(manageEngineResponse?.data);
      setManageEngineMessage({ type: 'success', text: isArabic ? 'ØªÙ… Ø­ÙØ¸ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª ManageEngine ÙˆØ¥Ø¹Ø§Ø¯Ø© ØªØ­Ù…ÙŠÙ„Ù‡Ø§.' : 'ManageEngine settings saved and reloaded.' });
      window.dispatchEvent(new CustomEvent('itsm:toast', {
        detail: { type: 'success', message: isArabic ? 'ØªÙ… Ø­ÙØ¸ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø¨Ù†Ø¬Ø§Ø­.' : 'Settings saved successfully.' }
      }));
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert(isArabic ? 'ÙØ´Ù„ Ø­ÙØ¸ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª.' : 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleManageEngineTest = async () => {
    try {
      setTestingManageEngine(true);
      const response = await manageEngineAPI.testConnection();
      setManageEngineMessage({
        type: response?.data?.status === 'connected' ? 'success' : 'error',
        text: isArabic
          ? `ServiceDesk: ${response?.data?.serviceDeskConnected ? 'Ù…ØªØµÙ„' : 'ØºÙŠØ± Ù…ØªØµÙ„'} | OpManager: ${response?.data?.opManagerConnected ? 'Ù…ØªØµÙ„' : 'ØºÙŠØ± Ù…ØªØµÙ„'}`
          : `ServiceDesk: ${response?.data?.serviceDeskConnected ? 'Connected' : 'Disconnected'} | OpManager: ${response?.data?.opManagerConnected ? 'Connected' : 'Disconnected'}`
      });
    } catch (error) {
      setManageEngineMessage({
        type: 'error',
        text: error?.response?.data?.error || (isArabic ? 'ÙØ´Ù„ Ø§Ø®ØªØ¨Ø§Ø± Ø§ØªØµØ§Ù„ ManageEngine.' : 'Failed to test ManageEngine connection.'),
      });
    } finally {
      setTestingManageEngine(false);
    }
  };

  const handleManageEngineSourceTest = async (sourceKey) => {
    try {
      setTestingManageEngine(true);
      const response = await manageEngineAPI.testConnection();
      const connected = sourceKey === 'serviceDesk'
        ? Boolean(response?.data?.serviceDeskConnected)
        : Boolean(response?.data?.opManagerConnected);
      setManageEngineMessage({
        type: connected ? 'success' : 'error',
        text: `${sourceKey === 'serviceDesk' ? 'ServiceDesk' : 'OpManager'}: ${connected ? 'Connected' : 'Disconnected'}`,
      });
    } catch (error) {
      setManageEngineMessage({
        type: 'error',
        text: error?.response?.data?.error || 'Failed to test ManageEngine source connection.',
      });
    } finally {
      setTestingManageEngine(false);
    }
  };

  const handleManageEngineSync = async () => {
    try {
      setSyncingManageEngine(true);
      const response = await manageEngineAPI.syncIncidents();
      const syncRes = await manageEngineAPI.getSyncStatus().catch(() => ({ data: null }));
      setManageEngineSyncStatus(syncRes?.data || response?.data || null);
      setManageEngineMessage({
        type: response?.data?.status === 'partial' ? 'error' : 'success',
        text: response?.data?.message || 'ManageEngine sync completed.',
      });
    } catch (error) {
      setManageEngineMessage({
        type: 'error',
        text: error?.response?.data?.error || 'Failed to run ManageEngine sync.',
      });
    } finally {
      setSyncingManageEngine(false);
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
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
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

              <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{isArabic ? 'ØªÙƒØ§Ù…Ù„ ManageEngine' : 'ManageEngine Integration'}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isArabic ? 'Ø§Ø¶Ø¨Ø· Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ ÙˆÙ†Ù‚Ø§Ø· Ø§Ù„Ù†Ù‡Ø§ÙŠØ© ÙˆÙˆØ¶Ø¹ Ø§Ù„Ù…ØµØ§Ø¯Ù‚Ø© Ù„Ù€ ServiceDesk Ùˆ OpManager 12.8.270.' : 'Configure runtime credentials, endpoints, and auth mode for ServiceDesk and OpManager 12.8.270.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={handleManageEngineTest} loading={testingManageEngine}>
                      {isArabic ? 'اختبار الاتصال' : 'Test All'}
                    </Button>
                    <Button variant="outline" onClick={() => handleManageEngineSourceTest('serviceDesk')} loading={testingManageEngine}>
                      ServiceDesk 15.1
                    </Button>
                    <Button variant="outline" onClick={() => handleManageEngineSourceTest('opManager')} loading={testingManageEngine}>
                      OpManager
                    </Button>
                    <Button onClick={handleManageEngineSync} loading={syncingManageEngine}>
                      {isArabic ? 'تشغيل المزامنة' : 'Sync Now'}
                    </Button>
                  </div>
                </div>

                {manageEngineMessage && (
                  <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
                    manageEngineMessage.type === 'success'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-700'
                  }`}>
                    {manageEngineMessage.text}
                  </div>
                )}

                {manageEngineSyncStatus && (
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
                      <div className="text-xs text-muted-foreground">Sync status</div>
                      <div className="mt-1 text-sm font-semibold capitalize text-foreground">{manageEngineSyncStatus.status || 'idle'}</div>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
                      <div className="text-xs text-muted-foreground">Created</div>
                      <div className="mt-1 text-sm font-semibold text-foreground">{manageEngineSyncStatus.createdCount || 0}</div>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
                      <div className="text-xs text-muted-foreground">Updated</div>
                      <div className="mt-1 text-sm font-semibold text-foreground">{manageEngineSyncStatus.updatedCount || 0}</div>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
                      <div className="text-xs text-muted-foreground">Sources</div>
                      <div className="mt-1 text-xs font-medium text-foreground">
                        ServiceDesk: {manageEngineSyncStatus.serviceDeskCount || 0} | OpManager: {manageEngineSyncStatus.opManagerCount || 0}
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">{isArabic ? 'Ø§Ù„Ù…Ø²Ø§Ù…Ù†Ø© Ù…ÙØ¹Ù„Ø©' : 'Sync Enabled'}</span>
                    <select
                      value={String(manageEngineSettings.syncEnabled)}
                      onChange={(e) => updateManageEngineField(null, 'syncEnabled', e.target.value === 'true')}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="false">{isArabic ? 'Ù…Ø¹Ø·Ù„Ø©' : 'Disabled'}</option>
                      <option value="true">{isArabic ? 'Ù…ÙØ¹Ù„Ø©' : 'Enabled'}</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">{isArabic ? 'Ø§ØªØ¬Ø§Ù‡ Ø§Ù„Ù…Ø²Ø§Ù…Ù†Ø©' : 'Sync Direction'}</span>
                    <input
                      value={manageEngineSettings.syncDirection}
                      onChange={(e) => updateManageEngineField(null, 'syncDirection', e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">{isArabic ? 'ÙØ§ØµÙ„ Ø§Ù„Ù…Ø²Ø§Ù…Ù†Ø© Ø¨Ø§Ù„Ø¯Ù‚Ø§Ø¦Ù‚' : 'Sync Interval Minutes'}</span>
                    <input
                      type="number"
                      min="1"
                      value={manageEngineSettings.syncIntervalMinutes}
                      onChange={(e) => updateManageEngineField(null, 'syncIntervalMinutes', Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </label>
                </div>

                <label className="space-y-2 block mb-6">
                  <span className="text-sm font-medium text-foreground">{isArabic ? 'Ø§Ù„Ø³Ø± Ø§Ù„Ø³Ø±ÙŠ Ù„Ù„ÙˆÙŠØ¨ Ù‡ÙˆÙƒ' : 'Webhook Secret'}</span>
                  <input
                    value={manageEngineSettings.webhookSecret || ''}
                    onChange={(e) => updateManageEngineField(null, 'webhookSecret', e.target.value)}
                    placeholder="********"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>

                {[
                  ['serviceDesk', 'ServiceDesk'],
                  ['opManager', 'OpManager'],
                ].map(([sectionKey, title]) => (
                  <div key={sectionKey} className="mb-6 rounded-xl border border-border p-4">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">{sectionKey === 'serviceDesk' ? 'ServiceDesk Plus 15.1' : title}</h3>
                        {sectionKey === 'serviceDesk' && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Uses on-prem API v3 with authtoken, SDP v3 Accept header, PORTALID when configured, and input_data payloads.
                          </p>
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleManageEngineSourceTest(sectionKey)} loading={testingManageEngine}>
                        Test {sectionKey === 'serviceDesk' ? 'ServiceDesk' : 'OpManager'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Integration Profile</span>
                        <select
                          value={manageEngineSettings[sectionKey]?.profile || (sectionKey === 'serviceDesk' ? 'serviceDeskPlus151' : 'opManager')}
                          onChange={(e) => updateManageEngineField(sectionKey, 'profile', e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        >
                          {sectionKey === 'serviceDesk' ? (
                            <option value="serviceDeskPlus151">ServiceDesk Plus 15.1 On-Prem API v3</option>
                          ) : (
                            <option value="opManager">OpManager</option>
                          )}
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Base URL</span>
                        <input
                          value={manageEngineSettings[sectionKey]?.baseUrl || ''}
                          onChange={(e) => updateManageEngineField(sectionKey, 'baseUrl', e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Auth Mode</span>
                        <select
                          value={manageEngineSettings[sectionKey]?.authMode || ''}
                          onChange={(e) => updateManageEngineField(sectionKey, 'authMode', e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="header">Header Key</option>
                          <option value="query">Query Key</option>
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">API Key</span>
                        <input
                          value={manageEngineSettings[sectionKey]?.apiKey || ''}
                          onChange={(e) => updateManageEngineField(sectionKey, 'apiKey', e.target.value)}
                          placeholder="********"
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Technician Key</span>
                        <input
                          value={manageEngineSettings[sectionKey]?.technicianKey || ''}
                          onChange={(e) => updateManageEngineField(sectionKey, 'technicianKey', e.target.value)}
                          placeholder="********"
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Portal ID</span>
                        <input
                          value={manageEngineSettings[sectionKey]?.portalId || ''}
                          onChange={(e) => updateManageEngineField(sectionKey, 'portalId', e.target.value)}
                          placeholder={sectionKey === 'serviceDesk' ? 'Optional SDP portal id' : 'Optional'}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">API Key Header</span>
                        <input
                          value={manageEngineSettings[sectionKey]?.apiKeyHeaderName || ''}
                          onChange={(e) => updateManageEngineField(sectionKey, 'apiKeyHeaderName', e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">API Key Query Name</span>
                        <input
                          value={manageEngineSettings[sectionKey]?.apiKeyQueryName || ''}
                          onChange={(e) => updateManageEngineField(sectionKey, 'apiKeyQueryName', e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Technician Header</span>
                        <input
                          value={manageEngineSettings[sectionKey]?.technicianHeaderName || ''}
                          onChange={(e) => updateManageEngineField(sectionKey, 'technicianHeaderName', e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Catalog Endpoint</span>
                        <input
                          value={manageEngineSettings[sectionKey]?.catalogEndpoint || ''}
                          onChange={(e) => updateManageEngineField(sectionKey, 'catalogEndpoint', e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Knowledge Base Endpoint</span>
                        <input
                          value={manageEngineSettings[sectionKey]?.knowledgeBaseEndpoint || ''}
                          onChange={(e) => updateManageEngineField(sectionKey, 'knowledgeBaseEndpoint', e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Requests Endpoint</span>
                        <input
                          value={manageEngineSettings[sectionKey]?.requestsEndpoint || ''}
                          onChange={(e) => updateManageEngineField(sectionKey, 'requestsEndpoint', e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Approvals Endpoint</span>
                        <input
                          value={manageEngineSettings[sectionKey]?.approvalsEndpoint || ''}
                          onChange={(e) => updateManageEngineField(sectionKey, 'approvalsEndpoint', e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Changes Endpoint</span>
                        <input
                          value={manageEngineSettings[sectionKey]?.changesEndpoint || ''}
                          onChange={(e) => updateManageEngineField(sectionKey, 'changesEndpoint', e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Asset Endpoint</span>
                        <input
                          value={manageEngineSettings[sectionKey]?.assetEndpoint || ''}
                          onChange={(e) => updateManageEngineField(sectionKey, 'assetEndpoint', e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Services Endpoint</span>
                        <input
                          value={manageEngineSettings[sectionKey]?.servicesEndpoint || ''}
                          onChange={(e) => updateManageEngineField(sectionKey, 'servicesEndpoint', e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Alerts Endpoint</span>
                        <input
                          value={manageEngineSettings[sectionKey]?.alertsEndpoint || ''}
                          onChange={(e) => updateManageEngineField(sectionKey, 'alertsEndpoint', e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                      </label>
                    </div>
                  </div>
                ))}
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
