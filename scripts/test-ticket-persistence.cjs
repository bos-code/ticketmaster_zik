const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

function loadPersistence(fetch, hosted = false) {
  const value = { exports: {} };
  const source = fs.readFileSync(path.resolve(__dirname, '../src/lib/firebase-data.ts'), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, {
    module: value, exports: value.exports, fetch, process: { env: {} },
    AbortController, setTimeout, clearTimeout,
    ...(hosted ? { window: { location: { protocol: 'https:' } } } : {}),
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

test('hosted ticket creation uses the app endpoint with all ticket fields', async () => {
  let request;
  const api = loadPersistence(async (url, options) => {
    request = { url, ...options, body: JSON.parse(options.body) };
    return new Response('{}');
  }, true);
  await api.createTicketDocument({ id: 'ticket-test', eventName: 'Upload test', image: 'https://example.com/art.jpg', latitude: 29.75 });
  assert.equal(request.method, 'POST');
  assert.equal(request.url, '/api/tickets?id=ticket-test');
  assert.equal(request.body.image, 'https://example.com/art.jpg');
  assert.equal(request.body.latitude, 29.75);
  assert(!request.url.includes('public-test-key'), 'database configuration stays out of browser ticket requests');
});

test('hosted reads use the same app endpoint and sort by latest update', async () => {
  const api = loadPersistence(async (url, options) => {
    assert.equal(url, '/api/tickets');
    assert.equal(options.method, 'GET');
    assert.equal(options.cache, 'no-store');
    return Response.json([{ id: 'older', updatedAt: '2026-10-13' }, { id: 'newer', updatedAt: '2026-10-14' }]);
  }, true);
  assert.deepEqual((await api.fetchTickets()).map(ticket => ticket.id), ['newer', 'older']);
});

test('native and local-preview partial updates retain their existing transport and field mask', async () => {
  let request;
  const api = loadPersistence(async (url, options) => {
    request = { url, ...options, body: JSON.parse(options.body) };
    return new Response('{}');
  });
  await api.updateTicketDocument('ticket-test', { venue: 'New venue', latitude: null, longitude: null });
  assert.equal(request.method, 'PATCH');
  assert.match(request.url, /updateMask.fieldPaths=venue/);
  assert.deepEqual(request.body.fields.latitude, { nullValue: null });
  assert.equal('image' in request.body.fields, false);
});

test('server rejection and network failure never report a successful hosted save', async () => {
  const rejected = loadPersistence(async () => Response.json({ error: 'Please retry' }, { status: 503 }), true);
  await assert.rejects(rejected.createTicketDocument({ id: 'ticket-test' }), /Please retry/);
  const disconnected = loadPersistence(async () => { throw new TypeError('Failed to fetch'); }, true);
  await assert.rejects(disconnected.createTicketDocument({ id: 'ticket-test' }), /Failed to fetch/);
});

test('a ticket arriving through sync during creation is not inserted twice', async () => {
  const value = { exports: {} };
  const source = fs.readFileSync(path.resolve(__dirname, '../src/store/ticketStore.ts'), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, {
    module: value, exports: value.exports,
    require(name) {
      if (name === '../../data/tickets') return { mockTickets: [] };
      if (name === '@/lib/firebase-data') return {
        persistTicketImage: async (_, image) => image,
        createTicketDocument: async ticket => value.exports.useTicketStore.getState().replaceTickets([ticket]),
      };
      return require(name);
    },
  });
  const store = value.exports.useTicketStore;
  const created = await store.getState().addEvent({ artistName: 'Diagnostic', ticketType: 'Standard', image: 'https://example.com/image.jpg' });
  assert.equal(store.getState().tickets.length, 1);
  assert.equal(store.getState().events.length, 1);
  assert.equal(store.getState().tickets[0].id, created.id);
});
