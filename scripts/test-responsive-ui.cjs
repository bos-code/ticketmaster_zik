const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function loadSource(relative, overrides = {}) {
  const source = ts.transpileModule(fs.readFileSync(path.join(root, relative), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(source, { module, exports: module.exports, require: (name) => overrides[name] ?? require(name) }, { filename: relative });
  return module.exports;
}
const { getFanLayout, getViewerLayout } = loadSource('src/lib/fan-layout.ts');
const profile = loadSource('src/lib/fan-profile.ts');

for (const width of [320, 390, 430, 768, 844, 1366]) {
  test(`content fits a ${width}px viewport, including landscape safe areas`, () => {
    for (const available of [width, width - 88]) {
      const layout = getFanLayout(available);
      const columns = layout.wide ? 2 : 1;
      assert.ok(layout.columnWidth > 0);
      assert.ok(Math.abs(layout.columnWidth * columns + (columns - 1) * 24 + layout.padding * 2 - available) < 0.001);
      assert.ok(layout.eventCardWidth <= layout.contentWidth);
      assert.ok(layout.compactCardWidth > 0 && layout.compactCardWidth <= layout.contentWidth);
      assert.ok(layout.cityCardWidth > 0 && layout.cityCardWidth <= layout.contentWidth);
      assert.ok(layout.artistGroupWidth <= layout.contentWidth);
      const viewer = getViewerLayout(available);
      assert.ok(viewer.cardWidth <= 480);
      assert.ok(viewer.sidePadding >= 16);
      assert.equal(viewer.cardWidth + viewer.sidePadding * 2, available);
      // At each snapped seat, its card remains centered, including the last one.
      for (const index of [0, 1, 7]) {
        const center = viewer.sidePadding + index * viewer.snapInterval + viewer.cardWidth / 2 - index * viewer.snapInterval;
        assert.equal(center, available / 2);
      }
    }
  });
}
test('resizing returns to the original geometry without a stale phone cap', () => {
  const first = getViewerLayout(390);
  assert.ok(getViewerLayout(1366).sidePadding > first.sidePadding);
  assert.deepEqual(getViewerLayout(390), first);
});

function memoryStorage(initial) {
  const memory = new Map(initial ? [['ticketmaster-fan-preferences', JSON.stringify(initial)]] : []);
  return { getItem: async (key) => memory.get(key) ?? null, setItem: async (key, value) => memory.set(key, value), removeItem: async (key) => memory.delete(key) };
}
function createFanStore(storage) {
  return loadSource('src/store/use-fan-store.ts', { '@/lib/fan-profile': profile, '@/lib/preference-storage': { preferenceStorage: storage } }).useFanStore;
}
test('old screenshot identity is cleared while real saved events survive', async () => {
  const storage = memoryStorage({ version: 0, state: { profile: { name: 'Zik Zik', email: 'zik.graphix@gmail.com' }, savedEventIds: ['reference-weezer', 'real-order-event'], favouriteArtistIds: ['reference-mayer'], watchlistTab: 'favourites' } });
  const store = createFanStore(storage);
  await store.persist.rehydrate();
  assert.equal(store.getState().profile.name, '');
  assert.equal(store.getState().profile.email, '');
  assert.deepEqual(Array.from(store.getState().savedEventIds), ['real-order-event']);
  assert.equal(store.getState().watchlistTab, 'favourites');
});
test('edited identity survives migration and subsequent profile edits persist', async () => {
  const storage = memoryStorage({ version: 0, state: { profile: { name: 'My Name', email: 'me@example.test' } } });
  const store = createFanStore(storage);
  await store.persist.rehydrate();
  assert.equal(store.getState().profile.name, 'My Name');
  store.getState().updateProfile({ name: 'Updated Name', email: 'updated@example.test' });
  store.getState().toggleSavedEvent('event-1');
  store.getState().toggleFavouriteArtist('event-2');
  const reopened = createFanStore(storage);
  await reopened.persist.rehydrate();
  assert.equal(reopened.getState().profile.name, 'Updated Name');
  assert.equal(reopened.getState().profile.email, 'updated@example.test');
  assert.deepEqual(Array.from(reopened.getState().savedEventIds), ['event-1']);
  reopened.getState().toggleSavedEvent('event-1');
  assert.equal(reopened.getState().savedEventIds.length, 0);
});
test('new profiles contain no supplied screenshot identity', async () => {
  const store = createFanStore(memoryStorage());
  await store.persist.rehydrate();
  assert.equal(store.getState().profile.name, '');
  assert.equal(store.getState().profile.email, '');
});
test('discovery data tracks event changes and retains the venue local date/time', () => {
  const { toDiscoveryEvent, eventDateParts } = loadSource('src/components/discovery/discovery-data.ts');
  const record = { id: 'real-event', title: 'My event', shortTitle: 'My artist', startsAt: '2026-12-19T20:30:00+01:00', venue: 'My venue', city: 'Lagos', imageUrl: 'https://example.test/banner.jpg' };
  const result = toDiscoveryEvent(record);
  assert.equal(result.id, record.id);
  assert.equal(result.title, record.title);
  assert.equal(result.time, '8:30 PM');
  assert.equal(result.date, '2026-12-19');
  assert.equal(eventDateParts(result.date).day, '19');
  assert.equal(toDiscoveryEvent({ ...record, title: 'Updated event' }).title, 'Updated event');
});
