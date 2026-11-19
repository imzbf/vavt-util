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

test('searchToObj preserves literal "+" as in 2.x', () => {
  assert.deepEqual(searchToObj('?q=a+b'), { q: 'a+b' });
  assert.deepEqual(searchToObj('?q=a+b', false), { q: 'a+b' });
  assert.deepEqual(searchToObj('?a+b=%2B+%20'), { 'a+b': '++ ' });
});

test('searchToObj keeps URIError for malformed percent escapes', () => {
  assert.throws(() => searchToObj('?a=%E4%B8'), URIError);
  assert.throws(() => searchToObj('?%E4%B8=value'), URIError);
  assert.deepEqual(searchToObj('?a=%E4%B8', false), { a: '%E4%B8' });
});

test('searchToObj aggregates three or more repeats', () => {
  assert.deepEqual(searchToObj('?h=1&h=2&h=3'), { h: ['1', '2', '3'] });
});

test('objToSearch keeps documented behavior', () => {
  assert.equal(objToSearch({ age: 18, name: 'lili', h: [1, 2] }), 'age=18&name=lili&h=1&h=2');
});

test('objToSearch preserves 2.x null and undefined serialization', () => {
  for (const encode of [true, false]) {
    assert.equal(objToSearch({ a: undefined, b: null, c: 1 }, encode), 'a=undefined&b=null&c=1');
    assert.equal(
      objToSearch({ list: [1, null, 2, undefined] }, encode),
      'list=1&list=null&list=2&list=undefined'
    );
  }
});

test('objToSearch round-trips through searchToObj', () => {
  const obj = { 'a b': 'c&d=e', list: ['1', '2'] };
  assert.deepEqual(searchToObj(`?${objToSearch(obj)}`), obj);
});

test('objToSearch keeps empty-array separators and sparse array positions', () => {
  const list = new Array(3);
  list[1] = 'value';
  assert.equal(objToSearch({ empty: [], list, tail: 1 }), '&&list=value&&tail=1');
});

test('objToSearch keeps legacy primitive inputs and symbol coercion errors', () => {
  assert.equal(objToSearch(null), '');
  assert.equal(objToSearch(undefined), '');
  assert.equal(objToSearch(1), '');
  assert.equal(objToSearch('ab'), '0=a&1=b');
  assert.throws(() => objToSearch({ value: Symbol('s') }), TypeError);
  assert.throws(() => objToSearch({ value: Symbol('s') }, false), TypeError);
});
