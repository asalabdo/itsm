const normalizeValue = (value) => String(value || '').trim().toLowerCase();

const uniqueValues = (values) => Array.from(new Set(values.filter(Boolean))).sort((left, right) => left.localeCompare(right));

export const normalizeAssetStatus = (status) => {
  const normalized = normalizeValue(status);
  if (!normalized) return 'active';
  if (normalized.includes('maint')) return 'maintenance';
  if (normalized.includes('retir') || normalized.includes('decommission')) return 'retired';
  if (normalized.includes('lost')) return 'lost';
  if (normalized.includes('inactive')) return 'inactive';
  if (normalized.includes('available') || normalized.includes('active')) return 'active';
  return normalized.replace(/\s+/g, '-');
};

const uniqueOptions = (values) => {
  const byNormalizedValue = new Map();

  values.forEach((value) => {
    const label = String(value || '').trim();
    const normalized = normalizeValue(label);
    if (!normalized || byNormalizedValue.has(normalized)) {
      return;
    }

    byNormalizedValue.set(normalized, { value: normalized, label });
  });

  return Array.from(byNormalizedValue.values()).sort((left, right) => left.label.localeCompare(right.label));
};

const getAssetIdentifiers = (asset) => uniqueValues([
  normalizeValue(asset?.assetTag),
  normalizeValue(asset?.assetId),
  normalizeValue(asset?.serialNumber),
  normalizeValue(asset?.barcode),
]);

const getExternalIdentifiers = (item) => uniqueValues([
  // These are explicit asset identity fields from normalized ManageEngine payloads,
  // not broad text fields such as name, description, manufacturer, or model.
  normalizeValue(item?.assetTag),
  normalizeValue(item?.assetId),
  normalizeValue(item?.serialNumber),
  normalizeValue(item?.barcode),
  normalizeValue(item?.metadata?.assetTag),
  normalizeValue(item?.metadata?.asset_tag),
  normalizeValue(item?.metadata?.assetId),
  normalizeValue(item?.metadata?.asset_id),
  normalizeValue(item?.metadata?.serialNumber),
  normalizeValue(item?.metadata?.serial_number),
  normalizeValue(item?.metadata?.barcode),
  normalizeValue(item?.metadata?.deviceTag),
  normalizeValue(item?.metadata?.device_tag),
  normalizeValue(item?.metadata?.deviceSerialNumber),
  normalizeValue(item?.metadata?.device_serial_number),
]);

export const itemMatchesAsset = (asset, item) => {
  const assetIdentifiers = getAssetIdentifiers(asset);
  const externalIdentifiers = getExternalIdentifiers(item);

  if (assetIdentifiers.length === 0 || externalIdentifiers.length === 0) {
    return false;
  }

  return assetIdentifiers.some((identifier) => externalIdentifiers.includes(identifier));
};

export const enrichAssetsWithManageEngine = (assetItems = [], monitoredItems = [], operationItems = []) => (
  assetItems.map((asset) => {
    const matchedServices = monitoredItems.filter((item) => itemMatchesAsset(asset, item));
    const matchedOperations = operationItems.filter((item) => itemMatchesAsset(asset, item));
    const matchedAlerts = matchedOperations.filter((item) => item.source === 'OpManager' || item.itemType === 'alert');
    const matchedRequests = matchedOperations.filter((item) => item.source === 'ServiceDesk' || item.itemType === 'request');
    const primaryItem = matchedAlerts[0] || matchedServices[0] || matchedRequests[0] || null;

    return {
      ...asset,
      manageEngine: {
        isMonitored: matchedServices.length > 0,
        alertCount: matchedAlerts.length,
        requestCount: matchedRequests.length,
        services: matchedServices,
        alerts: matchedAlerts,
        requests: matchedRequests,
        externalUrl: primaryItem?.externalUrl || null,
        sourceStatus: primaryItem?.status || null,
        sourceOwner: primaryItem?.owner || null,
      },
    };
  })
);

