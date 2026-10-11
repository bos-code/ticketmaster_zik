/* global __dirname */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const workerSource = fs.readFileSync(path.join(root, 'public/service-worker.js'), 'utf8');

function worker(hostname) {
  const listeners = {};
  const keys = new Set(['ticketmaster-zik-v9', 'ticketmaster-zik-v10', 'unrelated-cache']);
  const caches = {
    keys: async () => [...keys],
    delete: async (key) => keys.delete(key),
    open: async () => { throw new Error('Local preview must not cache app resources'); },
    match: async () => { throw new Error('Development bundles must not read the offline cache'); },
  };
  vm.runInNewContext(workerSource, {
    URL, caches, fetch: () => { throw new Error('Preview traffic belongs to the browser'); },
    self: {
      location: { hostname, origin: `http://${hostname}:8082` },
      addEventListener: (type, callback) => { listeners[type] = callback; },
      skipWaiting() {}, clients: { claim: async () => {} },
    },
  });
  return { listeners, keys };
}

test('local previews never intercept navigation, bundles, fonts, or HMR traffic', async () => {
  for (const host of ['localhost', '127.0.0.1', '[::1]']) {
    const { listeners, keys } = worker(host);
    listeners.install({ waitUntil() { assert.fail('Local preview install cached resources'); } });
    let activation;
    listeners.activate({ waitUntil: (value) => { activation = value; } });
    await activation;
    assert.deepEqual([...keys], ['unrelated-cache']);
    for (const resource of ['/my-account', '/entry.bundle?platform=web&dev=true', '/fonts/averta-regular.woff', '/hot-update']) {
      listeners.fetch({
        request: { method: 'GET', mode: resource === '/my-account' ? 'navigate' : 'cors', url: `http://${host}:8082${resource}` },
        respondWith() { assert.fail(`Cached development resource: ${resource}`); },
      });
    }
  }
});

test('Metro bundles bypass the cache even on a hosted development preview', () => {
  worker('preview.example.com').listeners.fetch({
    request: { method: 'GET', mode: 'cors', url: 'http://preview.example.com:8082/entry.bundle?dev=true' },
    respondWith() { assert.fail('Metro bundle was intercepted'); },
  });
});

test('early HTML recovery removes the stale worker, preserves other caches, and reloads once', async () => {
  const html = fs.readFileSync(path.join(root, 'src/app/+html.tsx'), 'utf8');
  const script = [...html.matchAll(/__html: `([\s\S]*?)`/g)].map((match) => match[1]).find((value) => value.includes('getRegistrations'));
  assert.ok(script, 'Missing early development recovery');
  const keys = new Set(['ticketmaster-zik-v9', 'unrelated-cache']);
  let registered = true;
  let reloads = 0;
  const context = {
    URL,
    navigator: { serviceWorker: {
      controller: {},
      getRegistrations: async () => registered ? [{
        active: { scriptURL: 'http://localhost:8082/service-worker.js' },
        unregister: async () => { registered = false; return true; },
      }] : [],
    } },
    caches: { keys: async () => [...keys], delete: async (key) => keys.delete(key) },
    window: { caches: {}, location: { reload: () => { reloads += 1; } } },
  };
  await vm.runInNewContext(script, context);
  await vm.runInNewContext(script, context);
  assert.equal(registered, false);
  assert.equal(reloads, 1);
  assert.deepEqual([...keys], ['unrelated-cache']);
});
