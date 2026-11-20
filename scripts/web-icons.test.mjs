import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
function loadSource(relative) {
  const filename = new URL(relative, import.meta.url);
  const source = readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, {
    fileName: filename.pathname,
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'exports', 'module', compiled)(require, module.exports, module);
  return module.exports.default;
}
const oldCharacters = {
  close: '✕', check: '✓', 'chevron-right': '›', 'chevron-left': '‹',
  'chevron-down': '▾', list: '☰', search: '⌕', minus: '–', plus: '+',
  expand: '⤢', pan: '↔', world: '◐', point: '○',
};

test('every web icon renders real decorative Lucide SVG at the requested size', () => {
  const WebIcon = loadSource('../src/UiIcon.web.tsx');
  for (const name of Object.keys(oldCharacters)) {
    const html = renderToStaticMarkup(React.createElement(WebIcon, { name, size: 20 }));
    assert.match(html, /^<svg\b/);
    assert.match(html, /class="lucide /);
    assert.match(html, /aria-hidden="true"/);
    assert.match(html, /focusable="false"/);
    assert.match(html, /width="20"/);
    assert.match(html, /height="20"/);
    assert.match(html, /stroke="currentColor"/);
    assert.ok(!html.includes(oldCharacters[name]), name + ' must not render the old text icon on web');
  }
});

test('native fallback preserves the previous text, without importing native services', () => {
  const Fallback = loadSource('../src/UiIcon.tsx');
  for (const [name, character] of Object.entries(oldCharacters)) assert.equal(Fallback({ name }), character);
});


test('the installed Metro resolver selects the Lucide web adapter and keeps the native fallback', () => {
  const { resolve } = require('metro-resolver');
  const root = path.resolve(new URL('..', import.meta.url).pathname);
  const context = {
    originModulePath: path.join(root, 'src/Atlas.tsx'),
    sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx'],
    assetExts: new Set(),
    mainFields: ['react-native', 'browser', 'main'],
    preferNativePlatform: true,
    getPackageForModule: () => null,
    fileSystemLookup(filename) {
      try {
        const stat = statSync(filename);
        return { exists: true, type: stat.isDirectory() ? 'd' : 'f', realPath: realpathSync(filename) };
      } catch { return { exists: false }; }
    },
  };
  assert.equal(resolve(context, './UiIcon', 'web').filePath, path.join(root, 'src/UiIcon.web.tsx'));
  assert.equal(resolve(context, './UiIcon', 'ios').filePath, path.join(root, 'src/UiIcon.tsx'));
});
