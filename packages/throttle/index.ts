/**
 * 节流函数
 *
 * 以尾部触发（trailing）的方式执行：节流窗口内多次调用只会执行最后一次的参数。
 *
 * 注意：计时由 requestAnimationFrame 驱动，浏览器会暂停隐藏标签页的
 * requestAnimationFrame，因此标签页切到后台时已排队的调用会推迟到重新可见后才执行。
 * 若需要在不可见时也持续推进，请改用 debounce 或自行用 setTimeout 实现。
 *
 * @param fn 目标方法
 * @param ms 节流延迟
 * @returns 包装后的节流方法
 */
export const throttle = <T, V>(fn: (...params: T[]) => V, ms = 200) => {
  let start: number | null = null;
  // 待执行的调用信息，null 表示当前没有排队的调用
  let pending: { self: unknown; params: T[] } | null = null;

  const invoke = () => {
    const current = pending;
    // 先清理窗口，目标函数内部再次调用节流方法时可以正确排队。
    pending = null;
    start = null;

    if (current) {
      fn.apply(current.self, current.params);
    }
  };

  const handler = (timeStamp: number) => {
    if (start === null) {
      start = timeStamp;
    }

    if (timeStamp - start >= ms) {
      invoke();
    } else {
      requestAnimationFrame(handler);
    }
  };

  return function (this: unknown, ...params: T[]): void {
    const idle = pending === null;
    pending = { self: this, params };

    if (idle) {
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(handler);
      } else {
        // SSR 只需要一个定时器等待整个窗口，避免每 16ms 唤醒一次。
        setTimeout(invoke, ms);
      }
    }
  };
};
