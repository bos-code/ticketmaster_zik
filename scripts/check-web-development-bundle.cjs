// Run with the directory from an Expo web export using --dev --no-minify.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

async function main() {
  assert.ok(process.argv[2], 'Pass an Expo web development export directory');
  const directory = path.join(process.argv[2], '_expo/static/js/web');
  const definitions = new Map();
  for (const filename of fs.readdirSync(directory).filter((name) => name.endsWith('.js'))) {
    const source = fs.readFileSync(path.join(directory, filename), 'utf8');
    // Unlike a production export, development middleware may retain import.meta.
    // A Metro factory is a script, so parse the actual output in script mode.
    new vm.Script(source, { filename });
    for (const match of source.matchAll(/},(\d+),(\[[^\n]*\]|\{[^\n]*\}),("[^\n]*")\);$/gm)) {
      definitions.set(Number(match[1]), {
        dependencies: JSON.parse(match[2]), name: JSON.parse(match[3]), source,
        start: source.lastIndexOf('\n__d(function ', match.index) + 1,
        end: match.index + match[0].length,
      });
    }
  }
  assert.ok(definitions.size, 'No Metro development modules found');
  for (const definition of definitions.values()) {
    for (const dependency of Object.values(definition.dependencies)) {
      if (typeof dependency === 'number') {
        assert.ok(definitions.has(dependency), `${definition.name} references unknown module ${dependency}`);
      }
    }
  }
  const fan = [...definitions].find(([, definition]) => definition.name === 'src/store/use-fan-store.ts');
  assert.ok(fan, 'Fan store missing from the development bundle');
  const memory = new Map();
  const storage = {
    getItem: async (key) => memory.get(key) ?? null,
    setItem: async (key, value) => memory.set(key, value),
    removeItem: async (key) => memory.delete(key),
  };
  // Only the device adapter is replaced; execute the actual bundled persistence
  // middleware that previously failed before the Account screen could render.
  const modules = new Map([
    [fan[1].dependencies[0], require('zustand')],
    [fan[1].dependencies[2], { preferenceStorage: storage }],
  ]);
  const context = vm.createContext({ console, process: { env: { NODE_ENV: 'development' } } });
  context.global = context;
  function requireModule(id) {
    if (modules.has(id)) return modules.get(id);
    const definition = definitions.get(id);
    assert.ok(definition, `Unknown module ${id}`);
    let factory;
    context.__d = (value) => { factory = value; };
    vm.runInContext(definition.source.slice(definition.start, definition.end), context);
    const module = { exports: {} };
    modules.set(id, module.exports);
    factory(context, requireModule, (value) => requireModule(value).default ?? requireModule(value), requireModule, module, module.exports, definition.dependencies);
    return module.exports;
  }
  const store = requireModule(fan[0]).useFanStore;
  await store.persist.rehydrate();
  store.getState().toggleSavedEvent('event-runtime-check');
  assert.equal(store.getState().savedEventIds[0], 'event-runtime-check');
  assert.ok(memory.has('ticketmaster-fan-preferences'));
  console.log(`PASS: ${definitions.size} development modules parse and resolve; bundled fan store and persistence middleware execute.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
