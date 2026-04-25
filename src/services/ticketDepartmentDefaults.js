export const TICKET_DEPARTMENT_KEYS = {
  IT: 'it',
  NETWORK: 'network',
  SECURITY: 'security',
  APPLICATION: 'application',
  HR: 'hr',
  FACILITIES: 'facilities',
};

const SERVICE_DEFAULT_MAP = {
  'am-reset-password': { priority: 'high', impact: 'high', urgency: 'high', department: TICKET_DEPARTMENT_KEYS.IT },
  'am-new-account': { priority: 'medium', impact: 'medium', urgency: 'medium', department: TICKET_DEPARTMENT_KEYS.IT },
  'ts-new-device': { priority: 'medium', impact: 'medium', urgency: 'medium', department: TICKET_DEPARTMENT_KEYS.IT },
  'ts-network-connection': { priority: 'urgent', impact: 'critical', urgency: 'immediate', department: TICKET_DEPARTMENT_KEYS.NETWORK },
  'noc-service': { priority: 'high', impact: 'high', urgency: 'high', department: TICKET_DEPARTMENT_KEYS.NETWORK },
  'noc-ports': { priority: 'high', impact: 'high', urgency: 'high', department: TICKET_DEPARTMENT_KEYS.NETWORK },
  'cs-data-breach': { priority: 'urgent', impact: 'critical', urgency: 'immediate', department: TICKET_DEPARTMENT_KEYS.SECURITY },
  'sr-onboarding': { priority: 'high', impact: 'high', urgency: 'high', department: TICKET_DEPARTMENT_KEYS.IT },
  'sr-offboarding': { priority: 'urgent', impact: 'critical', urgency: 'immediate', department: TICKET_DEPARTMENT_KEYS.IT },
};

const localizedValue = (value, language = 'en') => {
  if (!value || typeof value !== 'object') {
    return value || '';
  }

  if (language === 'ar') {
    return value.ar || value.en || '';
  }

  return value.en || value.ar || '';
};

export const getTicketServiceDefaults = (serviceId) => {
  if (!serviceId) {
    return null;
  }

  if (SERVICE_DEFAULT_MAP[serviceId]) {
    return SERVICE_DEFAULT_MAP[serviceId];
  }

  if (serviceId.startsWith('cs-')) {
    return { priority: 'high', impact: 'high', urgency: 'high', department: TICKET_DEPARTMENT_KEYS.SECURITY };
  }

  if (serviceId.startsWith('noc-') || serviceId.startsWith('net-')) {
    return { priority: 'high', impact: 'high', urgency: 'high', department: TICKET_DEPARTMENT_KEYS.NETWORK };
  }

  if (serviceId.startsWith('dev-') || serviceId.startsWith('qa-') || serviceId.startsWith('dt-')) {
    return { priority: 'medium', impact: 'medium', urgency: 'medium', department: TICKET_DEPARTMENT_KEYS.APPLICATION };
  }

  if (serviceId.startsWith('hr') || serviceId.startsWith('ehr-') || serviceId.startsWith('hrs-')) {
    return { priority: 'medium', impact: 'medium', urgency: 'medium', department: TICKET_DEPARTMENT_KEYS.HR };
  }

  if (serviceId.startsWith('ms-')) {
    return { priority: 'medium', impact: 'medium', urgency: 'medium', department: TICKET_DEPARTMENT_KEYS.FACILITIES };
  }

  return { priority: 'medium', impact: 'medium', urgency: 'medium', department: TICKET_DEPARTMENT_KEYS.IT };
};

export const TICKET_QUICK_PRESETS = [
  {
    id: 'password-reset',
    title: { en: 'Password reset', ar: 'إعادة تعيين كلمة المرور' },
    module: 'it-support',
    category: 'access-management',
    managementCenterCategory: 'access-request',
    service: { id: 'am-reset-password', nameEn: 'Password Reset Request', nameAr: 'طلب إعادة تعيين كلمة المرور' },
    subject: { en: 'Reset password request', ar: 'طلب إعادة تعيين كلمة المرور' },
    description: {
      en: 'The user cannot access the account and needs a verified password reset.',
      ar: 'المستخدم غير قادر على الوصول إلى الحساب ويحتاج إلى إعادة تعيين موثقة لكلمة المرور.',
    },
    priority: 'high',
    impact: 'high',
    urgency: 'high',
    department: TICKET_DEPARTMENT_KEYS.IT,
  },
  {
    id: 'new-device',
    title: { en: 'New device', ar: 'جهاز جديد' },
    module: 'it-support',
    category: 'technical-support',
    managementCenterCategory: 'asset-request',
    service: { id: 'ts-new-device', nameEn: 'Request New Device', nameAr: 'طلب جهاز جديد' },
    subject: { en: 'Request new device', ar: 'طلب جهاز جديد' },
    description: {
      en: 'Provide a replacement or new device so the user can continue work without delay.',
      ar: 'توفير جهاز بديل أو جديد حتى يتمكن المستخدم من متابعة العمل دون تأخير.',
    },
    priority: 'medium',
    impact: 'medium',
    urgency: 'medium',
    department: TICKET_DEPARTMENT_KEYS.IT,
  },
  {
    id: 'network-outage',
    title: { en: 'Network outage', ar: 'انقطاع الشبكة' },
    module: 'dg-assistant',
    category: 'noc-requests',
    managementCenterCategory: 'general-inquiry',
    service: { id: 'noc-service', nameEn: 'Request NOC Service', nameAr: 'طلب خدمة مركز الشبكة' },
    subject: { en: 'Network connectivity issue', ar: 'مشكلة في الاتصال بالشبكة' },
    description: {
      en: 'There are reports of network interruption or major instability that need urgent investigation.',
      ar: 'توجد بلاغات عن انقطاع أو تذبذب كبير في الشبكة وتحتاج إلى متابعة عاجلة.',
    },
    priority: 'urgent',
    impact: 'critical',
    urgency: 'immediate',
    department: TICKET_DEPARTMENT_KEYS.NETWORK,
  },
];

export const getTicketQuickPresetById = (presetId) =>
  TICKET_QUICK_PRESETS.find((preset) => preset?.id === presetId) || null;

export const getLocalizedTicketQuickPreset = (preset, language = 'en') => ({
  ...preset,
  title: localizedValue(preset?.title, language),
  subject: localizedValue(preset?.subject, language),
  description: localizedValue(preset?.description, language),
  service: preset?.service
    ? {
        ...preset.service,
        name: localizedValue(
          {
            en: preset.service?.nameEn,
            ar: preset.service?.nameAr,
          },
          language,
        ),
      }
    : null,
});

export const getLocalizedTicketQuickPresetById = (presetId, language = 'en') => {
  const preset = getTicketQuickPresetById(presetId);
  return preset ? getLocalizedTicketQuickPreset(preset, language) : null;
};
