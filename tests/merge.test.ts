import test from 'node:test';
import assert from 'node:assert/strict';

import { deepMerge } from '../packages/merge/index.ts';

test('deepMerge keeps normal nested merge behavior', () => {
  const target = { a: 1, nested: { keep: true, value: 1 } };
  const source = { nested: { value: 2, added: 'ok' } };

  const result = deepMerge(target, source);

  assert.deepEqual(result, {
    a: 1,
    nested: {
      keep: true,
      value: 2,
      added: 'ok'
    }
  });
});

test('deepMerge ignores __proto__ payloads', () => {
  const malicious = JSON.parse('{"__proto__":{"polluted":"yes"}}') as Record<string, unknown>;

  const result = deepMerge({}, malicious);

  assert.equal(({} as Record<string, unknown>).polluted, undefined);
  assert.deepEqual(result, {});
});

test('deepMerge ignores constructor/prototype payloads', () => {
  const malicious = JSON.parse(
    '{"constructor":{"prototype":{"polluted":"yes"}},"safe":{"value":1}}'
  ) as Record<string, unknown>;

  const result = deepMerge({ safe: {} }, malicious);

  assert.equal(({} as Record<string, unknown>).polluted, undefined);
  assert.deepEqual(result, { safe: { value: 1 } });
});

test('deepMerge only merges own enumerable properties from source', () => {
  const source = Object.create({ inherited: 'ignore me' }) as Record<string, unknown>;
  source.own = 'keep me';

  const result = deepMerge({}, source);

  assert.deepEqual(result, { own: 'keep me' });
});

test('deepMerge replaces Date instead of recursing into it', () => {
  const target = { d: new Date('2020-01-01T00:00:00.000Z') };
  const source = { d: new Date('2021-06-06T00:00:00.000Z') };

  const result = deepMerge(target, source);

  assert.ok(result.d instanceof Date);
  assert.equal(result.d.toISOString(), '2021-06-06T00:00:00.000Z');
});

test('deepMerge replaces RegExp, Map, Set and class instances', () => {
  class Box {
    v: number;

    constructor(v: number) {
      this.v = v;
    }
  }

  const target = {
    re: /a/,
    map: new Map([['a', 1]]),
    set: new Set([1]),
    box: new Box(1)
  };
  const source = {
    re: /b/,
    map: new Map([['b', 2]]),
    set: new Set([2]),
    box: new Box(2)
  };

  const result = deepMerge(target, source);

  assert.equal(result.re.source, 'b');
  assert.deepEqual([...result.map], [['b', 2]]);
  assert.deepEqual([...result.set], [2]);
  assert.equal(result.box.v, 2);
  assert.ok(result.box instanceof Box);
});

test('deepMerge survives circular references on both sides', () => {
  const target: Record<string, unknown> = { a: 1 };
  target.self = target;
  const source: Record<string, unknown> = { b: 2 };
  source.self = source;

  const result = deepMerge(target, source) as Record<string, unknown>;

  assert.equal(result.a, 1);
  assert.equal(result.b, 2);
  assert.equal(result.self, result);
});

test('deepMerge still merges null-prototype objects', () => {
  const source = JSON.parse('{"nested":{"value":2}}') as Record<string, unknown>;
  const nullProto = Object.create(null) as Record<string, unknown>;
  nullProto.value = 1;
  nullProto.keep = true;

  const result = deepMerge({ nested: nullProto }, source);

  assert.deepEqual({ ...(result.nested as object) }, { value: 2, keep: true });
});

test('deepMerge merges arrays by index and keeps extra target items', () => {
  const result = deepMerge({ list: [{ a: 1 }, { b: 2 }, 'keep'] }, { list: [{ a: 9 }] });

  assert.deepEqual(result.list, [{ a: 9 }, { b: 2 }, 'keep']);
});

test('deepMerge excludeKeys replaces instead of deep merging', () => {
  const result = deepMerge(
    { keep: { a: 1 }, raw: { a: 1 } },
    { keep: { b: 2 }, raw: { b: 2 } },
    { excludeKeys: (key) => key === 'raw' }
  );

  assert.deepEqual(result, { keep: { a: 1, b: 2 }, raw: { b: 2 } });
});
