/**
 * 平滑滚动
 *
 * @param ele 滚动容器
 * @param top 目标位置
 * @param cb 执行完成时的回执事件
 * @param timeout 延迟执行回执事件毫秒值，false不延迟
 */
export const smoothScroll = (
  ele: HTMLElement,
  top: number,
  cb?: () => void,
  timeout: number | boolean = 100
) => {
  // 当前滚动高度
  let scrollTop = ele.scrollTop;

  const scrollHandler = () => {
    // 距离目标距离
    const distance = top - scrollTop;
    // 加上本次滚动位置
    scrollTop = scrollTop + distance / 5;

    if (Math.abs(distance) < 1) {
      ele.scrollTo(0, top);

      if (cb) {
        if (typeof timeout === 'number') {
          setTimeout(cb, timeout);
        } else {
          cb();
        }
      }
    } else {
      ele.scrollTo(0, scrollTop);
      requestAnimationFrame(scrollHandler);
    }
  };

  scrollHandler();
};
