import test from 'node:test';
import assert from 'node:assert/strict';

import { objectSort } from '../packages/objectSort/index.ts';

const names = (list: Array<{ name: string }>) => list.map((item) => item.name);

test('objectSort matches the documented README ordering', () => {
  const input = [
    { name: 'F', age: 25 },
    { name: 'D', age: null },
    { name: 'E', age: 20 },
    { name: 'H', age: 30 },
    { name: 'A', age: undefined },
    { name: 'J', age: 'b' },
    { name: 'K', age: 'c' },
    { name: 'I', age: 'a' },
    { name: 'B', age: undefined },
    { name: 'G', age: 25 },
    { name: 'C', age: undefined }
  ] as Array<{ name: string; age: unknown }>;

  assert.deepEqual(names(objectSort(input, (item) => item.age)), [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K'
  ]);
});

test('objectSort sorts in place and returns the input list as in 2.x', () => {
  const input = [{ v: 3 }, { v: 1 }, { v: 2 }];

  const sorted = objectSort(input, (item) => item.v);

  assert.equal(sorted, input);
  assert.deepEqual(
    sorted.map((i) => i.v),
    [1, 2, 3]
  );
});

test('objectSort comparator is consistent for equal nullish values', () => {
  const input = [{ v: null }, { v: null }, { v: undefined }, { v: undefined }] as Array<{
    v: unknown;
  }>;

  // 全为空值时排序不应抛错，且 undefined 排在 null 之前
  const sorted = objectSort(input, (item) => item.v);
  assert.deepEqual(
    sorted.map((i) => i.v),
    [undefined, undefined, null, null]
  );
});

test('objectSort desc reverses the whole ordering', () => {
  const input = [
    { name: 'A', age: undefined },
    { name: 'D', age: null },
    { name: 'E', age: 20 },
    { name: 'I', age: 'a' }
  ] as Array<{ name: string; age: unknown }>;

  assert.deepEqual(names(objectSort(input, (item) => item.age, 'desc')), ['I', 'E', 'D', 'A']);
});

test('objectSort compares numeric strings numerically', () => {
  const input = [{ v: '10' }, { v: '9' }, { v: '100' }];

  assert.deepEqual(
    objectSort(input, (item) => item.v).map((i) => i.v),
    ['9', '10', '100']
  );
});

test('objectSort compares Date values chronologically', () => {
  const input = [
    { name: 'later', at: new Date('2024-01-01') },
    { name: 'earlier', at: new Date('2020-01-01') }
  ];

  assert.deepEqual(names(objectSort(input, (item) => item.at)), ['earlier', 'later']);
});

test('objectSort is stable for equal keys', () => {
  const input = [
    { name: 'first', v: 1 },
    { name: 'second', v: 1 },
    { name: 'third', v: 1 }
  ];

  assert.deepEqual(names(objectSort(input, (item) => item.v)), ['first', 'second', 'third']);
});

test('objectSort keeps equal nullish values stable in either direction', () => {
  const input = [
    { name: 'null-1', v: null },
    { name: 'undefined-1', v: undefined },
    { name: 'null-2', v: null },
    { name: 'undefined-2', v: undefined }
  ];

  assert.deepEqual(names(objectSort([...input], (item) => item.v)), [
    'undefined-1',
    'undefined-2',
    'null-1',
    'null-2'
  ]);
  assert.deepEqual(names(objectSort([...input], (item) => item.v, 'desc')), [
    'null-1',
    'null-2',
    'undefined-1',
    'undefined-2'
  ]);
});

test('objectSort compares bigint without losing precision', () => {
  const input = [{ v: 9007199254740993n }, { v: 9007199254740992n }, { v: 1n }];
  assert.deepEqual(
    objectSort(input, (item) => item.v).map((item) => item.v),
    [1n, 9007199254740992n, 9007199254740993n]
  );
  assert.deepEqual(
    objectSort(input, (item) => item.v, 'desc').map((item) => item.v),
    [9007199254740993n, 9007199254740992n, 1n]
  );
});

test('objectSort preserves numeric coercion and stability across numeric types', () => {
  const input = [
    { name: 'date', v: new Date(5) },
    { name: 'array', v: [3] },
    { name: 'object', v: { valueOf: () => 2 } },
    { name: 'bigint', v: 1n },
    { name: 'number', v: 1 },
    { name: 'string', v: '1' }
  ];

  assert.deepEqual(names(objectSort(input, (item) => item.v)), [
    'bigint',
    'number',
    'string',
    'object',
    'array',
    'date'
  ]);
});

test('objectSort keeps localeCompare ordering for non-numeric strings', () => {
  const input = ['item-10', 'item-2', '条目20', '条目3', 'Éclair', 'eclair', 'Ä', 'a'];
  for (const order of ['asc', 'desc'] as const) {
    const direction = order === 'asc' ? 1 : -1;
    const expected = [...input].sort(
      (a, b) => a.localeCompare(b, undefined, { numeric: true }) * direction
    );
    assert.deepEqual(
      objectSort([...input], (item) => item, order),
      expected
    );
  }
});
