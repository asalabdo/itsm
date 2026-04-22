import { organizationUnitAPI } from './api';
import { formatLocalizedValue, getPreferredLanguage } from './displayValue';

export const ORG_UNIT_SOURCES = [
  {
    id: 10042,
    label: {
      ar: 'إدارة التطوير والحلول الرقمية',
      en: 'Digital Development and Solutions Department',
    },
  },
  {
    id: 10043,
    label: {
      ar: 'إدارة البنية التحتية والعمليات',
      en: 'Infrastructure and Operations Department',
    },
  },
  {
    id: 10497,
    label: {
      ar: 'إدارة خدمات تقنية المعلومات',
      en: 'IT Services Department',
    },
  },
];

const ORG_UNIT_LOOKUP = new Map(
  ORG_UNIT_SOURCES.map((source) => [Number(source.id), source])
);

const ERP_DEPARTMENT_CACHE = {
  data: null,
  promise: null,
};

const normalizeDepartmentKey = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, ' ')
    .replace(/\s+/g, ' ');

const extractItems = (response) => {
  const items =
    response?.data?.result?.items ||
    response?.data?.result ||
    response?.data?.items ||
    response?.data ||
    [];

  return Array.isArray(items) ? items : [];
};

export const getOrganizationUnitLabel = (unitId, fallbackLabel = '') => {
  const source = ORG_UNIT_LOOKUP.get(Number(unitId));
  if (source?.label) {
    return formatLocalizedValue(source.label, getPreferredLanguage()) || formatLocalizedValue(source.label, 'en');
  }

  return formatLocalizedValue(fallbackLabel) || `Organization ${unitId || ''}`.trim();
};

export const getOrganizationUnitSortOrder = (unitId) => {
  const index = ORG_UNIT_SOURCES.findIndex((source) => Number(source.id) === Number(unitId));
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

export const matchOrganizationUnitLabel = (value, departmentDirectory = []) => {
  const normalized = normalizeDepartmentKey(value);
  if (!normalized) {
    return '';
  }

  const match = (Array.isArray(departmentDirectory) ? departmentDirectory : []).find((entry) => {
    const candidates = [
      entry?.label,
      entry?.name,
      entry?.organizationUnitName,
      entry?.organizationUnit?.displayName,
      entry?.source?.label,
      entry?.fallbackLabel,
    ]
      .map((candidate) => normalizeDepartmentKey(formatLocalizedValue(candidate, getPreferredLanguage()) || candidate))
      .filter(Boolean);

    return candidates.some((candidate) => candidate === normalized || candidate.includes(normalized) || normalized.includes(candidate));
  });

  return formatLocalizedValue(match?.label, getPreferredLanguage()) ||
    formatLocalizedValue(match?.label, 'en') ||
    formatLocalizedValue(value, getPreferredLanguage()) ||
    formatLocalizedValue(value, 'en') ||
    String(value || '').trim();
};

export const loadErpDepartmentDirectory = async ({ refresh = false, maxResultCount = 100 } = {}) => {
  if (!refresh && Array.isArray(ERP_DEPARTMENT_CACHE.data)) {
    return ERP_DEPARTMENT_CACHE.data;
  }

  if (!refresh && ERP_DEPARTMENT_CACHE.promise) {
    return ERP_DEPARTMENT_CACHE.promise;
  }

  const promise = Promise.all(
    ORG_UNIT_SOURCES.map(async (source) => {
      try {
        const response = await organizationUnitAPI.getUsers(source.id, maxResultCount, 0);
        const items = extractItems(response);
        const sample = items.find((item) => item?.organizationUnitName || item?.organizationUnit?.displayName) || items[0] || {};
        const resolvedLabel =
          formatLocalizedValue(sample?.organizationUnitName, getPreferredLanguage()) ||
          formatLocalizedValue(sample?.organizationUnit?.displayName, getPreferredLanguage()) ||
          formatLocalizedValue(sample?.organizationUnitName, 'en') ||
          formatLocalizedValue(sample?.organizationUnit?.displayName, 'en') ||
          formatLocalizedValue(source.label, getPreferredLanguage()) ||
          formatLocalizedValue(source.label, 'en') ||
          `Organization ${source.id}`;

        return {
          id: source.id,
          label: resolvedLabel,
          fallbackLabel: formatLocalizedValue(source.label, getPreferredLanguage()) || formatLocalizedValue(source.label, 'en'),
          normalizedLabel: normalizeDepartmentKey(resolvedLabel),
          userCount: items.length,
          source,
          users: items,
        };
      } catch (error) {
        return {
          id: source.id,
          label: formatLocalizedValue(source.label, getPreferredLanguage()) || formatLocalizedValue(source.label, 'en') || `Organization ${source.id}`,
          fallbackLabel: formatLocalizedValue(source.label, getPreferredLanguage()) || formatLocalizedValue(source.label, 'en'),
          normalizedLabel: normalizeDepartmentKey(formatLocalizedValue(source.label, getPreferredLanguage()) || formatLocalizedValue(source.label, 'en')),
          userCount: 0,
          source,
          users: [],
          error,
        };
      }
    })
  ).then((items) =>
    items
      .filter(Boolean)
      .sort((a, b) => getOrganizationUnitSortOrder(a.id) - getOrganizationUnitSortOrder(b.id) || a.label.localeCompare(b.label))
  );

  ERP_DEPARTMENT_CACHE.promise = promise;

  try {
    const data = await promise;
    ERP_DEPARTMENT_CACHE.data = data;
    return data;
  } finally {
    ERP_DEPARTMENT_CACHE.promise = null;
  }
};

export const getErpDepartmentOptions = (departmentDirectory = [], t = null) => {
  const allLabel = typeof t === 'function' ? t('allDepartments', 'All Departments') : 'All Departments';
  const values = Array.isArray(departmentDirectory) ? departmentDirectory : [];

  return [
    { value: 'all', label: allLabel },
    ...values.map((department) => ({
      value: String(department?.normalizedLabel || department?.label || department?.id || '').trim().toLowerCase() || `dept-${department?.id || ''}`,
      label: formatLocalizedValue(department?.label, getPreferredLanguage()) || formatLocalizedValue(department?.label, 'en') || `Organization ${department?.id || ''}`,
      count: department?.userCount || 0,
      source: department?.source || null,
    })),
  ];
};

export const groupByOrganizationUnit = (
  items,
  getUnitId,
  getUnitLabel = (item) => item?.organizationUnitName || ''
) => {
  const groups = new Map();

  (Array.isArray(items) ? items : []).forEach((item) => {
    const unitId = getUnitId(item);
    const key = unitId != null && unitId !== '' ? String(unitId) : 'other';
    const label = unitId != null && unitId !== ''
      ? getOrganizationUnitLabel(unitId, getUnitLabel(item))
      : formatLocalizedValue(getUnitLabel(item)) || 'Other';

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        unitId,
        label,
        order: getOrganizationUnitSortOrder(unitId),
        items: [],
      });
    }

    groups.get(key).items.push(item);
  });

  return Array.from(groups.values())
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
    .map((group) => ({
      ...group,
      items: group.items,
    }));
};
