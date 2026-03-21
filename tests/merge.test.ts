import test from 'node:test';
import assert from 'node:assert/strict';

import { deepMerge } from '../packages/merge';

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
