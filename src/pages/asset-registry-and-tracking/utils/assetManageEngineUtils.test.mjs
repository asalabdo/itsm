import assert from 'node:assert/strict';
import {
  buildAssetFilterOptions,
  enrichAssetsWithManageEngine,
  filterAssets,
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
        externalId: 'monitor-1',
        name: 'Dell Latitude 7420',
        description: 'Generic Dell laptop monitor',
        metadata: { manufacturer: 'Dell', model: 'Latitude 7420' },
      },
      {
        source: 'OpManager',
        itemType: 'service',
        externalId: 'monitor-2',
        name: 'Device SN-100',
        metadata: { serialNumber: 'SN-100' },
      },
    ];

    const enriched = enrichAssetsWithManageEngine(assets, monitoredItems, []);

    assert.equal(enriched[0].manageEngine.isMonitored, true);
    assert.equal(enriched[0].manageEngine.services.length, 1);
    assert.equal(enriched[0].manageEngine.services[0].externalId, 'monitor-2');
  },
  () => {
    const assets = [
      { category: 'Hardware', location: 'HQ - Floor 2' },
      { category: 'Software', location: 'Remote' },
      { category: 'Hardware', location: 'HQ - Floor 2' },
    ];

    const { categoryOptions, locationOptions } = buildAssetFilterOptions(assets);

    assert.deepEqual(
      categoryOptions.map((option) => option.value),
      ['', 'Hardware', 'Software']
    );
    assert.deepEqual(
      locationOptions.map((option) => option.value),
      ['', 'HQ - Floor 2', 'Remote']
    );
  },
  () => {
    const assets = [
      {
        id: 1,
        category: 'Hardware',
        location: 'HQ - Floor 2',
        status: 'active',
        value: '$100.00',
        manageEngine: { isMonitored: true, alertCount: 1, requestCount: 0 },
      },
      {
        id: 2,
        category: 'Software',
        location: 'Remote',
        status: 'active',
        value: '$50.00',
        manageEngine: { isMonitored: false, alertCount: 0, requestCount: 1 },
      },
    ];

    const filtered = filterAssets(assets, {
      category: 'Hardware',
      location: 'HQ - Floor 2',
      manageEngineStatus: 'alerts',
      status: ['active'],
      valueRange: { min: '', max: '' },
      maintenanceStatus: [],
    });

    assert.deepEqual(filtered.map((asset) => asset.id), [1]);
  },
];

tests.forEach((runTest, index) => {
  runTest();
  console.log(`ok ${index + 1}`);
});
