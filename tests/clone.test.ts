import test from 'node:test';
import assert from 'node:assert/strict';

import { deepClone, isPrimitive } from '../packages/clone/index.ts';

test('isPrimitive treats null as primitive, function and object as not', () => {
  assert.equal(isPrimitive(null), true);
  assert.equal(isPrimitive(undefined), true);
  assert.equal(isPrimitive('a'), true);
  assert.equal(isPrimitive(1n), true);
  assert.equal(isPrimitive(Symbol('s')), true);
  assert.equal(isPrimitive({}), false);
  assert.equal(isPrimitive([]), false);
  assert.equal(
    isPrimitive(() => 0),
    false
  );
});

test('deepClone deep-copies nested structures', () => {
  const source = { a: 1, nested: { list: [1, { deep: true }] } };
  const cloned = deepClone(source);

  assert.deepEqual(cloned, source);
  assert.notEqual(cloned.nested, source.nested);
  assert.notEqual(cloned.nested.list, source.nested.list);
});

test('deepClone preserves the prototype of class instances', () => {
  class Foo {
    x = 1;
    hi() {
      return 'hi';
    }
  }

  const cloned = deepClone(new Foo());

  assert.ok(cloned instanceof Foo);
  assert.equal(cloned.hi(), 'hi');
  assert.equal(cloned.x, 1);
});

test('deepClone handles Date, RegExp, Map and Set', () => {
  const re = /ab+c/gi;
  re.lastIndex = 2;
  const source = {
    date: new Date('2020-01-02T03:04:05.000Z'),
    re,
    map: new Map<string, unknown>([['k', { v: 1 }]]),
    set: new Set([1, 2])
  };

  const cloned = deepClone(source);

  assert.ok(cloned.date instanceof Date);
  assert.equal(cloned.date.getTime(), source.date.getTime());
  assert.notEqual(cloned.date, source.date);

  assert.equal(cloned.re.source, 'ab+c');
  assert.equal(cloned.re.flags, 'gi');
  assert.equal(cloned.re.lastIndex, 2);

  assert.deepEqual(cloned.map.get('k'), { v: 1 });
  assert.notEqual(cloned.map.get('k'), source.map.get('k'));
  assert.deepEqual([...cloned.set], [1, 2]);
});

test('deepClone survives circular references', () => {
  const source: Record<string, unknown> = { a: 1 };
  source.self = source;
  source.list = [source];

  const cloned = deepClone(source);

  assert.equal(cloned.self, cloned);
  assert.equal((cloned.list as unknown[])[0], cloned);
});

test('deepClone copies symbol keys', () => {
  const key = Symbol('id');
  const source = { [key]: { nested: 1 }, plain: 2 };

  const cloned = deepClone(source);

  assert.deepEqual(cloned[key], { nested: 1 });
  assert.notEqual(cloned[key], source[key]);
});

test('deepClone preserves array holes and clones typed arrays', () => {
  // eslint-disable-next-line no-sparse-arrays -- 稀疏数组是本用例的被测对象
  const sparse = [1, , 3] as unknown[];
  const cloned = deepClone(sparse);

  assert.equal(cloned.length, 3);
  assert.equal(1 in cloned, false);
  assert.deepEqual([cloned[0], cloned[2]], [1, 3]);

  const typed = new Uint8Array([1, 2, 3]);
  const clonedTyped = deepClone(typed);

  assert.ok(clonedTyped instanceof Uint8Array);
  assert.deepEqual([...clonedTyped], [1, 2, 3]);
  clonedTyped[0] = 9;
  assert.equal(typed[0], 1);
});

test('deepClone returns functions by reference', () => {
  const fn = () => 1;
  assert.equal(deepClone({ fn }).fn, fn);
});
