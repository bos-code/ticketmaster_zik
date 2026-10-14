const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

function load(relative, overrides = {}, globals = {}) {
  const source = fs.readFileSync(path.resolve(__dirname, '..', relative), 'utf8');
  const module = { exports: {} };
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    module, exports: module.exports, process: { env: {} }, URL, AbortController, setTimeout, clearTimeout,
    require: (name) => overrides[name] ?? require(name), ...globals,
  });
  return module.exports;
}
const maps = load('src/lib/map-utils.ts', { 'react-native': { Linking: {}, Platform: { OS: 'web' } } });
const geocoder = (fetch) => load('src/lib/venue-geocoding.ts', { '@/lib/map-utils': maps }, { fetch });

test('venue query includes the city and does not repeat a venue already in the address', () => {
  const { getVenueSearchQuery } = geocoder();
  assert.equal(getVenueSearchQuery('Toyota Center', 'Houston, TX, US'), 'Toyota Center, Houston, TX, US');
  assert.equal(getVenueSearchQuery(' Toyota Center ', 'Toyota Center, Houston, TX, US'), 'Toyota Center, Houston, TX, US');
  assert.equal(getVenueSearchQuery('Toyota Center'), 'Toyota Center');
  assert.equal(getVenueSearchQuery('', ''), '');
});

test('address-only Toyota Center resolves to its Houston coordinates in latitude/longitude order', async () => {
  let requested;
  const { geocodeVenue } = geocoder(async (url) => {
    requested = new URL(url);
    return { ok: true, json: async () => ({ features: [{ geometry: { type: 'Point', coordinates: [-95.3622315, 29.7507473] } }] }) };
  });
  const coordinate = await geocodeVenue('Toyota Center, Houston, TX, US');
  assert.equal(requested.searchParams.get('q'), 'Toyota Center, Houston, TX, US');
  assert.equal(coordinate.latitude, 29.7507473);
  assert.equal(coordinate.longitude, -95.3622315);
});

test('empty, malformed and out-of-range results never produce a map at an unrelated default venue', async () => {
  for (const result of [
    { features: [] },
    { features: [{ geometry: { type: 'Point', coordinates: ['-95', '29'] } }] },
    { features: [{ geometry: { type: 'Point', coordinates: [-195, 129] } }] },
  ]) {
    const { geocodeVenue } = geocoder(async () => ({ ok: true, json: async () => result }));
    await assert.rejects(geocodeVenue('Unknown venue'), /could not be located/);
  }
});

test('network failure and cancelled lookup reject rather than leaving a fabricated map', async () => {
  const failed = geocoder(async () => ({ ok: false }));
  await assert.rejects(failed.geocodeVenue('Toyota Center'), /unavailable/);
  const controller = new AbortController();
  controller.abort();
  const cancelled = geocoder(async (_, options) => {
    assert.equal(options.signal.aborted, true);
    throw new Error('aborted');
  });
  await assert.rejects(cancelled.geocodeVenue('Toyota Center', controller.signal), /aborted/);
});

test('ticket mapping preserves supplied venue coordinates, including coordinates at zero', () => {
  const { mapTicketRecordToTicketOrderData } = load('src/data/ticketOrder.ts', {
    '@/lib/map-utils': maps,
    '@/store/ticketStore': { getSimpleTicketSeatNumbers: () => ['1'] },
  });
  const ticket = { id: 'test-order', eventName: 'Test event', venue: 'Toyota Center', city: 'Houston', state: 'TX', country: 'US',
    date: '2026-11-08', time: '7:30 PM', image: '', orderNumber: 'test', seatRange: '1', seatLabel: '', ticketType: 'Standard',
    ticketNote: '', section: '105', row: 'F', barcode: '', status: 'upcoming' };
  const resolved = mapTicketRecordToTicketOrderData({ ...ticket, latitude: 29.7507473, longitude: -95.3622315 });
  assert.equal(resolved.event.latitude, 29.7507473);
  assert.equal(resolved.event.longitude, -95.3622315);
  const zero = mapTicketRecordToTicketOrderData({ ...ticket, latitude: 0, longitude: 0 });
  assert.equal(zero.event.latitude, 0);
  assert.equal(zero.event.longitude, 0);
  const unknown = mapTicketRecordToTicketOrderData(ticket);
  assert.equal(unknown.event.latitude, null);
  assert.equal(unknown.event.venueAddress, 'Toyota Center, Houston, TX, US');
});
