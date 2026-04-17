import { en } from './translations/en';
import { ar } from './translations/ar';

const TRANSLATIONS = {
  en,
  ar
};

export const getTranslation = (language, key, fallback = key) => {
  const normalized = String(language || 'en').toLowerCase().startsWith('ar') ? 'ar' : 'en';
  return TRANSLATIONS[normalized]?.[key] || fallback;
};

export const getDirection = (language) =>
  String(language || 'en').toLowerCase().startsWith('ar') ? 'rtl' : 'ltr';
