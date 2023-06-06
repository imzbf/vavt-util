/**
 * 节流函数
 *
 * @param fn 目标方法
 * @param ms 节流延迟
 * @returns
 */
export const throttle = (fn: (...params: Array<unknown>) => unknown, ms = 200) => {
  let start = 0;
  let _params: null | Array<unknown> = null;

  return (...params: Array<unknown>) => {
    const handler = (timeStamp: number) => {
      if (start === 0) {
        start = timeStamp;
      }

      if (timeStamp - start >= ms) {
        fn.apply(this, _params as Array<unknown>);
        _params = null;
        start = 0;
      } else {
        window.requestAnimationFrame(handler);
      }
    };

    if (_params === null) {
      window.requestAnimationFrame(handler);
    }

    _params = params;
  };
};