export const mergeManageEngineItemIntoAsset = (asset, item) => {
  if (!item) return asset;

  const itemType = normalizeValue(item.itemType);
  const current = asset.manageEngine || {};
  const services = current.services || [];
  const alerts = current.alerts || [];
  const requests = current.requests || [];
  const hasExistingItem = (items = []) => items.some((existing) => (
    existing?.source === item.source && existing?.externalId === item.externalId
  ));
  const isService = itemType === 'service';
  const isAlert = itemType === 'alert';
  const isRequest = itemType === 'request';
  const shouldAddService = isService && !hasExistingItem(services);
  const shouldAddAlert = isAlert && !hasExistingItem(alerts);
  const shouldAddRequest = isRequest && !hasExistingItem(requests);
  const nextAlerts = shouldAddAlert ? [...alerts, item] : alerts;
  const nextRequests = shouldAddRequest ? [...requests, item] : requests;

  return {
    ...asset,
    manageEngine: {
      ...current,
      isMonitored: current.isMonitored || isService,
      alertCount: nextAlerts.length,
      requestCount: nextRequests.length,
      services: shouldAddService ? [...services, item] : services,
      alerts: nextAlerts,
      requests: nextRequests,
      externalUrl: current.externalUrl || item.externalUrl || null,
      sourceStatus: current.sourceStatus || item.status || null,
      sourceOwner: current.sourceOwner || item.owner || null,
    },
  };
};

export const buildAssetFilterOptions = (assets = []) => {
  const categories = uniqueOptions(assets.map((asset) => asset?.category));
  const locations = uniqueOptions(assets.map((asset) => asset?.location));
  const ownershipTypes = uniqueOptions(assets.map((asset) => asset?.ownershipType));

  return {
    categoryOptions: [
      { value: '', label: 'All Categories' },
      ...categories,
    ],
    locationOptions: [
      { value: '', label: 'All Locations' },
      ...locations,
    ],
    ownershipOptions: [
      { value: '', label: 'All Ownership' },
      ...ownershipTypes,
    ],
  };
};

export const filterAssets = (assets = [], filters = {}) => {
  let filtered = [...assets];

  if (filters?.searchQuery) {
    const query = normalizeValue(filters.searchQuery);
    filtered = filtered.filter((asset) => (
      normalizeValue(asset?.assetId).includes(query)
      || normalizeValue(asset?.description).includes(query)
      || normalizeValue(asset?.serialNumber).includes(query)
      || normalizeValue(asset?.barcode).includes(query)
    ));
  }

  if (filters?.category) {
    filtered = filtered.filter((asset) => normalizeValue(asset?.category) === normalizeValue(filters.category));
  }

  if (filters?.location) {
    filtered = filtered.filter((asset) => normalizeValue(asset?.location) === normalizeValue(filters.location));
  }

  if (filters?.ownershipType) {
    filtered = filtered.filter((asset) => normalizeValue(asset?.ownershipType) === normalizeValue(filters.ownershipType));
  }

  if (Array.isArray(filters?.status) && filters.status.length > 0) {
    filtered = filtered.filter((asset) => filters.status.includes(normalizeAssetStatus(asset?.status)));
  }

  if (filters?.valueRange?.min) {
    filtered = filtered.filter((asset) => (
      parseFloat(String(asset?.value || '').replace(/[^0-9.-]+/g, '')) >= parseFloat(filters.valueRange.min)
    ));
  }

  if (filters?.valueRange?.max) {
    filtered = filtered.filter((asset) => (
      parseFloat(String(asset?.value || '').replace(/[^0-9.-]+/g, '')) <= parseFloat(filters.valueRange.max)
    ));
  }

  if (Array.isArray(filters?.maintenanceStatus) && filters.maintenanceStatus.length > 0) {
    filtered = filtered.filter((asset) => {
      if (filters.maintenanceStatus.includes('due') && asset?.maintenanceDaysUntil >= 0 && asset?.maintenanceDaysUntil <= 7) return true;
      if (filters.maintenanceStatus.includes('overdue') && asset?.maintenanceDaysUntil < 0) return true;
      if (filters.maintenanceStatus.includes('scheduled') && asset?.maintenanceDaysUntil > 7) return true;
      return false;
    });
  }

  if (filters?.manageEngineStatus === 'monitored') {
    filtered = filtered.filter((asset) => asset?.manageEngine?.isMonitored);
  }

  if (filters?.manageEngineStatus === 'alerts') {
    filtered = filtered.filter((asset) => (asset?.manageEngine?.alertCount || 0) > 0);
  }

  if (filters?.manageEngineStatus === 'requests') {
    filtered = filtered.filter((asset) => (asset?.manageEngine?.requestCount || 0) > 0);
  }

  return filtered;
};
