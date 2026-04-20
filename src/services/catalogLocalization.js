import { formatLocalizedValue } from './displayValue';

export const getLocalizedField = (item, fieldName, fallbackMap = {}, preferredLanguage = 'en') => {
  if (!item) {
    return '';
  }

  const language = String(preferredLanguage || 'en').toLowerCase();
  const rawValue = item?.[fieldName];
  const localizedFieldName = `${fieldName}Ar`;
  const localizedValue = item?.[localizedFieldName];

  const backendLocalizedValue =
    localizedValue !== undefined && localizedValue !== null && localizedValue !== ''
      ? { en: rawValue, ar: localizedValue }
      : rawValue;

  const formattedValue = formatLocalizedValue(backendLocalizedValue, language);
  if (formattedValue) {
    return formattedValue;
  }

  const fallbackKey = String(rawValue || '').trim().toLowerCase();
  return fallbackMap[fallbackKey] || String(rawValue || '').trim();
};

export const CATALOG_CATEGORY_LABELS_AR = {
  'technical support': 'الدعم الفني',
  'service desk': 'مكتب الخدمة',
  'access management': 'إدارة الوصول',
  'security operations': 'عمليات الأمن',
  'asset management': 'إدارة الأصول',
  'it asset team': 'فريق أصول تقنية المعلومات',
  'change management': 'إدارة التغيير',
  'change advisory board': 'مجلس استشاري التغيير',
  'cyber security': 'الأمن السيبراني',
  'security team': 'فريق الأمن',
  'hr services': 'خدمات الموارد البشرية',
  'hr shared services': 'الخدمات المشتركة للموارد البشرية',
  'finance & erp': 'المالية وERP',
  'finance applications': 'تطبيقات المالية',
  facilities: 'المرافق',
  'facilities operations': 'عمليات المرافق',
  'incident management': 'إدارة الحوادث',
  'incident commander': 'قائد الحادثة',
  'knowledge base': 'قاعدة المعرفة',
  'knowledge team': 'فريق المعرفة',
  'service requests': 'طلبات الخدمة',
  'fulfillment team': 'فريق التنفيذ',
  'software licensing': 'ترخيص البرمجيات',
  'software asset team': 'فريق أصول البرمجيات',
};

export const CATALOG_SERVICE_NAMES_AR = {
  'technical support': 'الدعم الفني',
  'access management': 'إدارة الوصول',
  'asset management': 'إدارة الأصول',
  'change management': 'إدارة التغيير',
  'cyber security': 'الأمن السيبراني',
  'hr services': 'خدمات الموارد البشرية',
  'finance & erp': 'المالية وERP',
  facilities: 'المرافق',
  'incident management': 'إدارة الحوادث',
  'knowledge base': 'قاعدة المعرفة',
  'service requests': 'طلبات الخدمة',
  'software licensing': 'ترخيص البرمجيات',
};

export const CATALOG_SERVICE_DESCRIPTIONS_AR = {
  'device, email, printer, and network connectivity issues.': 'مشكلات الأجهزة والبريد والطابعات واتصال الشبكة.',
  'password resets, account unlocks, mfa, vpn, and permissions.': 'إعادة تعيين كلمات المرور، فتح الحسابات، المصادقة متعددة العوامل، VPN، والصلاحيات.',
  'register, transfer, audit, and dispose assets.': 'تسجيل الأصول ونقلها ومراجعتها والتخلص منها.',
  'planned changes, configs, deployment, rollback.': 'التغييرات المخططة والإعدادات والنشر والتراجع.',
  'phishing, breach, vpn, usb, antivirus, suspicious links.': 'التصيد، الاختراق، VPN، USB، مضاد الفيروسات، والروابط المشبوهة.',
  'leave, attendance, onboarding, and employee request support.': 'دعم الإجازات والحضور والتهيئة وطلبات الموظفين.',
  'erp, procurement, finance, reporting, and data corrections.': 'ERP والمشتريات والمالية والتقارير وتصحيح البيانات.',
  'meeting rooms, car services, maintenance and phone services.': 'غرف الاجتماعات، خدمات السيارات، الصيانة، وخدمات الهاتف.',
  'major incidents, outages, data loss and security incidents.': 'الحوادث الكبرى والانقطاعات وفقدان البيانات والحوادث الأمنية.',
  'article creation, updates and access requests.': 'إنشاء المقالات وتحديثها وطلبات الوصول.',
  'equipment, software, onboarding and workspace requests.': 'طلبات الأجهزة والبرامج وتهيئة الموظفين ومساحات العمل.',
  'new, renew, transfer, revoke and audit licenses.': 'إصدار التراخيص وتجديدها ونقلها وإلغاؤها وتدقيقها.',
};

export const CATALOG_EXTERNAL_STATUS_LABELS_AR = {
  active: 'نشط',
  pending: 'قيد الانتظار',
  closed: 'مغلق',
  resolved: 'محلول',
};

export const CATALOG_EXTERNAL_PRIORITY_LABELS_AR = {
  urgent: 'عاجل',
  high: 'مرتفع',
  medium: 'متوسط',
  low: 'منخفض',
};
