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

export const summarizeManageEngineUnified = (payload) => {
  const { catalog, operations, summary } = normalizeManageEngineUnified(payload);

  return {
    catalog: Number(summary.catalog ?? catalog.length),
    operations: Number(summary.operations ?? operations.length),
    serviceDeskCatalog: Number(summary.serviceDeskCatalog ?? catalog.filter((item) => item?.source === 'ServiceDesk').length),
    opManagerCatalog: Number(summary.opManagerCatalog ?? catalog.filter((item) => item?.source === 'OpManager').length),
    serviceDeskRequests: Number(summary.serviceDeskRequests ?? operations.filter((item) => item?.source === 'ServiceDesk').length),
    opManagerAlerts: Number(summary.opManagerAlerts ?? operations.filter((item) => item?.source === 'OpManager').length),
  };
};
