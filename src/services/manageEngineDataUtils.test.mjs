import assert from 'node:assert/strict';
import {
  findExactManageEngineTicketMatch,
  getOpManager270LatestAlerts,
  summarizeManageEngineUnified,
  summarizeOpManager270,
} from './manageEngineDataUtils.mjs';

const tests = [
  () => {
    const payload = {
      data: {
        catalog: [
          { source: 'OpManager', itemType: 'service', externalId: 'svc-1' },
          { source: 'OpManager', itemType: 'catalog', externalId: 'cat-1' },
          { source: 'ServiceDesk', itemType: 'catalog', externalId: 'sd-1' },
        ],
        operations: [
          { source: 'OpManager', itemType: 'alert', externalId: 'alert-1', status: 'Critical' },
          { source: 'OpManager', itemType: 'request', externalId: 'req-should-ignore' },
          { source: 'ServiceDesk', itemType: 'request', externalId: 'sd-req-1' },
        ],
      },
    };

    const summary = summarizeOpManager270(payload);

    assert.equal(summary.services, 1);
    assert.equal(summary.alerts, 1);
    assert.equal(summary.latestAlerts.length, 1);
    assert.equal(summary.latestAlerts[0].externalId, 'alert-1');
  },
  () => {
    const payload = {
      data: {
        catalog: [
          { source: 'OpManager', itemType: 'service', externalId: 'svc-1' },
        ],
        operations: [
          { source: 'OpManager', itemType: 'alert', externalId: 'alert-1' },
          { source: 'ServiceDesk', itemType: 'request', externalId: 'sd-req-1' },
        ],
      },
    };

    const summary = summarizeManageEngineUnified(payload);

    assert.equal(summary.catalog, 1);
    assert.equal(summary.opManagerCatalog, 1);
    assert.equal(summary.serviceDeskRequests, 1);
    assert.equal(summary.opManagerAlerts, 1);
  },
  () => {
    const payload = {
      data: {
        operations: [
          { source: 'OpManager', itemType: 'alert', externalId: 'alert-1' },
          { source: 'OpManager', itemType: 'alert', externalId: 'alert-2' },
          { source: 'ServiceDesk', itemType: 'request', externalId: 'sd-req-1' },
        ],
      },
    };

    const alerts = getOpManager270LatestAlerts(payload, 1);

    assert.equal(alerts.length, 1);
    assert.equal(alerts[0].externalId, 'alert-1');
  },
  () => {
    const ticket = {
      externalId: 'REQ-1001',
      title: 'Email outage in finance',
      description: 'Finance cannot access shared mailbox.',
    };

    const exact = findExactManageEngineTicketMatch(ticket, [
      { source: 'ServiceDesk', itemType: 'request', externalId: 'REQ-1001', name: 'Finance email issue' },
      { source: 'OpManager', itemType: 'alert', externalId: 'ALT-22', name: 'Email outage in finance' },
    ]);

    const noFuzzy = findExactManageEngineTicketMatch(
      { title: 'Email outage in finance', description: 'Finance cannot access shared mailbox.' },
      [{ source: 'OpManager', itemType: 'alert', externalId: 'ALT-22', name: 'Email outage in finance' }]
    );

    assert.equal(exact?.externalId, 'REQ-1001');
    assert.equal(noFuzzy, null);
  },
];

tests.forEach((runTest, index) => {
  runTest();
  console.log(`ok ${index + 1}`);
});
