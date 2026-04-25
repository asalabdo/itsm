const normalizeSource = (value) => String(value || '').trim().toLowerCase();
const normalizeType = (value) => String(value || '').trim().toLowerCase();

export const normalizeManageEngineList = (payload, preferredKey) => {
  const data = payload?.data ?? payload;

  if (Array.isArray(data)) {
    return data;
  }

  if (preferredKey && Array.isArray(data?.[preferredKey])) {
    return data[preferredKey];
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.operations)) {
    return data.operations;
  }

  if (Array.isArray(data?.catalog)) {
    return data.catalog;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

export const normalizeManageEngineUnified = (payload) => {
  const data = payload?.data ?? payload ?? {};

  return {
    catalog: normalizeManageEngineList(data.catalog),
    operations: normalizeManageEngineList(data.operations),
    summary: data.summary || {},
  };
};

export const isOpManager270Service = (item) =>
  normalizeSource(item?.source) === 'opmanager' && normalizeType(item?.itemType) === 'service';

export const isOpManager270Alert = (item) =>
  normalizeSource(item?.source) === 'opmanager' && normalizeType(item?.itemType) === 'alert';

export const getOpManager270LatestAlerts = (payload, limit = 5) => {
  const { operations } = normalizeManageEngineUnified(payload);
  return operations.filter(isOpManager270Alert).slice(0, limit);
};

export const findExactManageEngineTicketMatch = (ticket, items = []) => {
  const externalId = String(ticket?.externalId || '').trim().toLowerCase();
  if (!externalId) {
    return null;
  }

  return items.find((item) => String(item?.externalId || '').trim().toLowerCase() === externalId) || null;
};

export const summarizeOpManager270 = (payload) => {
  const { catalog, operations } = normalizeManageEngineUnified(payload);
  const services = catalog.filter(isOpManager270Service);
  const alerts = operations.filter(isOpManager270Alert);

  return {
    services: services.length,
    alerts: alerts.length,
    latestAlerts: alerts,
    latestServices: services,
  };
};

export const summarizeManageEngineUnified = (payload) => {
  const { catalog, operations, summary } = normalizeManageEngineUnified(payload);
  const opManager270 = summarizeOpManager270(payload);

  return {
    catalog: Number(summary.catalog ?? catalog.length),
    operations: Number(summary.operations ?? operations.length),
    serviceDeskCatalog: Number(summary.serviceDeskCatalog ?? catalog.filter((item) => normalizeSource(item?.source) === 'servicedesk').length),
    opManagerCatalog: Number(summary.opManagerCatalog ?? opManager270.services),
    serviceDeskRequests: Number(summary.serviceDeskRequests ?? operations.filter((item) => normalizeSource(item?.source) === 'servicedesk' && normalizeType(item?.itemType) === 'request').length),
    opManagerAlerts: Number(summary.opManagerAlerts ?? opManager270.alerts),
  };
};
