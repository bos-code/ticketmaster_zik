/* global __dirname */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');
const moduleValue = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../src/lib/ticket-tilt.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { module: moduleValue, exports: moduleValue.exports });
const { createTicketTilt, createTiltPermissionManager, orientationToTilt } = moduleValue.exports;

function permissionStorage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

function rig(overrides = {}) {
  let now = 0, serial = 0, requested = 0, listener;
  const frames = new Map(), timers = new Map(), points = [], states = [];
  const env = {
    sensorSupported: true, pointerSupported: false, secure: true,
    requestPermission: () => { requested++; return Promise.resolve('granted'); },
    subscribe: callback => { assert.equal(listener, undefined, 'only one sensor listener'); listener = callback; return () => { listener = undefined; }; },
    screenAngle: () => 0,
    now: () => now,
    requestFrame: callback => { frames.set(++serial, callback); return serial; },
    cancelFrame: id => frames.delete(id),
    setTimer: (callback, delay) => { timers.set(++serial, { callback, at: now + delay }); return serial; },
    clearTimer: id => timers.delete(id),
    ...overrides,
  };
  const controller = createTicketTilt(env, point => points.push({ ...point }), status => states.push(status));
  return {
    controller, env, states, points, frames, timers,
    get requested() { return requested; }, get listening() { return Boolean(listener); },
    sample: (beta, gamma) => listener?.({ beta, gamma }),
    advance(ms) {
      const until = now + ms;
      while (now < until) {
        now += Math.min(16, until - now);
        for (const [id, timer] of [...timers]) if (timer.at <= now) { timers.delete(id); timer.callback(); }
        const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback());
      }
    },
  };
}

test('relative tilt handles a comfortable holding angle, screen rotation and angle wrap', () => {
  const origin = { beta: 70, gamma: 10 }, moved = { beta: 82.5, gamma: 35 };
  const portrait = orientationToTilt(moved, origin, 0);
  assert.equal(portrait.x, 1); assert.equal(portrait.y, 0.5);
  const landscape = orientationToTilt(moved, origin, 90);
  assert.ok(Math.abs(landscape.x - 0.5) < 1e-9); assert.equal(landscape.y, -1);
  assert.equal(orientationToTilt({ beta: -179, gamma: 0 }, { beta: 179, gamma: 0 }, 0).y, 0.08);
  assert.equal(orientationToTilt({ beta: null, gamma: 4 }, origin, 0), null);
});

test('no sensor access occurs on mount; enable invokes permission within the tap', async () => {
  let resolve, calls = 0;
  const r = rig({ requestPermission: () => { calls++; return new Promise(done => { resolve = done; }); } });
  assert.equal(calls, 0); assert.equal(r.listening, false);
  const pending = r.controller.enable();
  assert.equal(calls, 1); assert.equal(r.states.at(-1), 'requesting'); assert.equal(r.listening, false);
  resolve('granted'); await pending;
  assert.equal(r.states.at(-1), 'waiting'); assert.equal(r.listening, true);
  r.controller.dispose();
});

test('first sample calibrates; motion is smoothed, bounded and settles without an idle frame loop', async () => {
  const r = rig(); await r.controller.enable();
  r.sample(70, 10); r.advance(100);
  assert.equal(r.states.at(-1), 'active'); assert.equal(r.points.at(-1).x, 0); assert.equal(r.points.at(-1).y, 0);
  r.sample(82.5, 35); r.advance(16);
  assert.ok(r.points.at(-1).x > 0 && r.points.at(-1).x < 0.3);
  r.advance(1000); assert.equal(r.points.at(-1).x, 1); assert.equal(r.points.at(-1).y, 0.5);
  r.sample(-80, -80); r.advance(1000);
  assert.ok(r.points.every(point => Math.abs(point.x) <= 1 && Math.abs(point.y) <= 1));
  assert.equal(r.frames.size, 0); assert.equal(r.timers.size, 0);
  r.controller.dispose();
});

