import test from 'node:test';
import assert from 'node:assert/strict';

import { objToSearch, searchToObj } from '../packages/urlSearch/index.ts';

test('searchToObj keeps documented behavior', () => {
  assert.deepEqual(searchToObj('?age=18&name=lili&h=1&h=2'), {
    age: '18',
    name: 'lili',
    h: ['1', '2']
  });
  assert.deepEqual(searchToObj(''), {});
});

test('searchToObj does not truncate values containing "="', () => {
  assert.deepEqual(searchToObj('?token=YWJjPT0='), { token: 'YWJjPT0=' });
});

test('searchToObj maps bare keys to empty string, not "undefined"', () => {
  assert.deepEqual(searchToObj('?flag&a=1'), { flag: '', a: '1' });
  assert.deepEqual(searchToObj('?a='), { a: '' });
});

test('searchToObj decodes "+" as space', () => {
  assert.deepEqual(searchToObj('?q=a+b'), { q: 'a b' });
  assert.deepEqual(searchToObj('?q=a+b', false), { q: 'a+b' });
});

test('searchToObj tolerates malformed percent escapes', () => {
  assert.deepEqual(searchToObj('?a=%E4%B8'), { a: '%E4%B8' });
});

test('searchToObj aggregates three or more repeats', () => {
  assert.deepEqual(searchToObj('?h=1&h=2&h=3'), { h: ['1', '2', '3'] });
});

test('objToSearch keeps documented behavior', () => {
  assert.equal(objToSearch({ age: 18, name: 'lili', h: [1, 2] }), 'age=18&name=lili&h=1&h=2');
});

test('objToSearch skips null and undefined instead of stringifying them', () => {
  assert.equal(objToSearch({ a: undefined, b: null, c: 1 }), 'c=1');
  assert.equal(objToSearch({ list: [1, null, 2, undefined] }), 'list=1&list=2');
});

test('objToSearch round-trips through searchToObj', () => {
  const obj = { 'a b': 'c&d=e', list: ['1', '2'] };
  assert.deepEqual(searchToObj(`?${objToSearch(obj)}`), obj);
});
