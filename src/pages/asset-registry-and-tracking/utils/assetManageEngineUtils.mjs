const normalizeValue = (value) => String(value || '').trim().toLowerCase();

const uniqueValues = (values) => Array.from(new Set(values.filter(Boolean))).sort((left, right) => left.localeCompare(right));

const getAssetIdentifiers = (asset) => uniqueValues([
  normalizeValue(asset?.assetTag),
  normalizeValue(asset?.assetId),
  normalizeValue(asset?.serialNumber),
  normalizeValue(asset?.barcode),
]);

const getExternalIdentifiers = (item) => uniqueValues([
  normalizeValue(item?.externalId),
  normalizeValue(item?.metadata?.assetTag),
  normalizeValue(item?.metadata?.assetId),
  normalizeValue(item?.metadata?.serialNumber),
  normalizeValue(item?.metadata?.barcode),
  normalizeValue(item?.metadata?.deviceTag),
  normalizeValue(item?.metadata?.deviceSerialNumber),
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

export const buildAssetFilterOptions = (assets = []) => {
  const categories = uniqueValues(assets.map((asset) => String(asset?.category || '').trim()));
  const locations = uniqueValues(assets.map((asset) => String(asset?.location || '').trim()));

  return {
    categoryOptions: [
      { value: '', label: 'All Categories' },
      ...categories.map((category) => ({ value: category, label: category })),
    ],
    locationOptions: [
      { value: '', label: 'All Locations' },
      ...locations.map((location) => ({ value: location, label: location })),
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
    filtered = filtered.filter((asset) => asset?.category === filters.category);
  }

  if (filters?.location) {
    filtered = filtered.filter((asset) => asset?.location === filters.location);
  }

  if (Array.isArray(filters?.status) && filters.status.length > 0) {
    filtered = filtered.filter((asset) => filters.status.includes(asset?.status));
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