for (const permission of ['denied', 'reject']) test(`permission ${permission} leaves static lighting and no sensor listener`, async () => {
  const r = rig({ requestPermission: () => permission === 'reject' ? Promise.reject(new Error('blocked')) : Promise.resolve(permission) });
  await r.controller.enable();
  assert.equal(r.states.at(-1), 'denied'); assert.equal(r.listening, false); assert.equal(r.frames.size, 0);
  r.controller.dispose();
});

test('Android starts automatically without a button or permission API', () => {
  const r = rig({ requestPermission: undefined });
  r.controller.startAutomatically();
  assert.equal(r.listening, true); assert.equal(r.states.at(-1), 'waiting');
  r.sample(70, 10); r.sample(82.5, 35); r.advance(1000);
  assert.equal(r.states.at(-1), 'active'); assert.equal(r.points.at(-1).x, 1);
  r.controller.startAutomatically(); assert.equal(r.requested, 0);
  r.controller.dispose();
});

test('Safari restores an existing grant on load', async () => {
  const r = rig(); const startup = r.controller.startAutomatically();
  assert.equal(r.requested, 1); await startup;
  assert.equal(r.listening, true);
  r.controller.startAutomatically(); assert.equal(r.requested, 1);
  r.controller.dispose();
});

test('Safari without a prior grant falls back to the first ticket gesture', async () => {
  let calls = 0;
  const r = rig({ requestPermission: () => {
    calls++;
    return calls === 1 ? Promise.reject(new Error('A user gesture is required')) : Promise.resolve('granted');
  } });
  await r.controller.startAutomatically();
  assert.equal(r.states.at(-1), 'ready'); assert.equal(r.listening, false);
  r.controller.startAutomatically(); assert.equal(calls, 1, 'no repeated load requests');
  const permission = r.controller.enable();
  assert.equal(calls, 2, 'gesture requests permission synchronously');
  await permission; assert.equal(r.listening, true);
  r.controller.dispose();
});

test('granted motion access survives viewer remounts without another browser request', async () => {
  const permission = createTiltPermissionManager(permissionStorage());
  let requests = 0;
  const environment = {
    requestPermission: () => permission.request(() => { requests++; return Promise.resolve('granted'); }),
    permissionDecision: permission.getDecision,
  };
  const first = rig(environment); await first.controller.startAutomatically(); first.controller.dispose();
  const second = rig(environment); await second.controller.startAutomatically();
  second.sample(70, 10); second.sample(82.5, 35); second.advance(1000);
  assert.equal(requests, 1); assert.equal(second.states.at(-1), 'active');
  assert.equal(second.points.at(-1).x, 1);
  second.controller.dispose();
});

test('refreshing after Allow listens silently and verifies the browser still supplies sensor data', async () => {
  const storage = permissionStorage();
  await createTiltPermissionManager(storage).request(() => Promise.resolve('granted'));
  const reloaded = createTiltPermissionManager(storage);
  let requests = 0;
  const r = rig({
    requestPermission: () => reloaded.request(() => { requests++; return Promise.resolve('granted'); }),
    permissionDecision: reloaded.getDecision,
  });
  await r.controller.startAutomatically();
  assert.equal(requests, 0); assert.equal(r.states.at(-1), 'waiting');
  r.sample(70, 10); r.sample(82.5, 35); r.advance(1000);
  assert.equal(r.states.at(-1), 'active'); assert.equal(r.points.at(-1).x, 1);
  r.controller.dispose();
});

test('a stored Allow cannot fabricate sensor access or prompt again after Safari clears its grant', async () => {
  const storage = permissionStorage();
  await createTiltPermissionManager(storage).request(() => Promise.resolve('granted'));
  const reloaded = createTiltPermissionManager(storage);
  let requests = 0;
  const r = rig({
    requestPermission: () => reloaded.request(() => { requests++; return Promise.resolve('granted'); }),
    permissionDecision: reloaded.getDecision,
  });
  await r.controller.startAutomatically(); r.sample(null, null); r.advance(3100);
  assert.equal(requests, 0); assert.equal(r.states.at(-1), 'unavailable');
  assert.equal(r.listening, false); assert.equal(r.points.at(-1).x, 0);
  r.controller.setVisible(false); r.controller.setVisible(true); r.controller.startAutomatically();
  assert.equal(requests, 0, 'returning to the page does not trigger a prompt');
  const tapped = r.controller.enable();
  assert.equal(requests, 1, 'only an explicit ticket gesture can request access again');
  await tapped; r.sample(70, 10);
  assert.equal(r.states.at(-1), 'active');
  r.controller.dispose();
});

