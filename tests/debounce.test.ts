import test from 'node:test';
import assert from 'node:assert/strict';

import { debounce } from '../packages/debounce/index.ts';
import { throttle } from '../packages/throttle/index.ts';
import { mockAnimationFrame } from './helpers/animationFrame.ts';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test('debounce runs the target once with the latest params', async () => {
  const calls: number[] = [];
  const fn = debounce((n: number) => calls.push(n), 20);

  fn(1);
  fn(2);
  fn(3);
  await wait(60);

  assert.deepEqual(calls, [3]);
});

test('debounce settles every returned promise: superseded ones resolve "cancel"', async () => {
  const fn = debounce(() => 1, 20);

  const results = await Promise.all([
    // 前两次会被第三次取代，必须结算为 cancel 而不是永远悬挂
    fn(),
    fn(),
    fn()
  ]);

  assert.deepEqual(results, ['cancel', 'cancel', 'done']);
});

test('debounce works without a window global (SSR safe)', async () => {
  assert.equal(typeof (globalThis as Record<string, unknown>).window, 'undefined');

  let called = false;
  const fn = debounce(() => {
    called = true;
  }, 10);

  const result = await fn();

  assert.equal(result, 'done');
  assert.equal(called, true);
});

test('debounce preserves the caller this binding', async () => {
  const obj = {
    value: 7,
    seen: 0,
    handler: debounce(function (this: { value: number; seen: number }) {
      this.seen = this.value;
    }, 10)
  };

  await obj.handler();

  assert.equal(obj.seen, 7);
});

test('debounce restarts cleanly after a completed cycle', async () => {
  const calls: number[] = [];
  const fn = debounce((n: number) => calls.push(n), 15);

  assert.equal(await fn(1), 'done');
  assert.equal(await fn(2), 'done');

  assert.deepEqual(calls, [1, 2]);
});

test('throttle runs once per window with the latest params (SSR safe)', async () => {
  const calls: number[] = [];
  const fn = throttle((n: number) => calls.push(n), 30);

  fn(1);
  fn(2);
  fn(3);
  await wait(120);

  assert.deepEqual(calls, [3]);
});

test('throttle can fire again in a later window', async () => {
  const calls: number[] = [];
  const fn = throttle((n: number) => calls.push(n), 20);

  fn(1);
  await wait(100);
  fn(2);
  await wait(100);

  assert.deepEqual(calls, [1, 2]);
});

test('throttle preserves the caller this binding', async () => {
  const obj = {
    value: 5,
    seen: 0,
    handler: throttle(function (this: { value: number; seen: number }) {
      this.seen = this.value;
    }, 20)
  };

  obj.handler();
  await wait(100);

  assert.equal(obj.seen, 5);
});

test('debounce rejects synchronous callback errors and can restart', async () => {
  const error = new Error('callback failed');
  const fn = debounce<number, void>((n) => {
    if (n === 1) {
      throw error;
    }
  }, 1);

  await assert.rejects(fn(1), (reason) => reason === error);
  assert.equal(await fn(2), 'done');
});

test('debounce preserves a call scheduled from inside its callback', async () => {
  const calls: number[] = [];
  let next: Promise<unknown> | undefined;
  const fn = debounce<number, void>((n) => {
    calls.push(n);
    if (n === 1) {
      next = fn(2);
    }
  }, 1);

  assert.equal(await fn(1), 'done');
  assert.equal(await next, 'done');
  assert.deepEqual(calls, [1, 2]);
});

test('throttle uses one SSR timer per window and does not postpone the deadline', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const timer = t.mock.method(globalThis, 'setTimeout');
  const calls: number[] = [];
  const fn = throttle((n: number) => calls.push(n), 10000);

  fn(1);
  t.mock.timers.tick(9000);
  fn(2);
  t.mock.timers.tick(999);
  assert.deepEqual(calls, []);
  t.mock.timers.tick(1);
  assert.deepEqual(calls, [2]);
  assert.equal(timer.mock.callCount(), 1);
});

test('throttle keeps RAF timing, trailing params and callback reentry in browsers', (t) => {
  const frames = mockAnimationFrame(t);
  const calls: number[] = [];
  const fn = throttle<number, void>((n) => {
    calls.push(n);
    if (n === 2) {
      fn(3);
    }
  }, 20);

  fn(1);
  frames.step(0);
  frames.step(19);
  fn(2);
  assert.deepEqual(calls, []);
  assert.equal(frames.size, 1);
  frames.step(20);
  assert.deepEqual(calls, [2]);
  assert.equal(frames.size, 1);
  frames.step(30);
  frames.step(50);
  assert.deepEqual(calls, [2, 3]);
  assert.equal(frames.size, 0);
});
