/** 防抖调用的结果：'done' 表示本次调用真正执行，'cancel' 表示被后续调用取代。 */
export type DebounceResult = 'done' | 'cancel';

/**
 * 防抖方法封装
 *
 * 每次调用都会返回一个 Promise：被后续调用取代时 resolve `'cancel'`，
 * 真正执行时 resolve `'done'`，因此不会有 Promise 永远悬挂。
 *
 * @param fn 目标方法
 * @param ms 防抖延迟
 * @returns 包装后的防抖方法
 */
export const debounce = <T extends unknown[], V>(fn: (...params: T) => V, ms = 200) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  // 记录上一次尚未结算的 resolve，被取代时用它来 resolve('cancel')
  let pendingResolve: ((result: DebounceResult) => void) | null = null;

  return function (this: unknown, ...params: T): Promise<DebounceResult> {
    return new Promise<DebounceResult>((rev) => {
      if (timer !== null) {
        clearTimeout(timer);
        // 上一次调用被本次取代，结算它而不是本次
        pendingResolve?.('cancel');
      }

      pendingResolve = rev;

      timer = setTimeout(() => {
        timer = null;
        pendingResolve = null;
        fn.apply(this, params);
        rev('done');
      }, ms);
    });
  };
};
