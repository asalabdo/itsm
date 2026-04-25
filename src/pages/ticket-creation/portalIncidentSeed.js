export const PORTAL_ENTRY_SOURCE = 'customer-portal';
export const PORTAL_ENTRY_POINT = 'incident-intake';
export const QUICK_PRESET_ENTRY_POINT = 'quick-preset';

export const getPortalIncidentDefaults = () => ({
  module: 'incident-management',
  category: 'incident-management',
  service: {
    id: 'im-p2',
    nameEn: 'Major Incident (P2) - Partial Outage',
    nameAr: 'حادثة كبرى (P2) - انقطاع جزئي',
  },
  priority: 'high',
  impact: 'high',
  urgency: 'high',
  department: 'it',
});

export const getPortalIncidentEntryState = () => ({
  source: PORTAL_ENTRY_SOURCE,
  entryPoint: PORTAL_ENTRY_POINT,
  ...getPortalIncidentDefaults(),
});

export const isPortalIncidentEntry = (state) =>
  state?.source === PORTAL_ENTRY_SOURCE && state?.entryPoint === PORTAL_ENTRY_POINT;

export const getPortalQuickPresetEntryState = (quickPresetId) => ({
  source: PORTAL_ENTRY_SOURCE,
  entryPoint: QUICK_PRESET_ENTRY_POINT,
  quickPresetId,
});

export const isPortalQuickPresetEntry = (state) =>
  state?.source === PORTAL_ENTRY_SOURCE && state?.entryPoint === QUICK_PRESET_ENTRY_POINT && Boolean(state?.quickPresetId);
