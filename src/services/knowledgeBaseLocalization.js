import { formatLocalizedValue } from './displayValue';

const ARTICLE_TRANSLATIONS = {
  'Resetting VPN and MFA Access': {
    title: 'إعادة ضبط الوصول إلى VPN وMFA',
    summary: 'استعادة خطوة بخطوة لمشاكل المصادقة على VPN وتسجيل المصادقة متعددة العوامل.',
    content: 'استعادة خطوة بخطوة لمشاكل المصادقة على VPN وتسجيل المصادقة متعددة العوامل.',
    category: 'الوصول',
  },
  'Printer and Driver Troubleshooting': {
    title: 'استكشاف أعطال الطابعة والتعريفات',
    summary: 'حل أعطال قائمة الطباعة والتعريفات وخدمة spooler الشائعة بسرعة.',
    content: 'حل أعطال قائمة الطباعة والتعريفات وخدمة spooler الشائعة بسرعة.',
    category: 'الأجهزة',
  },
  'Software Access Request Checklist': {
    title: 'قائمة التحقق لطلب الوصول إلى البرامج',
    summary: 'أدنى خطوات الاعتماد والتحقق قبل إسناد ترخيص تطبيق.',
    content: 'أدنى خطوات الاعتماد والتحقق قبل إسناد ترخيص تطبيق.',
    category: 'الطلبات',
  },
  'Laptop Replacement Standard': {
    title: 'معيار استبدال الحاسب المحمول',
    summary: 'سياسة طلب الأجهزة البديلة واعتمادها وتسليمها.',
    content: 'سياسة طلب الأجهزة البديلة واعتمادها وتسليمها.',
    category: 'الأصول',
  },
  'Service Desk Escalation Matrix': {
    title: 'مصفوفة تصعيد مكتب الخدمة',
    summary: 'من يملك كل مستوى تصعيد ومتى يتم إشعار الإدارة أو الموردين.',
    content: 'من يملك كل مستوى تصعيد ومتى يتم إشعار الإدارة أو الموردين.',
    category: 'العملية',
  },
};

export const getLocalizedKnowledgeBaseField = (article, field, language) => {
  if (!article) {
    return '';
  }

  const localizedField = `${field}Ar`;
  const fallbackTranslation = ARTICLE_TRANSLATIONS[article?.title];

  if (language === 'ar') {
    const preferredValue = article[localizedField]
      || fallbackTranslation?.[field]
      || fallbackTranslation?.summary
      || fallbackTranslation?.title
      || article[field]
      || article[localizedField];
    return formatLocalizedValue(preferredValue, language);
  }

  const preferredValue = article[field] || article[localizedField];
  const formattedValue = formatLocalizedValue(preferredValue, language);
  if (formattedValue) {
    return formattedValue;
  }

  if (!fallbackTranslation) {
    return '';
  }

  return formatLocalizedValue(fallbackTranslation[field] || fallbackTranslation.summary || fallbackTranslation.title || fallbackTranslation.category, language);
};

export const getLocalizedKnowledgeBaseArticle = (article, language) => ({
  ...article,
  title: getLocalizedKnowledgeBaseField(article, 'title', language),
  summary: getLocalizedKnowledgeBaseField(article, 'summary', language),
  content: getLocalizedKnowledgeBaseField(article, 'content', language),
  categoryLabel: getLocalizedKnowledgeBaseField(article, 'category', language),
});
