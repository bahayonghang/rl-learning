import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isThemePreference, resolveTheme } from '../src/theme';
import { loadState, parseState, saveState, STORAGE_KEY } from '../src/storage';

test('explicit themes override the OS, while system follows either OS appearance', () => {
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
  assert.equal(resolveTheme('system', true), 'dark');
  assert.equal(resolveTheme('system', false), 'light');
  for (const candidate of ['auto', '__proto__', null, undefined, false, {}, 1]) {
    assert.equal(isThemePreference(candidate), false);
  }
});

test('new preferences use system appearance without changing existing explicit choices', () => {
  assert.equal(parseState(null).theme, 'system');
  assert.equal(parseState('{broken').theme, 'system');
  for (const version of [1, 2]) {
    for (const theme of ['light', 'dark', 'system'] as const) {
      const state = parseState(JSON.stringify({
        version, theme, completed: ['01', '24'], textSize: 'large', locale: 'en',
        notes: { '01': 'old private content' }, bookmarks: ['01'], lastChapter: '12',
      }));
      assert.deepEqual(state, { version: 2, theme, completed: ['01', '24'], textSize: 'large', locale: 'en' });
    }
  }
});

test('system preference round-trips under the existing key without modifying legacy storage', () => {
  const legacy = JSON.stringify({ version: 1, theme: 'light', completed: ['03'], notes: { '03': 'untouched' } });
  const records = new Map([['rl-atlas-learning-v1', legacy]]);
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: (key: string) => records.get(key) ?? null, setItem: (key: string, value: string) => records.set(key, value) },
  });
  try {
    const state = loadState();
    assert.equal(state.theme, 'light');
    state.theme = 'system';
    assert.equal(saveState(state), true);
    assert.equal(loadState().theme, 'system');
    assert.deepEqual(loadState().completed, ['03']);
    assert.equal(records.get('rl-atlas-learning-v1'), legacy);
    assert.doesNotMatch(records.get(STORAGE_KEY)!, /notes|bookmarks|lastChapter|untouched/);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});

test('blocked preference storage retains usable defaults and reports unsuccessful persistence', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get: () => { throw new Error('Storage disabled'); },
  });
  try {
    const state = loadState();
    assert.equal(state.theme, 'system');
    assert.equal(resolveTheme(state.theme, true), 'dark');
    assert.equal(saveState(state), false);
    assert.deepEqual(state.completed, []);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});
