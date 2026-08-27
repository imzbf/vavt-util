/**
 * 取 requestAnimationFrame，非浏览器环境（SSR、Node）降级为 setTimeout。
 */
const raf = (cb: (timeStamp: number) => void): void => {
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(cb);
  } else {
    setTimeout(() => cb(Date.now()), 16);
  }
};

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
export const throttle = <T extends unknown[], V>(fn: (...params: T) => V, ms = 200) => {
  let start: number | null = null;
  // 待执行的调用信息，null 表示当前没有排队的调用
  let pending: { self: unknown; params: T } | null = null;

  const handler = (timeStamp: number) => {
    if (start === null) {
      start = timeStamp;
    }

    if (timeStamp - start >= ms) {
      const current = pending;
      pending = null;
      start = null;

      // 正常流程下不会为空，兜底避免以 null 调用
      if (current) {
        fn.apply(current.self, current.params);
      }
    } else {
      raf(handler);
    }
  };

  return function (this: unknown, ...params: T): void {
    if (pending === null) {
      raf(handler);
    }

    pending = { self: this, params };
  };
};