test('Cancel is respected across page reloads without another automatic request', async () => {
  const storage = permissionStorage();
  await createTiltPermissionManager(storage).request(() => Promise.resolve('denied'));
  const reloaded = createTiltPermissionManager(storage);
  let requests = 0;
  const r = rig({
    requestPermission: () => reloaded.request(() => { requests++; return Promise.resolve('granted'); }),
    permissionDecision: reloaded.getDecision,
  });
  await r.controller.startAutomatically(); r.controller.setVisible(false); r.controller.setVisible(true); r.controller.startAutomatically();
  assert.equal(requests, 0); assert.equal(r.listening, false); assert.equal(r.frames.size, 0);
  assert.equal(r.states.at(-1), 'denied', 'returning to the page cannot enable an accidental permission tap after Cancel');
  r.controller.dispose();
});

test('simultaneous viewers share one pending prompt and its result', async () => {
  const permission = createTiltPermissionManager();
  let resolve, requests = 0;
  const request = () => { requests++; return new Promise(done => { resolve = done; }); };
  const first = permission.request(request), second = permission.request(request);
  assert.equal(requests, 1); assert.equal(first, second);
  resolve('granted'); await Promise.all([first, second]);
  await permission.request(request); assert.equal(requests, 1);
});

test('activation errors are not saved as denials and the next gesture can still ask', async () => {
  const permission = createTiltPermissionManager(permissionStorage());
  await assert.rejects(permission.request(() => Promise.reject(new Error('A user gesture is required'))));
  assert.equal(permission.getDecision(), undefined);
  let called = false;
  const result = permission.request(() => { called = true; return Promise.resolve('granted'); });
  assert.equal(called, true, 'permission API runs synchronously inside the gesture');
  await result; assert.equal(permission.getDecision(), 'granted');
});

test('storage failures retain the decision for route remounts without crashing', async () => {
  const permission = createTiltPermissionManager({ getItem() { throw new Error('unavailable'); }, setItem() { throw new Error('unavailable'); } });
  assert.equal(permission.getDecision(), undefined);
  await permission.request(() => Promise.resolve('granted'));
  assert.equal(permission.getDecision(), 'granted');
  let calls = 0;
  await permission.request(() => { calls++; return Promise.resolve('granted'); });
  assert.equal(calls, 0);
});

test('automatic startup respects reduced motion, visibility and desktop pointer preview', () => {
  for (const mode of ['hidden', 'reduced-motion', 'desktop', 'insecure', 'unsupported']) {
    const r = rig({ requestPermission: undefined, pointerSupported: mode === 'desktop', secure: mode !== 'insecure', sensorSupported: mode !== 'unsupported' });
    if (mode === 'hidden') r.controller.setVisible(false);
    if (mode === 'reduced-motion') r.controller.setReducedMotion(true);
    r.controller.startAutomatically();
    assert.equal(r.listening, false); assert.equal(r.frames.size, 0);
    if (mode === 'hidden' || mode === 'reduced-motion') {
      r.controller.setVisible(true); r.controller.setReducedMotion(false);
      r.controller.startAutomatically(); assert.equal(r.listening, true);
    }
    r.controller.dispose();
  }
});

test('automatic Android sampling resumes with fresh calibration after returning to the ticket', () => {
  const r = rig({ requestPermission: undefined });
  r.controller.startAutomatically(); r.sample(70, 10); r.sample(82.5, 35); r.advance(1000);
  r.controller.setVisible(false); assert.equal(r.listening, false);
  r.controller.setVisible(true); r.controller.startAutomatically();
  assert.equal(r.listening, true);
  r.sample(40, -20); r.advance(1000);
  assert.equal(r.points.at(-1).x, 0); assert.equal(r.points.at(-1).y, 0);
  r.controller.dispose();
});

