/**
 * 防抖方法封装
 *
 * @param fn 目标方法
 * @param ms 防抖延迟
 * @returns
 */
export const debounce = <T, V>(fn: (...params: Array<T>) => V, ms = 200) => {
  let timer = 0;

  return (...params: Array<T>) => {
    return new Promise((rev) => {
      if (timer) {
        clearTimeout(timer);
        rev('cancel');
      }

      timer = window.setTimeout(() => {
        fn.apply(this, params);
        timer = 0;
        rev('done');
      }, ms);
    });
  };
};
