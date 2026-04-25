  import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DatePickerInput from '../../components/ui/DatePickerInput';
import Select from '../../components/ui/Select';
import CategorySelector from './components/CategorySelector';
import EmployeeLookup from './components/EmployeeLookup';
import FileUploader from './components/FileUploader';
import RoutingPreview from './components/RoutingPreview';
import ManageEngineOnPremSnapshot from '../../components/manageengine/ManageEngineOnPremSnapshot';
import TicketDuplicateSuggestions from '../../components/tickets/TicketDuplicateSuggestions';
import TicketQuickPresetGrid from '../../components/tickets/TicketQuickPresetGrid';
import TicketRecentReusePanel from '../../components/tickets/TicketRecentReusePanel';
import { slaAPI, ticketsAPI } from '../../services/api';
import { getErpDepartmentOptions, loadErpDepartmentDirectory } from '../../services/organizationUnits';
import {
  getLocalizedTicketQuickPreset,
  getLocalizedTicketQuickPresetById,
  getTicketServiceDefaults,
  TICKET_DEPARTMENT_KEYS,
  TICKET_QUICK_PRESETS,
} from '../../services/ticketDepartmentDefaults';
import {
  getPortalIncidentDefaults,
  isPortalQuickPresetEntry,
  isPortalIncidentEntry,
} from './portalIncidentSeed';

const DRAFT_KEY = 'itsm-ticket-creation-draft-v2';

const initialFormData = {
  module: '',
  category: '',
  service: null,
  employee: null,
  priority: '',
  subject: '',
  description: '',
  dueDate: '',
  department: '',
  impact: '',
  urgency: '',
  attachments: [],
};

const serviceDefaults = (serviceId) => getTicketServiceDefaults(serviceId);

const priorityLabelMap = { urgent: 'عاجل', high: 'عالية', medium: 'متوسطة', low: 'منخفضة' };
const urgencyScaleMap = {
  immediate: 1,
  high: 0.75,
  medium: 0.5,
  low: 0.25,
};

const impactScaleMap = {
  critical: 1,
  high: 0.75,
  medium: 0.5,
  low: 0.25,
};

const toDecimalScale = (value, scaleMap) => {
  const normalizedValue = String(value || '').trim().toLowerCase();
  if (!normalizedValue) return null;
  return scaleMap[normalizedValue] ?? null;
};

const steps = [
  { label: 'scope', description: 'chooseModule' },
  { label: 'details', description: 'stepDetails' },
  { label: 'priority', description: 'stepPriority' },
  { label: 'review', description: 'stepReview' },
];