test('insecure or unsupported sensor contexts never request access', async () => {
  for (const overrides of [{ secure: false }, { sensorSupported: false }]) {
    const r = rig(overrides); await r.controller.enable();
    assert.equal(r.requested, 0); assert.equal(r.listening, false); assert.equal(r.states.length, 0);
    r.controller.dispose();
  }
});

test('missing or null sensor data times out cleanly and permits a retry', async () => {
  const r = rig(); await r.controller.enable(); r.sample(null, null); r.advance(3100);
  assert.equal(r.states.at(-1), 'unavailable'); assert.equal(r.listening, false); assert.equal(r.frames.size, 0); assert.equal(r.timers.size, 0);
  await r.controller.enable(); assert.equal(r.listening, true);
  r.controller.dispose();
});

test('reduced motion stops sampling and animation immediately and does not resume without a new opt-in', async () => {
  const r = rig(); await r.controller.enable(); r.sample(50, 0); r.sample(60, 20); r.advance(16);
  r.controller.setReducedMotion(true);
  assert.equal(r.states.at(-1), 'reduced-motion'); assert.equal(r.listening, false); assert.equal(r.frames.size, 0);
  assert.equal(r.points.at(-1).x, 0); assert.equal(r.points.at(-1).y, 0);
  await r.controller.enable(); assert.equal(r.requested, 1);
  r.controller.setReducedMotion(false); assert.equal(r.states.at(-1), 'ready'); assert.equal(r.listening, false);
  r.controller.dispose();
});

test('hidden screens release sensors and resume with a fresh calibration', async () => {
  const r = rig(); await r.controller.enable(); r.sample(50, 0); r.sample(60, 20); r.advance(16);
  r.controller.setVisible(false); assert.equal(r.listening, false); assert.equal(r.frames.size, 0);
  r.controller.setVisible(true); assert.equal(r.listening, true);
  r.sample(110, -40); r.advance(100); assert.equal(r.points.at(-1).x, 0); assert.equal(r.points.at(-1).y, 0);
  assert.equal(r.requested, 1);
  r.controller.dispose();
});

test('leaving or unmounting during the permission prompt cannot attach late listeners', async () => {
  for (const action of ['hide', 'dispose']) {
    let resolve;
    const r = rig({ requestPermission: () => new Promise(done => { resolve = done; }) });
    const pending = r.controller.enable();
    if (action === 'hide') r.controller.setVisible(false); else r.controller.dispose();
    const count = r.states.length; resolve('granted'); await pending;
    assert.equal(r.listening, false); assert.equal(r.states.length, count); assert.equal(r.frames.size, 0);
    r.controller.dispose();
  }
});

test('rotating the display recalibrates instead of jumping to the tilt limit', async () => {
  let angle = 0;
  const r = rig({ screenAngle: () => angle }); await r.controller.enable();
  r.sample(60, 0); angle = 90; r.sample(110, -40); r.advance(100);
  assert.equal(r.points.at(-1).x, 0); assert.equal(r.points.at(-1).y, 0);
  r.sample(122.5, -40); r.advance(1000); assert.ok(Math.abs(r.points.at(-1).x - 0.5) < 1e-9);
  r.controller.dispose();
});

test('desktop preview uses no sensor permission, clamps pointer input, and respects reduced motion', () => {
  const r = rig({ pointerSupported: true, sensorSupported: false });
  assert.equal(r.states.at(-1), 'pointer');
  r.controller.pointer({ x: 9, y: -9 }); r.advance(1000);
  assert.equal(r.points.at(-1).x, 1); assert.equal(r.points.at(-1).y, -1); assert.equal(r.requested, 0);
  r.controller.pointer({ x: 0, y: 0 }); r.advance(1000); assert.equal(r.frames.size, 0);
  r.controller.setReducedMotion(true); r.controller.pointer({ x: 1, y: 1 }); r.advance(100);
  assert.equal(r.points.at(-1).x, 0); assert.equal(r.frames.size, 0);
  r.controller.dispose();
});
