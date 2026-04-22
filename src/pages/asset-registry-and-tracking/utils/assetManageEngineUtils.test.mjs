import assert from 'node:assert/strict';
import {
  buildAssetFilterOptions,
  enrichAssetsWithManageEngine,
  filterAssets,
  mergeManageEngineItemIntoAsset,
  normalizeAssetStatus,
} from './assetManageEngineUtils.mjs';

const tests = [
  () => {
    const assets = [
      {
        id: 1,
        assetTag: 'AST-100',
        assetId: 'AST-100',
        serialNumber: 'SN-100',
        name: 'Dell Latitude 5420',
        description: 'Dell Latitude 5420',
        model: 'Latitude 5420',
        manufacturer: 'Dell',
      },
    ];

    const monitoredItems = [
      {
        source: 'OpManager',
        itemType: 'service',
        externalId: 'AST-100',
        name: 'Dell Latitude 7420',
        description: 'Generic Dell laptop monitor',
        metadata: { manufacturer: 'Dell', model: 'Latitude 7420', assetTag: 'AST-200' },
      },
      {
        source: 'OpManager',
        itemType: 'service',
        externalId: 'monitor-2',
        name: 'Device SN-100',
        metadata: { serial_number: 'SN-100' },
      },
    ];

    const enriched = enrichAssetsWithManageEngine(assets, monitoredItems, []);

    assert.equal(enriched[0].manageEngine.isMonitored, true);
    assert.equal(enriched[0].manageEngine.services.length, 1);
    assert.equal(enriched[0].manageEngine.services[0].externalId, 'monitor-2');
  },
  () => {
    const assets = [
      { category: 'Hardware', location: 'HQ - Floor 2', ownershipType: 'assigned' },
      { category: 'Software', location: 'Remote', ownershipType: 'unassigned' },
      { category: ' hardware ', location: ' hq - floor 2 ', ownershipType: 'Assigned' },
    ];

    const { categoryOptions, locationOptions, ownershipOptions } = buildAssetFilterOptions(assets);

    assert.deepEqual(
      categoryOptions.map((option) => option.value),
      ['', 'hardware', 'software']
    );
    assert.deepEqual(
      locationOptions.map((option) => option.value),
      ['', 'hq - floor 2', 'remote']
    );
    assert.deepEqual(
      ownershipOptions.map((option) => option.value),
      ['', 'assigned', 'unassigned']
    );
  },
  () => {
    const assets = [
      {
        id: 1,
        category: ' Hardware ',
        location: 'HQ - Floor 2 ',
        status: 'active',
        ownershipType: 'Assigned',
        value: '$100.00',
        manageEngine: { isMonitored: true, alertCount: 1, requestCount: 0 },
      },
      {
        id: 2,
        category: 'Software',
        location: 'Remote',
        status: 'active',
        ownershipType: 'unassigned',
        value: '$50.00',
        manageEngine: { isMonitored: false, alertCount: 0, requestCount: 1 },
      },
    ];

    const filtered = filterAssets(assets, {
      category: 'Hardware',
      location: 'HQ - Floor 2',
      manageEngineStatus: 'alerts',
      ownershipType: 'assigned',
      status: ['active'],
      valueRange: { min: '', max: '' },
      maintenanceStatus: [],
    });

    assert.deepEqual(filtered.map((asset) => asset.id), [1]);
  },
  () => {
    const assets = [
      { id: 1, ownershipType: 'assigned' },
      { id: 2, ownershipType: 'unassigned' },
    ];

    assert.deepEqual(
      filterAssets(assets, { ownershipType: 'unassigned' }).map((asset) => asset.id),
      [2]
    );
  },
  () => {
    assert.equal(normalizeAssetStatus('In Maintenance'), 'maintenance');
    assert.equal(normalizeAssetStatus('Available'), 'active');
    assert.equal(normalizeAssetStatus('Decommissioned'), 'retired');

    const assets = [
      { id: 1, status: 'In Maintenance' },
      { id: 2, status: 'Active' },
    ];

    assert.deepEqual(
      filterAssets(assets, { status: ['maintenance'] }).map((asset) => asset.id),
      [1]
    );
  },
  () => {
    const asset = {
      id: 1,
      manageEngine: {
        isMonitored: false,
        alertCount: 0,
        requestCount: 0,
        services: [],
        alerts: [],
        requests: [],
      },
    };

    const service = { source: 'OpManager', itemType: 'service', externalId: 'device-1' };
    const catalog = { source: 'ServiceDesk', itemType: 'catalog', externalId: 'template-1' };
    const request = { source: 'ServiceDesk', itemType: 'request', externalId: 'request-1' };

    const withService = mergeManageEngineItemIntoAsset(asset, service);
    const withCatalog = mergeManageEngineItemIntoAsset(withService, catalog);
    const withRequest = mergeManageEngineItemIntoAsset(withCatalog, request);
    const duplicateRequest = mergeManageEngineItemIntoAsset(withRequest, request);

    assert.equal(withService.manageEngine.isMonitored, true);
    assert.equal(withService.manageEngine.alertCount, 0);
    assert.equal(withCatalog.manageEngine.requestCount, 0);
    assert.equal(withRequest.manageEngine.requestCount, 1);
    assert.equal(duplicateRequest.manageEngine.requestCount, 1);
  },
];

tests.forEach((runTest, index) => {
  runTest();
  console.log(`ok ${index + 1}`);
});
