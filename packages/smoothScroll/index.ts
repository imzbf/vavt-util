/**
 * SSR / 非浏览器环境降级，避免 requestAnimationFrame 未定义直接报错。
 */
const raf = (cb: () => void): number => {
  if (typeof requestAnimationFrame === 'function') {
    return requestAnimationFrame(cb);
  }

  return setTimeout(cb, 16) as unknown as number;
};

const cancelRaf = (id: number): void => {
  if (typeof cancelAnimationFrame === 'function') {
    cancelAnimationFrame(id);
  } else {
    clearTimeout(id);
  }
};

/**
 * 创建独立的方法
 *
 * 注意：动画由 requestAnimationFrame 驱动，浏览器会暂停隐藏标签页的
 * requestAnimationFrame，因此标签页切到后台时滚动会停在当前位置、结束回调也不会触发，
 * 等重新可见后从暂停处继续。若需要立即到位，请直接用 ele.scrollTo(0, top)。
 *
 * @returns 平滑滚动方法
 */
export const createSmoothScroll = () => {
  // 待执行的requestAnimationFrame的标识
  let rafTimer = -1;
  // 上一次滚动尚未结算的回调，被新的滚动打断时用它结算
  let pendingCb: (() => void) | null = null;

  const smoothScroll = (
    ele: HTMLElement,
    top: number,
    cb?: () => void,
    timeout: number | boolean = 100
  ) => {
    const cbHandler = () => {
      pendingCb = null;

      if (cb) {
        if (typeof timeout === 'number') {
          setTimeout(cb, timeout);
        } else {
          cb();
        }
      }
    };

    if (rafTimer !== -1) {
      cancelRaf(rafTimer);
      rafTimer = -1;
      // 结算被打断的那一次滚动的回调，而不是本次的
      pendingCb?.();
    }

    pendingCb = cbHandler;

    // 当前滚动高度
    let scrollTop = ele.scrollTop;

    const scrollHandler = () => {
      rafTimer = -1;
      // 距离目标距离
      const distance = top - scrollTop;
      // 加上本次滚动位置
      scrollTop = scrollTop + distance / 5;

      if (Math.abs(distance) < 1) {
        ele.scrollTo(0, top);
        cbHandler();
      } else {
        ele.scrollTo(0, scrollTop);
        rafTimer = raf(scrollHandler);
      }
    };

    rafTimer = raf(scrollHandler);
  };

  return smoothScroll;
};

/**
 * 平滑滚动
 *
 * 注意：标签页切到后台时 requestAnimationFrame 被浏览器暂停，滚动与结束回调都会推迟到
 * 重新可见后继续，详见 createSmoothScroll。
 *
 * @param ele 滚动容器
 * @param top 目标位置
 * @param cb 执行完成时的回执事件
 * @param timeout 延迟执行回执事件毫秒值，false不延迟
 */
export const smoothScroll = createSmoothScroll();