const TicketCreation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [erpDepartments, setErpDepartments] = useState([]);
  const [draftHydrated, setDraftHydrated] = useState(false);
  const quickPresets = useMemo(
    () => TICKET_QUICK_PRESETS.map((preset) => getLocalizedTicketQuickPreset(preset, language)),
    [language],
  );
  
  // Dynamic option arrays using translations
  const priorityOptions = [
    { value: 'urgent', label: t('urgent', 'Urgent') },
    { value: 'high', label: t('high', 'High') },
    { value: 'medium', label: t('medium', 'Medium') },
    { value: 'low', label: t('low', 'Low') },
  ];

  const impactOptions = [
    { value: 'critical', label: t('critical', 'Critical') },
    { value: 'high', label: t('high', 'High') },
    { value: 'medium', label: t('medium', 'Medium') },
    { value: 'low', label: t('low', 'Low') },
  ];

  const urgencyOptions = [
    { value: 'immediate', label: t('immediate', 'Immediate') },
    { value: 'high', label: t('high', 'High') },
    { value: 'medium', label: t('medium', 'Medium') },
    { value: 'low', label: t('low', 'Low') },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedTicketId, setGeneratedTicketId] = useState(null);
  const [createdTicketId, setCreatedTicketId] = useState(null);
  const [serviceSla, setServiceSla] = useState(null);
  const [serviceSlaLoading, setServiceSlaLoading] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(true);
  const [recentTickets, setRecentTickets] = useState([]);
  const [recentTicketsLoading, setRecentTicketsLoading] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showRecentTickets, setShowRecentTickets] = useState(false);
  const portalIncidentMode = isPortalIncidentEntry(location.state);
  const portalQuickPresetMode = isPortalQuickPresetEntry(location.state);
  const portalIncidentDefaults = useMemo(() => ({ ...initialFormData, ...getPortalIncidentDefaults() }), []);
  const portalQuickPreset = useMemo(
    () => (portalQuickPresetMode ? getLocalizedTicketQuickPresetById(location.state?.quickPresetId, language) : null),
    [language, location.state, portalQuickPresetMode],
  );

  useEffect(() => {
    let mounted = true;
    loadErpDepartmentDirectory()
      .then((departments) => {
        if (mounted) setErpDepartments(Array.isArray(departments) ? departments : []);
      })
      .catch((error) => {
        console.error('Failed to load ERP departments:', error);
        if (mounted) setErpDepartments([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const departmentOptions = useMemo(() => getErpDepartmentOptions(erpDepartments, t), [erpDepartments, t]);

  const resolveDepartmentLabel = (departmentKey) => {
    const normalized = String(departmentKey || '').trim().toLowerCase();
    if (!normalized) return '';
    const match = erpDepartments.find((department) => {
      const label = String(department?.label || '').toLowerCase();
      if (normalized === String(department?.value || '').toLowerCase()) return true;
      if (normalized === String(department?.id || '').toLowerCase()) return true;
      const keywords = {
        it: ['it', 'information', 'digital'],
        network: ['network', 'infrastructure', 'operations'],
        security: ['security'],
        application: ['application', 'digital', 'solutions'],
        hr: ['human', 'hr'],
        finance: ['finance'],
        facilities: ['facility', 'operations', 'infrastructure'],
      }[normalized] || [normalized];
      return keywords.some((keyword) => label.includes(keyword));
    });

    return match?.label || departmentOptions.find((option) => option.value === normalized)?.label || String(departmentKey || '').trim();
  };

  const selectedPriorityLabel = priorityOptions.find((option) => option.value === formData.priority)?.label || '-';
  const selectedImpactLabel = impactOptions.find((option) => option.value === formData.impact)?.label || '-';
  const selectedUrgencyLabel = urgencyOptions.find((option) => option.value === formData.urgency)?.label || '-';
  const selectedDepartmentLabel = departmentOptions.find((option) => option.value === formData.department)?.label || resolveDepartmentLabel(formData.department) || '-';

  useEffect(() => {
    if (portalIncidentMode) {
      setFormData(portalIncidentDefaults);
      setCurrentStep(0);
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData: portalIncidentDefaults, currentStep: 0 }));
      setDraftHydrated(true);
      return;
    }

    if (portalQuickPreset && !portalIncidentMode) {
      const presetFormData = {
        ...initialFormData,
        module: portalQuickPreset.module,
        category: portalQuickPreset.category,
        service: portalQuickPreset.service,
        subject: portalQuickPreset.subject,
        description: portalQuickPreset.description,
        priority: portalQuickPreset.priority,
        impact: portalQuickPreset.impact,
        urgency: portalQuickPreset.urgency,
        department: portalQuickPreset.department,
      };
      setFormData(presetFormData);
      setCurrentStep(3);
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData: presetFormData, currentStep: 3 }));
      setDraftHydrated(true);
      return;
    }

    // A direct visit to /ticket-creation should start from a clean draft instead of
    // restoring the last saved form from a previous session.
    localStorage.removeItem(DRAFT_KEY);
    setDraftHydrated(true);
  }, [portalIncidentDefaults, portalIncidentMode, portalQuickPreset]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData, currentStep }));
      setDraftSaved(true);
    }, 250);
    return () => clearTimeout(timer);
  }, [formData, currentStep]);

  useEffect(() => {
    const loadSla = async () => {
      if (!formData.category && !formData.service?.id) {
        setServiceSla(null);
        return;
      }
      setServiceSlaLoading(true);
      try {
        const res = await slaAPI.lookup({
          category: formData.category || undefined,
          serviceId: formData.service?.id || undefined,
          priority: formData.priority || undefined,
        });
        setServiceSla(res?.data || null);
      } catch {
        const defaults = serviceDefaults(formData.service?.id);
        setServiceSla(defaults ? {
          policyName: formData.service?.nameEn || 'Service SLA',
          responseHours: defaults.priority === 'urgent' ? 1 : defaults.priority === 'high' ? 2 : defaults.priority === 'low' ? 24 : 8,
          resolutionHours: defaults.priority === 'urgent' ? 4 : defaults.priority === 'high' ? 8 : defaults.priority === 'low' ? 72 : 24,
          escalationMinutes: defaults.priority === 'urgent' ? 30 : defaults.priority === 'high' ? 120 : defaults.priority === 'low' ? 480 : 240,
          guidance: t('slaCalculatedFromDefaults', 'Calculated from the selected service defaults.'),
        } : null);
      } finally {
        setServiceSlaLoading(false);
      }
    };
    loadSla();
  }, [formData.category, formData.service?.id, formData.priority]);

  useEffect(() => {
    const loadRecentTickets = async () => {
      setRecentTicketsLoading(true);
      try {
        const res = await ticketsAPI.getAll();
        const tickets = Array.isArray(res?.data) ? res.data : [];
        const sorted = [...tickets].sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));
        setRecentTickets(sorted.slice(0, 5));
      } catch {
        setRecentTickets([]);
      } finally {
        setRecentTicketsLoading(false);
      }
    };

    loadRecentTickets();
  }, []);

  useEffect(() => {
    if (!draftHydrated || !portalIncidentMode) return;
    setCurrentStep(0);
    setFormData((prev) => ({
      ...portalIncidentDefaults,
      employee: prev?.employee || null,
      attachments: [],
    }));
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData: portalIncidentDefaults, currentStep: 0 }));
  }, [draftHydrated, portalIncidentMode, portalIncidentDefaults]);

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const applyServiceDefaults = (service) => {
    const defaults = serviceDefaults(service?.id);
    setFormData((prev) => ({
      ...prev,
      service,
      priority: defaults?.priority || prev.priority,
      impact: defaults?.impact || prev.impact,
      urgency: defaults?.urgency || prev.urgency,
      department: resolveDepartmentLabel(defaults?.department) || prev.department,
    }));
    setErrors((prev) => ({ ...prev, service: '' }));
  };

  const applyPreset = (preset) => {
    setFormData({
      ...initialFormData,
      module: preset.module,
      category: preset.category,
      service: preset.service,
      subject: preset.subject,
      description: preset.description,
      priority: preset.priority,
      impact: preset.impact,
      urgency: preset.urgency,
      department: resolveDepartmentLabel(preset.department) || preset.department,
    });
    setErrors({});
    setCurrentStep(3);
  };

  const getValidationErrors = (step) => {
    const nextErrors = {};
    if (step === 0) {
      if (!formData.module) nextErrors.module = t('errorChooseModule', 'Choose a module.');
      if (!formData.category) nextErrors.category = t('errorChooseCategory', 'Choose a category.');
      if (!formData.service?.id) nextErrors.service = t('errorChooseService', 'Choose a service.');
    }
    if (step === 1) {
      if (!formData.subject.trim()) nextErrors.subject = t('errorAddTitle', 'Add a title.');
      if (!formData.description.trim() || formData.description.trim().length < 20) nextErrors.description = t('errorAddCharacters', 'Add at least 20 characters.');
    }
    if (step === 2) {
      if (!formData.priority) nextErrors.priority = t('errorSelectPriority', 'Select priority.');
      if (!formData.impact) nextErrors.impact = t('errorSelectImpact', 'Select impact.');
      if (!formData.urgency) nextErrors.urgency = t('errorSelectUrgency', 'Select urgency.');
      if (!formData.department) nextErrors.department = t('errorSelectDepartment', 'Select department.');
    }
    return nextErrors;
  };

  const validateAll = () => {
    const nextErrors = {
      ...getValidationErrors(0),
      ...getValidationErrors(1),
      ...getValidationErrors(2),
    };
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = () => {
    const nextErrors = getValidationErrors(currentStep);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
      const form = document.querySelector('form');
      if (form) {
        const rect = form.getBoundingClientRect();
        window.scrollTo({ top: rect.top + window.scrollY - 70, behavior: 'smooth' });
      }
    }
  };
  const previousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    const form = document.querySelector('form');
    if (form) {
      const rect = form.getBoundingClientRect();
      window.scrollTo({ top: rect.top + window.scrollY - 70, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    const resetFormData = portalIncidentMode
      ? { ...initialFormData, ...getPortalIncidentDefaults() }
      : initialFormData;
    setFormData(resetFormData);
    setErrors({});
    setCurrentStep(0);
    setCreatedTicketId(null);
    setGeneratedTicketId(null);
    setShowSuccessModal(false);
    setDraftSaved(false);
    setServiceSla(null);
    localStorage.removeItem(DRAFT_KEY);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      setCurrentStep(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setIsSubmitting(true);
    try {
      const urgency = toDecimalScale(formData.urgency, urgencyScaleMap);
      const impact = toDecimalScale(formData.impact, impactScaleMap);
      const response = await ticketsAPI.create({
        title: formData.subject.trim(),
        description: formData.description.trim(),
        priority: priorityLabelMap[formData.priority] || 'Medium',
        category: formData.category,
        department: formData.department || selectedDepartmentLabel || resolveDepartmentLabel(TICKET_DEPARTMENT_KEYS.IT),
        dueDate: formData.dueDate || null,
        requestedById: formData.employee?.id ? Number(formData.employee.id) : null,
        urgency,
        impact,
      });
      const ticketId = response?.data?.id;
      setGeneratedTicketId(response?.data?.ticketNumber || (ticketId ? `TKT-${ticketId}` : 'TKT'));
      setCreatedTicketId(ticketId);
      setShowSuccessModal(true);
      localStorage.removeItem(DRAFT_KEY);
    } catch (err) {
      console.error('Failed to create ticket:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate(createdTicketId ? `/ticket-details/${createdTicketId}` : '/ticket-details');
  };

  const renderCard = (title, description, icon, children) => (
    <section className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-elevation-1">
      <div className={`flex items-start gap-3 mb-4`}>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon name={icon} size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );

  const progressPct = ((currentStep + 1) / steps.length) * 100;
  const templateHint = formData.service?.id === 'am-reset-password'
    ? t('hintResetPassword', 'Mention identity verification and lockout details.')
    : formData.service?.id === 'sr-onboarding'
      ? t('hintOnboarding', 'Include start date, equipment, and access needs.')
      : formData.service?.id === 'noc-service'
        ? t('hintNocService', 'Include affected locations and start time.')
        : null;
  const duplicateTickets = recentTickets.filter((ticket) => {
    const title = String(ticket?.title || ticket?.subject || '').trim().toLowerCase();
    const query = String(formData.subject || '').trim().toLowerCase();
    if (!query || !title) return false;
    return title === query || title.includes(query) || query.includes(title);
  });
  const selectedRecentTickets = recentTickets.filter((ticket) => {
    const sameCategory = !formData.category || String(ticket?.category || '').toLowerCase() === String(formData.category || '').toLowerCase();
    return sameCategory;
  });

  return (
    <>
      <Helmet>
        <title>{t('createNewTicket', 'Create Ticket')} - ITSM Hub</title>
        <meta name="description" content="Create tickets quickly with presets, autosave, and guided review." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />
        <BreadcrumbTrail />

        <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="space-y-6 md:space-y-8">
            <section className="rounded-xl border border-border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-4 py-4 md:px-5 md:py-5 shadow-elevation-1">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className={`space-y-3`}>
                  <div className={`inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary `}>
                    <Icon name="Sparkles" size={14} />
                    {t('fastTicketFlow', 'Fast ticket flow')}
                  </div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">{t('createNewTicketFaster', 'Create New Ticket Faster')}</h1>
                  <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                    {t('ticketFlowDescription', 'Use presets, auto-filled defaults, and a short review step to get tickets in faster with less effort.')}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-border bg-card/70 px-3 py-2"><div className="text-xs text-muted-foreground">{t('step', 'Step')}</div><div className="text-lg font-semibold text-foreground">{currentStep + 1}/4</div></div>
                  <div className="rounded-xl border border-border bg-card/70 px-3 py-2"><div className="text-xs text-muted-foreground">{t('draft', 'Draft')}</div><div className="text-lg font-semibold text-foreground">{draftSaved ? t('saved', 'Saved') : t('ready', 'Ready')}</div></div>
                  <div className="rounded-xl border border-border bg-card/70 px-3 py-2"><div className="text-xs text-muted-foreground">{t('mode', 'Mode')}</div><div className="text-lg font-semibold text-foreground">{t('fast', 'Fast')}</div></div>
                </div>
              </div>
            </section>

            <ManageEngineOnPremSnapshot
              compact
              title={t('manageEngineTicketIntakeContext', 'ManageEngine Ticket Intake Context')}
              description={t('manageEngineTicketIntakeContextDesc', 'ServiceDesk catalog and requests plus OpManager 12.8.270 alerts provide on-prem context before users submit a new ticket.')}
            />

            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] items-start">
              <aside className="space-y-6">
                <section className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-elevation-1">
                  <div className={`flex items-center justify-between gap-3 mb-4 `}>
                    <div className={'text-left'}>
                      <h2 className="text-base font-semibold text-foreground">{t('steps', 'Steps')}</h2>
                      <p className="text-xs text-muted-foreground">{t('followFlow', 'Follow the flow from top to bottom.')}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{currentStep + 1} of 4</div>
                  </div>
                  <div className="space-y-3">
                    {steps.map((step, index) => {
                      const active = index === currentStep;
                      const complete = index < currentStep;
                      return (
                        <button
                          key={step.label}
                          type="button"
                          onClick={() => setCurrentStep(index)}
                          className={`w-full rounded-xl border p-3 text-left transition-all ${
                            active
                              ? 'border-primary bg-primary/10 shadow-elevation-2'
                              : complete
                                ? 'border-success/30 bg-success/5 hover:border-success/50'
                                : 'border-border bg-background hover:border-primary/30'
                          }`}
                        >
                          <div className={`flex items-start gap-3 `}>
                            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                              active
                                ? 'bg-primary text-primary-foreground'
                                : complete
                                  ? 'bg-success text-success-foreground'
                                  : 'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <div className={`min-w-0 text-left`}>
                              <div className="text-sm font-semibold text-foreground">{t(step.label, step.label)}</div>
                              <div className="text-xs text-muted-foreground">{t(step.description, step.description)}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-elevation-1">
                  <h3 className={`text-base md:text-lg font-semibold text-foreground mb-4 flex items-center gap-2 `}>
                    <Icon name="Zap" size={18} className="text-primary" />
                    {t('quickSummary', 'Quick Summary')}
                  </h3>
                  <div className="space-y-3">
                    {[
                      [t('category', 'Category'), formData.category || '-'],
                      [t('service', 'Service'), formData.service?.nameEn || '-'],
                      [t('assignedTo', 'Assigned To'), formData.employee?.name || '-'],
                      [t('selectPriority', 'Priority'), selectedPriorityLabel],
                      [t('impact', 'Impact'), selectedImpactLabel],
                      [t('urgency', 'Urgency'), selectedUrgencyLabel],
                      [t('department', 'Department'), selectedDepartmentLabel],
                      [t('files', 'Files'), `${formData.attachments.length}`],
                    ].map(([label, value]) => (
                      <div key={label} className={`flex items-start justify-between gap-4 py-2 px-2 rounded-lg hover:bg-background/50 transition-colors `}>
                        <span className="text-xs font-medium text-muted-foreground">{label}</span>
                        <span className={`text-xs font-semibold text-foreground break-words max-w-[140px] text-left`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-elevation-1">
                  <div className={`flex items-center gap-3 mb-4 `}>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon name="Sparkles" size={20} className="text-primary" />
                    </div>
                    <div className={'text-left'}>
                      <h3 className="text-base font-semibold text-foreground">{t('fastFeatures', 'Fast features')}</h3>
                      <p className="text-xs text-muted-foreground">{t('builtIntoNewFlow', 'Built into the new flow')}</p>
                    </div>
                  </div>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className={`flex items-start gap-2 ${isRtl ? 'flex-row-reverse text-left' : ''}`}><Icon name="Check" size={16} className="mt-0.5 text-success" /> {t('quickPresetsCommon', 'Quick presets for common tickets')}</li>
                    <li className={`flex items-start gap-2 ${isRtl ? 'flex-row-reverse text-left' : ''}`}><Icon name="Check" size={16} className="mt-0.5 text-success" /> {t('draftAutosaveDisplay', 'Draft autosave in the browser')}</li>
                    <li className={`flex items-start gap-2 ${isRtl ? 'flex-row-reverse text-left' : ''}`}><Icon name="Check" size={16} className="mt-0.5 text-success" /> {t('routingSlaPreview', 'Routing and SLA preview')}</li>
                    <li className={`flex items-start gap-2 ${isRtl ? 'flex-row-reverse text-left' : ''}`}><Icon name="Check" size={16} className="mt-0.5 text-success" /> {t('reviewStepBefore', 'Review step before submit')}</li>
                    <li className={`flex items-start gap-2 ${isRtl ? 'flex-row-reverse text-left' : ''}`}><Icon name="Check" size={16} className="mt-0.5 text-success" /> {t('recentTicketReuse', 'Recent-ticket reuse and duplicate warnings')}</li>
                  </ul>
                </section>
              </aside>

              <div className="space-y-6">
                {!portalIncidentMode && (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowQuickStart((prev) => !prev)}
                      className={`inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary transition-colors `}
                    >
                      <Icon name="Zap" size={16} className="text-primary" />
                      {showQuickStart ? t('hideQuickStart', 'Hide Quick Start') : t('showQuickStart', 'Show Quick Start')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRecentTickets((prev) => !prev)}
                      className={`inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary transition-colors `}
                    >
                      <Icon name="RotateCcw" size={16} className="text-primary" />
                      {showRecentTickets ? t('hideRecentTickets', 'Hide Recent Tickets') : t('showRecentTickets', 'Show Recent Tickets')}
                    </button>
                  </div>
                )}

                {!portalIncidentMode && showQuickStart && (
                  <>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
                    </div>
                    <TicketQuickPresetGrid
                      presets={quickPresets}
                      onSelect={applyPreset}
                      title={t('quickStart', 'Quick Start')}
                      description={t('quickStartDesc', 'Pick a common ticket type and skip most of the setup.')}
                      progressLabel={`${progressPct.toFixed(0)}% ${t('complete', 'complete')}`}
                    />
                  </>
                )}

                {!portalIncidentMode && showRecentTickets && (
                  <TicketRecentReusePanel
                    tickets={selectedRecentTickets}
                    loading={recentTicketsLoading}
                    title={t('recentTickets', 'Recent Tickets')}
                    description={t('recentTicketsDesc', 'Reuse a recent request as a starting point.')}
                    emptyLabel={t('noRecentTickets', 'No recent tickets to reuse yet.')}
                    onSelect={(ticket) => applyPreset({
                      title: ticket?.title || 'Recent ticket',
                      module: formData.module || 'it-support',
                      category: ticket?.category || formData.category,
                      service: formData.service || null,
                      subject: ticket?.title || '',
                      description: ticket?.description || '',
                      priority: (String(ticket?.priority || '').toLowerCase() || formData.priority || 'medium'),
                      impact: formData.impact || 'medium',
                      urgency: formData.urgency || 'medium',
                      department: formData.department || 'it',
                    })}
                  />
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {currentStep === 0 && renderCard(t('step1Scope', 'Step 1 - Scope'), t('chooseModuleCategoryService', 'Choose the module, category, and service.'), 'Layers3', (
                    <div className="space-y-3">
                      <CategorySelector
                        isReadOnly={portalIncidentMode}
                        selectedModule={formData.module}
                        onModuleChange={(module) => {
                          if (portalIncidentMode) return;
                          setFormData((prev) => ({ ...initialFormData, module, employee: prev.employee }));
                          setErrors((prev) => ({ ...prev, module: '', category: '', service: '' }));
                        }}
                        selectedCategory={formData.category}
                        onCategoryChange={(category) => {
                          if (portalIncidentMode) return;
                          setFormData((prev) => ({ ...prev, category, service: null, priority: '', impact: '', urgency: '', department: '' }));
                          setErrors((prev) => ({ ...prev, category: '', service: '' }));
                        }}
                        selectedService={formData.service}
                        onServiceSelect={(service) => {
                          if (portalIncidentMode) return;
                          applyServiceDefaults(service);
                        }}
                      />
                      {errors.module && <p className="text-sm text-error">{errors.module}</p>}
                      {errors.category && <p className="text-sm text-error">{errors.category}</p>}
                      {errors.service && <p className="text-sm text-error">{errors.service}</p>}
                    </div>
                  ))}

                  {currentStep === 1 && renderCard(t('step2Details', 'Step 2 - Details'), t('addTitleDescriptionPerson', 'Add the title, description, and the person affected.'), 'FileText', (
                    <div className="space-y-4">
                      <EmployeeLookup selectedEmployee={formData.employee} onEmployeeSelect={(employee) => setField('employee', employee)} />
                      <Input label={t('subject', 'Title')} type="text" placeholder={t('titlePlaceholder', 'Short, action-oriented title')} value={formData.subject} onChange={(e) => setField('subject', e.target.value)} required error={errors.subject} />
                      <TicketDuplicateSuggestions
                        tickets={duplicateTickets.slice(0, 3)}
                        title={t('possibleDuplicate', 'Possible duplicate detected')}
                        description={t('duplicateWarning', 'We found similar recent tickets. Reusing one can save a few steps.')}
                        openLabel={t('open', 'Open')}
                        untitledLabel={t('untiledTicket', 'Untitled ticket')}
                        onOpen={(ticket) => navigate(ticket?.id ? `/ticket-details/${ticket.id}` : '/ticket-management-center')}
                      />
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2" dir={isRtl ? 'rtl' : 'ltr'}>
                          {t('description', 'Description')} <span className="text-error">*</span>
                        </label>
                        <textarea value={formData.description} onChange={(e) => setField('description', e.target.value)} placeholder={t('descriptionPlaceholder', 'What happened, who is affected, and what should happen next?')} rows={6} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background resize-none" />
                        {errors.description && <p className="text-sm text-error mt-2">{errors.description}</p>}
                        {templateHint && <p className="text-xs text-muted-foreground mt-2">{t('hint', 'Hint')}: {templateHint}</p>}
                      </div>
                      <DatePickerInput label={t('dueDate', 'Due Date')} value={formData.dueDate} onChange={(value) => setField('dueDate', value)} />
                    </div>
                  ))}

                  {currentStep === 2 && renderCard(t('step3Priority', 'Step 3 - Priority'), t('setUrgencyImpactRouting', 'Set urgency, impact, and the routing details.'), 'AlertCircle', (
                    <div className="space-y-4">
                      <div className={`flex items-center justify-between gap-3 `}>
                        <div className={'text-left'}><h3 className="text-sm font-semibold text-foreground">{t('advancedControls', 'Advanced controls')}</h3><p className="text-xs text-muted-foreground">{t('advancedControlsDesc', 'Keep these open for full control or hide them for a simpler flow.')}</p></div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setAdvancedOpen((prev) => !prev)}>{advancedOpen ? t('hide', 'Hide') : t('show', 'Show')}</Button>
                      </div>
                      {advancedOpen && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select label={t('selectPriority', 'Priority')} placeholder={t('selectPriority', 'Select Priority')} options={priorityOptions} value={formData.priority} onChange={(value) => setField('priority', value)} error={errors.priority} />
                            <Select label={t('impact', 'Impact')} placeholder={t('selectImpact', 'Select Impact')} options={impactOptions} value={formData.impact} onChange={(value) => setField('impact', value)} error={errors.impact} />
                            <Select label={t('urgency', 'Urgency')} placeholder={t('selectUrgency', 'Select Urgency')} options={urgencyOptions} value={formData.urgency} onChange={(value) => setField('urgency', value)} error={errors.urgency} />
                          </div>
                          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3">
                            <p className="text-xs text-muted-foreground">
                              {t('departmentAutoSet', 'Department is set automatically from the selected category and service.')}
                            </p>
                            <p className="mt-1 text-sm font-medium text-foreground">{selectedDepartmentLabel}</p>
                          </div>
                        </>
                      )}
                      <FileUploader attachments={formData.attachments} onAttachmentsChange={(attachments) => setField('attachments', attachments)} />
                      {formData.category && formData.priority && <RoutingPreview category={formData.category} priority={formData.priority} subject={formData.subject} />}
                      {(formData.category || formData.service) && (
                        <div className="bg-card border border-border rounded-xl p-4">
                          <div className={`flex items-center gap-3 mb-3 `}>
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center"><Icon name="Clock3" size={20} className="text-indigo-500" /></div><div><h3 className="text-base font-semibold text-foreground">{t('serviceSla', 'Service SLA')}</h3><p className="text-xs text-muted-foreground">{t('liveSlaGuidance', 'Live SLA guidance for the selected service')}</p></div></div>
                          {serviceSlaLoading ? <p className="text-sm text-muted-foreground">{t('loadingSlaGuidance', 'Loading SLA guidance...')}</p> : serviceSla ? (
                            <div className="space-y-3">
                              <div className="rounded-lg bg-muted p-3"><div className="text-xs uppercase tracking-wider text-muted-foreground">{t('policy', 'Policy')}</div><div className="font-semibold text-foreground">{serviceSla.policyName}</div></div>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-lg bg-muted p-3"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('response', 'Response')}</div><div className="font-semibold text-foreground">{serviceSla.responseHours}h</div></div>
                                <div className="rounded-lg bg-muted p-3"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('resolution', 'Resolution')}</div><div className="font-semibold text-foreground">{serviceSla.resolutionHours}h</div></div>
                                <div className="rounded-lg bg-muted p-3"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('escalate', 'Escalate')}</div><div className="font-semibold text-foreground">{serviceSla.escalationMinutes}m</div></div>
                              </div>
                              <p className="text-sm text-muted-foreground">{serviceSla.guidance}</p>
                            </div>
                          ) : <p className="text-sm text-muted-foreground">{t('pickServiceSla', 'Pick a service to see the SLA guidance.')}</p>}
                        </div>
                      )}
                    </div>
                  ))}

                  {currentStep === 3 && renderCard(t('step4Review', 'Step 4 - Review'), t('confirmTicketBeforeSubmit', 'Confirm the ticket before you submit it.'), 'CheckCircle2', (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          [t('module', 'Module'), formData.module || '-'],
                          [t('category', 'Category'), formData.category || '-'],
                          [t('service', 'Service'), formData.service?.nameEn || '-'],
                          [t('employee', 'Employee'), formData.employee?.name || formData.employee?.username || '-'],
                          [t('selectPriority', 'Priority'), selectedPriorityLabel],
                          [t('impact', 'Impact'), selectedImpactLabel],
                          [t('urgency', 'Urgency'), selectedUrgencyLabel],
                          [t('department', 'Department'), selectedDepartmentLabel],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-xl border border-border bg-muted/40 p-3"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div><div className="mt-1 text-sm font-semibold text-foreground break-words">{value}</div></div>
                        ))}
                      </div>
                      <div className="rounded-xl border border-border bg-muted/40 p-3"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('title', 'Title')}</div><div className="mt-1 text-sm font-semibold text-foreground">{formData.subject || '-'}</div></div>
                      <div className="rounded-xl border border-border bg-muted/40 p-3"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('description', 'Description')}</div><div className="mt-1 text-sm text-foreground whitespace-pre-wrap">{formData.description || '-'}</div></div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setCurrentStep(1)}>{t('editDetails', 'Edit details')}</Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setCurrentStep(2)}>{t('editPriority', 'Edit priority')}</Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => navigator.clipboard?.writeText(`${formData.subject}\n\n${formData.description}`)}>
                          {t('copySummary', 'Copy summary')}
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    {currentStep > 0 ? <Button type="button" variant="outline" size="lg" onClick={previousStep} iconName="ArrowRight" iconPosition="right">{t('back', 'Back')}</Button> : <Button type="button" variant="outline" size="lg" onClick={handleReset} iconName="RotateCcw" iconPosition="left">{t('reset', 'Reset')}</Button>}
                  {currentStep < 3 ? <Button type="button" variant="default" size="lg" onClick={nextStep} iconName="ArrowLeft" iconPosition="left" className={isRtl ? 'sm:mr-auto' : 'sm:ml-auto'}>{t('next', 'Next')}</Button> : <Button type="submit" variant="default" size="lg" loading={isSubmitting} iconName="Send" iconPosition="right" className={isRtl ? 'sm:mr-auto' : 'sm:ml-auto'}>{isSubmitting ? t('creating', 'Creating...') : t('createTicket', 'Create Ticket')}</Button>}
                </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <div className="bg-card border border-border rounded-lg shadow-elevation-5 max-w-md w-full p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"><Icon name="CheckCircle2" size={40} color="var(--color-success)" /></div>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">{t('ticketCreatedSuccessfully', 'Ticket Created Successfully!')}</h2>
              <p className="text-sm md:text-base text-muted-foreground mb-4">{t('ticketSubmittedRouted', 'Your ticket has been submitted and routed to the right team.')}</p>
              <div className={`inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg `}><Icon name="Ticket" size={20} color="var(--color-primary)" /><span className="text-lg font-semibold text-primary">{generatedTicketId}</span></div>
            </div>
            <div className="space-y-3">
              <Button variant="default" size="lg" fullWidth onClick={handleModalClose} iconName="Eye" iconPosition="right">{t('viewTicketDetails', 'View Ticket Details')}</Button>
              <Button variant="outline" size="lg" fullWidth onClick={() => { setShowSuccessModal(false); handleReset(); }} iconName="Plus" iconPosition="left">{t('createAnotherTicket', 'Create Another Ticket')}</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TicketCreation;
