const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const handler = require('../api/tickets.js');
const originalFetch = global.fetch;
const originalProject = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
const originalKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
beforeEach(() => {
  process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY = 'server-test-key';
});
afterEach(() => {
  global.fetch = originalFetch;
  for (const [name, value] of [['EXPO_PUBLIC_FIREBASE_PROJECT_ID', originalProject], ['EXPO_PUBLIC_FIREBASE_API_KEY', originalKey]]) {
    if (value === undefined) delete process.env[name]; else process.env[name] = value;
  }
});
function response() {
  return { headers: {}, setHeader(name, value) { this.headers[name] = value; }, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
}

test('ticket writes are scoped to the tickets collection and preserve partial-update masks', async () => {
  let write;
  global.fetch = async (url, options) => {
    assert.match(url, /\/documents:commit\?key=server-test-key$/);
    assert.equal(options.method, 'POST');
    write = JSON.parse(options.body).writes[0];
    return Response.json({ writeResults: [{}] });
  };
  const res = response();
  await handler({ method: 'POST', query: { id: 'ticket-test' }, body: { venue: 'New venue', latitude: null, longitude: 29.5 } }, res);
  assert.equal(res.code, 200);
  assert.equal(write.update.name, 'projects/test-project/databases/(default)/documents/tickets/ticket-test');
  assert.deepEqual(write.updateMask.fieldPaths, ['venue', 'latitude', 'longitude']);
  assert.deepEqual(write.update.fields.latitude, { nullValue: null });
  assert.deepEqual(write.update.fields.longitude, { doubleValue: 29.5 });
  assert.equal('image' in write.update.fields, false);
});

test('paginated reads retain numeric/null fields and prevent cached ticket lists', async () => {
  let calls = 0;
  global.fetch = async url => {
    calls++;
    if (calls === 1) return Response.json({ documents: [{ fields: { id: { stringValue: 'ticket-one' }, latitude: { doubleValue: 29.5 }, longitude: { nullValue: null } } }], nextPageToken: 'next' });
    assert.match(url, /pageToken=next/);
    return Response.json({ documents: [{ fields: { id: { stringValue: 'ticket-two' } } }] });
  };
  const res = response();
  await handler({ method: 'GET', query: {} }, res);
  assert.equal(res.code, 200);
  assert.equal(res.headers['Cache-Control'], 'no-store');
  assert.deepEqual(res.body, [{ id: 'ticket-one', latitude: 29.5, longitude: null }, { id: 'ticket-two' }]);
});

test('invalid IDs, unrecognized fields, and mismatched IDs cannot be forwarded', async () => {
  global.fetch = async () => { assert.fail('Invalid input reached the database'); };
  for (const request of [
    { method: 'POST', query: { id: 'ticket-../other' }, body: { venue: 'bad' } },
    { method: 'POST', query: { id: 'ticket-test' }, body: { credentials: 'bad' } },
    { method: 'POST', query: { id: 'ticket-test' }, body: { id: 'ticket-other' } },
  ]) {
    const res = response(); await handler(request, res); assert.equal(res.code, 400);
  }
});

test('upstream failure returns a retryable error without leaking configuration', async () => {
  global.fetch = async () => { throw new Error('server-test-key'); };
  const res = response();
  await handler({ method: 'GET', query: {} }, res);
  assert.equal(res.code, 503);
  assert(!JSON.stringify(res.body).includes('server-test-key'));
});

test('deleting a ticket remains confined to its validated document ID', async () => {
  let url;
  global.fetch = async (target, options) => {
    url = target;
    assert.equal(options.method, 'DELETE');
    return new Response('');
  };
  const res = response();
  await handler({ method: 'DELETE', query: { id: 'ticket-test' } }, res);
  assert.equal(res.code, 200);
  assert.match(url, /\/documents\/tickets\/ticket-test\?key=/);
  const invalid = response();
  global.fetch = async () => { assert.fail('Unsafe deletion reached the database'); };
  await handler({ method: 'DELETE', query: { id: 'ticket-../other' } }, invalid);
  assert.equal(invalid.code, 400);
});
