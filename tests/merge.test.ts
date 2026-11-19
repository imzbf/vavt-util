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

test('deepMerge replaces RegExp, Map and Set while merging class fields', () => {
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
  const originalBox = target.box;
  Object.assign(originalBox, { keep: true });

  const result = deepMerge(target, source);

  assert.equal(result.re.source, 'b');
  assert.deepEqual([...result.map], [['b', 2]]);
  assert.deepEqual([...result.set], [2]);
  assert.equal(result.box.v, 2);
  assert.ok(result.box instanceof Box);
  assert.equal(result.box, originalBox);
  assert.equal((result.box as Box & { keep: boolean }).keep, true);
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

test('deepMerge preserves classes with a custom toStringTag', () => {
  class Config {
    get [Symbol.toStringTag]() {
      return 'Config';
    }
    nested = { keep: true };
  }
  const config = new Config();
  const result = deepMerge({ config }, { config: { nested: { added: true } } });

  assert.equal(result.config, config);
  assert.deepEqual(result.config.nested, { keep: true, added: true });
});

test('deepMerge keeps distinct target branches when the source object is shared', () => {
  const shared = { added: true };
  const a = { aOnly: 1 };
  const b = { bOnly: 2 };
  const target = { a, b };
  const result = deepMerge(target, { a: shared, b: shared });

  assert.equal(result, target);
  assert.equal(result.a, a);
  assert.equal(result.b, b);
  assert.deepEqual(result, { a: { aOnly: 1, added: true }, b: { bOnly: 2, added: true } });
});

test('deepMerge keeps distinct target arrays when the source array is shared', () => {
  const shared = [{ added: true }];
  const result = deepMerge(
    { a: [{ aOnly: 1 }, 'a-tail'], b: [{ bOnly: 2 }, 'b-tail'] },
    { a: shared, b: shared }
  );

  assert.notEqual(result.a, result.b);
  assert.deepEqual(result, {
    a: [{ aOnly: 1, added: true }, 'a-tail'],
    b: [{ bOnly: 2, added: true }, 'b-tail']
  });
});

test('deepMerge handles cycles independently for shared source branches', () => {
  const shared: Record<string, unknown> = { added: true };
  shared.self = shared;
  const a: Record<string, unknown> = { keep: 'a' };
  a.self = a;
  const b: Record<string, unknown> = { keep: 'b' };
  b.self = b;

  const result = deepMerge({ a, b }, { a: shared, b: shared });
  assert.equal(result.a.self, result.a);
  assert.equal(result.b.self, result.b);
  assert.equal(result.a.keep, 'a');
  assert.equal(result.b.keep, 'b');
  assert.notEqual(result.a, result.b);
});

test('deepMerge returns a new root array and leaves its original entries intact', () => {
  const target = [1, 2];
  const result = deepMerge(target, [3]);
  assert.notEqual(result, target);
  assert.deepEqual(target, [1, 2]);
  assert.deepEqual(result, [3, 2]);
});

test('deepMerge supports root array cycles and skips source holes', () => {
  const target: unknown[] = [];
  target.push(target, 'keep');
  const source: unknown[] = new Array(2);
  source[0] = source;

  const result = deepMerge(target, source);
  assert.equal(result[0], result);
  assert.equal(result[1], 'keep');
  assert.equal(target[0], target);
});

test('deepMerge keeps source references for replacements and new branches', () => {
  const shared = { added: true };
  const result = deepMerge(
    { replaced: { old: true } },
    { replaced: shared, newBranch: shared },
    { excludeKeys: (key) => key === 'replaced' }
  );
  assert.equal(result.replaced, shared);
  assert.equal(result.newBranch, shared);
});
