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

test('objectSort does not mutate the input list', () => {
  const input = [{ v: 3 }, { v: 1 }, { v: 2 }];
  const snapshot = [...input];

  const sorted = objectSort(input, (item) => item.v);

  assert.notEqual(sorted, input);
  assert.deepEqual(input, snapshot);
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
