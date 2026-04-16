import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const LANGUAGE_STORAGE_KEYS = ['preferredLanguage', 'language', 'lang'];

const normalizeLanguage = (value) => {
  const language = String(value || 'en').trim().toLowerCase();
  return language.startsWith('ar') ? 'ar' : 'en';
};

const getStoredLanguage = () => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const storedLanguage = LANGUAGE_STORAGE_KEYS
    .map((key) => window.localStorage.getItem(key))
    .find(Boolean);

  return normalizeLanguage(storedLanguage || 'en');
};

const LanguageContext = createContext({
  language: 'en',
  isRtl: false,
  setLanguage: () => {},
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(getStoredLanguage);
  const isRtl = language === 'ar';

  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    root.dir = isRtl ? 'rtl' : 'ltr';
    root.dataset.language = language;
    root.classList.toggle('rtl', isRtl);
    root.classList.toggle('lang-ar', isRtl);
    root.classList.toggle('lang-en', !isRtl);
    document.body?.classList.toggle('rtl', isRtl);

    try {
      LANGUAGE_STORAGE_KEYS.forEach((key) => window.localStorage.setItem(key, language));
      window.dispatchEvent(new CustomEvent('itsm:language-change', {
        detail: { language, isRtl },
      }));
    } catch {
      // Ignore storage failures in restricted environments.
    }
  }, [isRtl, language]);

  const value = useMemo(() => ({
    language,
    isRtl,
    setLanguage: (nextLanguage) => setLanguageState(normalizeLanguage(nextLanguage)),
  }), [isRtl, language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
