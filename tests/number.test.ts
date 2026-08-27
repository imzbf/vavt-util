import test from 'node:test';
import assert from 'node:assert/strict';

import { isNumber } from '../packages/number/index.ts';

test('isNumber accepts numbers and numeric strings', () => {
  assert.equal(isNumber(1), true);
  assert.equal(isNumber(-1.5), true);
  assert.equal(isNumber(0), true);
  assert.equal(isNumber('0.23e-1'), true);
  assert.equal(isNumber('0x10'), true);
  assert.equal(isNumber(' 12 '), true);
  assert.equal(isNumber(10n), true);
});

test('isNumber rejects blank, NaN and non-finite values', () => {
  assert.equal(isNumber(''), false);
  assert.equal(isNumber('   '), false);
  assert.equal(isNumber('abc'), false);
  assert.equal(isNumber(NaN), false);
  assert.equal(isNumber(Infinity), false);
  assert.equal(isNumber(-Infinity), false);
});

test('isNumber rejects nullish, boolean and symbol', () => {
  assert.equal(isNumber(null), false);
  assert.equal(isNumber(undefined), false);
  assert.equal(isNumber(true), false);
  assert.equal(isNumber(false), false);
  assert.equal(isNumber(Symbol('1')), false);
});

test('isNumber rejects reference types that coerce to numbers', () => {
  assert.equal(isNumber([5]), false);
  assert.equal(isNumber([]), false);
  assert.equal(isNumber(new Date()), false);
  assert.equal(isNumber({}), false);
  assert.equal(
    isNumber(() => 1),
    false
  );
});

test('isNumber does not throw on objects with a hostile toString', () => {
  const hostile = {
    toString() {
      throw new Error('boom');
    }
  };

  assert.equal(isNumber(hostile), false);
});
