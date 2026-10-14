const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

function loadPersistence(fetch) {
  const value = { exports: {} };
  const source = fs.readFileSync(path.resolve(__dirname, '../src/lib/firebase-data.ts'), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, {
    module: value, exports: value.exports, fetch, process: { env: {} },
    require(name) {
      if (name === 'firebase/firestore') return {};
      if (name === '../../data/tickets') return { mockTickets: [] };
      if (name === '@/lib/data') return { eventCatalog: [], initialReservations: [] };
      if (name === '@/lib/firebase') return { firebaseConfig: { projectId: 'test-project', apiKey: 'public-test-key' } };
      throw new Error(`Unexpected import ${name}`);
    },
  });
  return value.exports;
}

test('ticket creation uses a single POST commit and preserves ticket fields', async () => {
  let request;
  const api = loadPersistence(async (url, options) => {
    request = { url, ...options, body: JSON.parse(options.body) };
    return new Response('{}');
  });
  await api.createTicketDocument({ id: 'ticket-test', eventName: 'Upload test', image: 'https://example.com/art.jpg', latitude: 29.75 });
  assert.equal(request.method, 'POST');
  assert.match(request.url, /\/documents:commit\?key=public-test-key$/);
  assert.equal(request.body.writes.length, 1);
  const write = request.body.writes[0];
  assert.equal(write.update.name, 'projects/test-project/databases/(default)/documents/tickets/ticket-test');
  assert.equal(write.update.fields.image.stringValue, 'https://example.com/art.jpg');
  assert.equal(write.update.fields.latitude.doubleValue, 29.75);
  assert.deepEqual(write.updateMask.fieldPaths.sort(), ['eventName', 'id', 'image', 'latitude']);
});

test('partial updates only mask changed fields and can clear stale coordinates', async () => {
  let write;
  const api = loadPersistence(async (_, options) => {
    write = JSON.parse(options.body).writes[0];
    return new Response('{}');
  });
  await api.updateTicketDocument('ticket-test', { venue: 'New venue', latitude: null, longitude: null });
  assert.deepEqual(write.updateMask.fieldPaths.sort(), ['latitude', 'longitude', 'venue']);
  assert.deepEqual(write.update.fields.latitude, { nullValue: null });
  assert.equal('image' in write.update.fields, false, 'changing a venue must preserve the existing artwork');
});

test('server rejection and network failure never report a successful save', async () => {
  const rejected = loadPersistence(async () => new Response('Permission denied', { status: 403 }));
  await assert.rejects(rejected.createTicketDocument({ id: 'ticket-test' }), /403.*Permission denied/);
  const disconnected = loadPersistence(async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(disconnected.createTicketDocument({ id: 'ticket-test' }), /Failed to fetch/);
});
