import { getTranslation } from './i18n';

const LANGUAGE_KEYS = ['preferredLanguage', 'language', 'lang'];

const SYSTEM_LABEL_KEY_MAP = {
  'critical': 'critical',
  'critical incident': 'criticalIncident',
  'major incident': 'majorIncident',
  'minor incident': 'minorIncident',
  'incident': 'incident',
  'problem': 'problem',
  'change': 'changeRequest',
  'service request': 'serviceRequest',
  'high': 'high',
  'medium': 'medium',
  'low': 'low',
  'urgent': 'urgent',
  'open': 'open',
  'in progress': 'inProgress',
  'assigned': 'assigned',
  'pending': 'pending',
  'resolved': 'resolved',
  'closed': 'closed',
  'unassigned': 'unassigned',
  'requester': 'requester',
  'agent': 'agent',
  'customer': 'customer',
};

const translateSystemLabel = (value, preferredLanguage) => {
  const normalized = String(value || '').trim().toLowerCase();
  const translationKey = SYSTEM_LABEL_KEY_MAP[normalized];
  if (!translationKey) {
    return '';
  }

  return getTranslation(preferredLanguage, translationKey, value);
};

export const getPreferredLanguage = () => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const storedLanguage = LANGUAGE_KEYS
    .map((key) => localStorage.getItem(key))
    .find((value) => Boolean(value));

  return String(storedLanguage || 'en').trim().toLowerCase();
};

const isLocalizedObject = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value) && ('ar' in value || 'en' in value));

const normalizeLanguageCode = (preferredLanguage = getPreferredLanguage()) => {
  const language = String(preferredLanguage || 'en').trim().toLowerCase();
  return language.startsWith('ar') ? 'ar' : 'en';
};

export const formatLocalizedValue = (value, preferredLanguage = getPreferredLanguage()) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const languageCode = normalizeLanguageCode(preferredLanguage);

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    const stringValue = String(value).trim();

    if ((stringValue.startsWith('[') && stringValue.endsWith(']')) || (stringValue.startsWith('{') && stringValue.endsWith('}'))) {
      try {
        const parsed = JSON.parse(stringValue);
        const formattedParsed = formatLocalizedValue(parsed, preferredLanguage);
        if (formattedParsed) {
          return formattedParsed;
        }
      } catch {
        // fall through to the original string
      }
    }

    const translated = translateSystemLabel(stringValue, preferredLanguage);
    if (translated) {
      return translated;
    }

    return stringValue;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      if (isLocalizedObject(item) && item[languageCode]) {
        const localized = formatLocalizedValue(item[languageCode], preferredLanguage);
        if (localized) {
          return localized;
        }
      }
    }

    for (const item of value) {
      const formatted = formatLocalizedValue(item, preferredLanguage);
      if (formatted) {
        return formatted;
      }
    }

    return '';
  }

  if (isLocalizedObject(value)) {
    const preferredValue = value[languageCode] || value[languageCode === 'en' ? 'ar' : 'en'];
    const formattedPreferred = formatLocalizedValue(preferredValue, preferredLanguage);
    if (formattedPreferred) {
      return formattedPreferred;
    }

    const fallbackValue = value.value || value.name || value.displayName || value.label;
    return formatLocalizedValue(fallbackValue, preferredLanguage);
  }

  const preferredKeys = [
    'fullName',
    'name',
    'displayName',
    'firstName',
    'firstname',
    'givenName',
    'lastName',
    'lastname',
    'surname',
    'familyName',
    'title',
    'label',
    'value',
    'roleName',
    'userName',
    'username',
    'emailAddress',
    'email',
  ];

  for (const key of preferredKeys) {
    const formatted = formatLocalizedValue(value?.[key], preferredLanguage);
    if (formatted) {
      return formatted;
    }
  }

  return '';
};

export const getLocalizedDisplayName = (source, preferredLanguage = getPreferredLanguage()) =>
  formatLocalizedValue(
    source?.fullName ||
      source?.name ||
      source?.displayName ||
      [
        formatLocalizedValue(source?.firstName || source?.firstname || source?.givenName, preferredLanguage),
        formatLocalizedValue(source?.lastName || source?.lastname || source?.surname || source?.familyName, preferredLanguage),
      ].filter(Boolean).join(' ').trim() ||
      source?.emailAddress ||
      source?.email ||
      source?.userName ||
      source?.username,
    preferredLanguage
  ) ||
  (() => {
    const firstName = formatLocalizedValue(source?.firstName || source?.firstname || source?.givenName, preferredLanguage);
    const lastName = formatLocalizedValue(source?.lastName || source?.lastname || source?.surname || source?.familyName, preferredLanguage);
    return [firstName, lastName].filter(Boolean).join(' ').trim();
  })();

export const getNameParts = (source, preferredLanguage = getPreferredLanguage()) => {
  const displayName = getLocalizedDisplayName(source, preferredLanguage);
  const fallback =
    formatLocalizedValue(source?.firstName || source?.firstname || source?.givenName, preferredLanguage) ||
    formatLocalizedValue(source?.lastName || source?.lastname || source?.surname || source?.familyName, preferredLanguage) ||
    '';

  const raw = displayName || fallback;
  if (!raw) {
    return { firstName: '', lastName: '' };
  }

  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstName: raw, lastName: '' };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
};
