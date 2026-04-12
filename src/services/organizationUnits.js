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
