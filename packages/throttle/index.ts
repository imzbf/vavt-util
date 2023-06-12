/**
 * 节流函数
 *
 * @param fn 目标方法
 * @param ms 节流延迟
 * @returns
 */
export const throttle = <T, V>(fn: (...params: Array<T>) => V, ms = 200) => {
  let start = 0;
  let _params: null | Array<T> = null;

  return (...params: Array<T>) => {
    const handler = (timeStamp: number) => {
      if (start === 0) {
        start = timeStamp;
      }

      if (timeStamp - start >= ms) {
        fn.apply(this, _params as Array<T>);
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
