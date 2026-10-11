const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

// Execute the actual embedded map script with inert DOM/map adapters, without
// loading third-party scripts, making network requests or controlling a browser.
const filename = path.resolve(__dirname, '../src/components/events/apple-maps-webview.tsx');
const source = fs.readFileSync(filename, 'utf8') + '\nexport { buildAppleMapsHtml };';
const moduleValue = { exports: {} };
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, {
  module: moduleValue, exports: moduleValue.exports,
  process: { env: {} },
  require(name) {
    if (name === 'react-native') return { StyleSheet: { create: (styles) => styles } };
    if (name === 'react-native-webview') return {};
    return require(name);
  },
});
const { buildAppleMapsHtml } = moduleValue.exports;
function runMap({ appearance, preview }) {
  const html = buildAppleMapsHtml({ appearance, preview, apiKey: '', latitude: 39.98, longitude: -83.02, shouldResolveInitialAddress: false, venueName: 'My venue </script>', venueAddress: 'My address' });
  const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].at(-1)[1];
  const nodes = new Map();
  const children = [];
  const markers = [];
  const handlers = {};
  let options;
  const node = () => ({ style: { setProperty() {} }, classList: { add() {}, remove() {}, toggle() {} }, addEventListener() {}, appendChild() {}, textContent: '' });
  const document = {
    body: { style: {}, appendChild: (child) => children.push(child) },
    createElement: node,
    getElementById: (id) => { if (!nodes.has(id)) nodes.set(id, node()); return nodes.get(id); },
    querySelectorAll: () => [...['searchInput', 'layersButton', 'compass', 'sheet'].map((id) => document.getElementById(id))],
  };
  class Marker {
    constructor(config) { this.config = config; markers.push(this); }
    setLngLat(coordinate) { this.coordinate = coordinate; return this; }
    addTo() { return this; }
    on() { return this; }
    setDraggable(value) { this.draggable = value; }
  }
  class MapAdapter {
    constructor(config) { options = config; }
    on(event, callback) { handlers[event] = callback; }
  }
  vm.runInNewContext(script, { document, window: {}, navigator: {}, maplibregl: { Map: MapAdapter, Marker } });
  handlers.load();
  return { options, markers, children, nodes };
}
test('ticket map preview uses the actual venue, dark palette and a fixed pin', () => {
  const map = runMap({ appearance: 'dark', preview: true });
  assert.deepEqual(Array.from(map.options.center), [-83.02, 39.98]);
  assert.equal(map.options.pitch, 0);
  assert.equal(map.options.style.layers[0].paint['background-color'], '#28343B');
  assert.equal(map.markers.length, 1, 'no invented food, transit or shopping pins');
  assert.equal(map.markers[0].draggable, false);
  assert.equal(map.children[0].textContent, 'My venue </script>', 'venue text cannot break the inline script');
  assert.equal(map.nodes.get('sheet').style.display, 'none');
  assert.equal(map.options.attributionControl.compact, true);
});
test('full location picker retains its existing light map and controls', () => {
  const map = runMap({ appearance: 'light', preview: false });
  assert.equal(map.options.pitch, 24);
  assert.equal(map.options.style.layers[0].paint['background-color'], '#F7F5EC');
  assert.equal(map.markers[0].draggable, true);
  assert.equal(map.nodes.get('sheet').style.display, undefined);
});
