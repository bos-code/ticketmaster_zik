const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function load(relative, overrides = {}) {
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(path.join(root, relative), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(source, { module, exports: module.exports, require: (name) => overrides[name] ?? require(name), Date }, { filename: relative });
  return module.exports;
}
const artworkImages = Object.fromEntries(Object.keys(JSON.parse(fs.readFileSync(path.join(root, 'docs/design/home-artwork-sources.json'), 'utf8'))).map((key, index) => [key, index + 1]));
const imageModule = { homeArtworkImages: artworkImages };
const feed = load('src/components/discovery/home-feed-data.ts', { '@/constants/home-artwork-images': imageModule });
const catalog = load('src/lib/sample-event-catalog.ts', { './home-artwork': load('src/lib/home-artwork.ts'), '@/constants/home-artwork-images': imageModule });
const { toDiscoveryEvent } = load('src/components/discovery/discovery-data.ts');
function event(id, date, extra = {}) { return { id, title: id, artist: id, city: 'Los Angeles, CA', date, image: 'image', ...extra }; }

test('all sample listings have unique event IDs, details and no ticket inventory', () => {
  assert.equal(catalog.sampleEventCatalog.length, 26);
  assert.equal(new Set(catalog.sampleEventCatalog.map((item) => item.id)).size, 26);
  for (const record of catalog.sampleEventCatalog) {
    assert.equal(record.sample, true);
    assert.ok(record.description.includes('sample event'));
    assert.equal(record.seatOptions.length, 0);
    assert.ok(record.discovery.category);
    assert.equal(toDiscoveryEvent(record).id, record.id);
  }
});
test('incoming event updates take precedence and merging never duplicates records', () => {
  const incoming = { ...catalog.sampleEventCatalog[0], title: 'Updated title' };
  const merged = catalog.withSampleCatalog([incoming, { id: 'my-admin-event' }]);
  assert.equal(merged.length, 27);
  assert.equal(merged[0].title, 'Updated title');
  assert.ok(merged.some((item) => item.id === 'my-admin-event'));
  assert.equal(catalog.withSampleCatalog(merged).length, merged.length);
});
test('date sections exclude past events and respect the two-week boundary', () => {
  const events = [event('past', '2026-10-10'), event('today', '2026-10-11'), event('edge', '2026-10-24'), event('later', '2026-10-25')];
  const sections = feed.getHomeSections(events, new Date(2026, 9, 11, 12));
  assert.deepEqual(Array.from(sections['last-minute'], (item) => item.id), ['today', 'edge']);
  assert.equal(sections.explore.length, 4);
});
for (const [day, expected] of [[8, ['fri', 'sat', 'sun']], [9, ['fri', 'sat', 'sun']], [10, ['sat', 'sun']], [11, ['sun']], [12, ['next-fri']]]) {
  test(`weekend selection on October ${day} follows the calendar`, () => {
    const events = [event('thu', '2026-10-08'), event('fri', '2026-10-09'), event('sat', '2026-10-10'), event('sun', '2026-10-11'), event('mon', '2026-10-12'), event('next-fri', '2026-10-16')];
    assert.deepEqual(Array.from(feed.getHomeSections(events, new Date(2026, 9, day, 12)).weekend, (item) => item.id), expected);
  });
}
test('announcement/presale/category sections use explicit metadata and update with the catalog', () => {
  const base = event('unknown', '2026-11-01');
  assert.equal(feed.getHomeSections([base], new Date(2026, 9, 11)).concerts.length, 0);
  const updated = { ...base, category: 'concerts', announcedAt: '2026-10-10', presale: { sponsor: 'Partner', opensAt: '2026-10-15' } };
  const sections = feed.getHomeSections([updated, event('future-announcement', '2026-12-01', { announcedAt: '2026-10-20' })], new Date(2026, 9, 11));
  assert.equal(sections.concerts.length, 1);
  assert.equal(sections.announced.length, 1);
  assert.equal(sections.presales.length, 1);
});
test('artist counts and city guides are derived from matching events', () => {
  const events = [event('a', '2026-11-01', { artist: 'My Artist' }), event('b', '2026-11-02', { artist: 'My Artist' }), event('c', '2026-11-03', { city: 'Chicago, IL' })];
  assert.equal(feed.groupArtists(events)[0].events.length, 2);
  const cities = feed.groupCities(events);
  assert.equal(cities.length, 2);
  assert.equal(cities.find((item) => item.city === 'Los Angeles, CA').events.length, 2);
});
test('bubble hides down, reveals up, ignores jitter and clamps overscroll', () => {
  let state = feed.initialPromptScrollState;
  state = feed.updatePromptScroll(state, 10, 1000); assert.equal(state.visible, true);
  state = feed.updatePromptScroll(state, 30, 1000); assert.equal(state.visible, false);
  state = feed.updatePromptScroll(state, 100, 1000);
  state = feed.updatePromptScroll(state, 98, 1000); assert.equal(state.visible, false);
  state = feed.updatePromptScroll(state, 80, 1000); assert.equal(state.visible, true);
  state = feed.updatePromptScroll(state, 1000, 1000); assert.equal(state.visible, false);
  state = feed.updatePromptScroll(state, 1030, 1000);
  state = feed.updatePromptScroll(state, 1000, 1000); assert.equal(state.visible, false);
  state = feed.updatePromptScroll(state, 978, 1000); assert.equal(state.visible, true);
  state = feed.updatePromptScroll(state, -20, 1000); assert.equal(state.visible, true); assert.equal(state.offset, 0);
});
test('sample listings cannot create real reservations', async () => {
  let writes = 0;
  const store = load('src/store/use-event-store.ts', {
    '@/lib/firebase-data': { createEventDocument: async () => {}, upsertReservationDocument: async () => { writes++; } },
    '@/lib/data': { eventCatalog: [], initialReservations: [] },
    '@/lib/mock-events': {}, '@/lib/sample-event-catalog': catalog,
  }).useEventStore;
  store.getState().replaceEvents([]);
  assert.equal(store.getState().events.length, 26);
  const result = await store.getState().reserveTickets({ eventId: catalog.sampleEventCatalog[0].id, seatIds: ['fictional-seat'] });
  assert.equal(result, null); assert.equal(writes, 0);
});
