/* global __dirname */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const { test, before } = require('node:test');
const ts = require('typescript');

let buildTicketAztecSvg;
let encoder;
before(async () => {
  encoder = await import(pathToFileURL(path.resolve(__dirname, '../node_modules/@bwip-js/generic/dist/bwip-js-gen.mjs')).href);
  const module = { exports: {} };
  const source = fs.readFileSync(path.resolve(__dirname, '../src/lib/ticket-code.ts'), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    module, exports: module.exports, require: () => encoder,
  });
  ({ buildTicketAztecSvg } = module.exports);
});

test('stored barcode values are encoded unchanged, including significant whitespace', () => {
  const value = ' DEMO-DON-102-12-2 ';
  const svg = buildTicketAztecSvg(value);
  assert.equal(svg, encoder.azteccode({ text: value, scale: 4, format: 'full', layers: 12, backgroundcolor: 'FFFFFF', barcolor: '000000' }, encoder.drawingSVG()));
  assert.notEqual(svg, buildTicketAztecSvg(value.trim()));
  assert.notEqual(svg, buildTicketAztecSvg('DEMO-DON-102-12-3'));
  assert.match(svg, /^<svg viewBox="0 0 (\d+) \1"/);
});

test('missing or oversized values show unavailable instead of fabricating a ticket code', () => {
  for (const value of [undefined, '', '   ', 'x'.repeat(1001)]) assert.equal(buildTicketAztecSvg(value), null);
});

test('ticket data is encoded as paths and cannot inject SVG markup', () => {
  const svg = buildTicketAztecSvg('<script>alert(1)</script>');
  assert.match(svg, /<path /);
  assert.doesNotMatch(svg, /<script|alert\(1\)/);
});
