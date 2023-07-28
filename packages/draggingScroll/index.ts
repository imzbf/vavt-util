/**
 * 鼠标按住拖动滚动元素
 *
 * @param ele 待拖动的元素
 * @returns 移除相关监听的方法
 */
export const draggingScroll = (ele: HTMLElement) => {
  const triggerMouseDown = (mdown: MouseEvent) => {
    const { scrollHeight, scrollWidth, offsetHeight, offsetWidth, scrollLeft, scrollTop } = ele;

    const x = mdown.x;
    const y = mdown.y;

    const mouseMoveHandler = (e: MouseEvent) => {
      const _top = scrollTop + y - e.y;
      const _left = scrollLeft + x - e.x;

      const topScrollMax = scrollHeight - offsetHeight;
      const leftScrollMax = scrollWidth - offsetWidth;

      const options: ScrollToOptions = {};

      if (_left >= 0 && _left <= leftScrollMax) {
        options.left = _left;
      }
      if (_top >= 0 && _top <= topScrollMax) {
        options.top = _top;
      }

      ele.scroll(options);
    };

    document.addEventListener('mousemove', mouseMoveHandler);

    const mouseUpHandler = () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };
    document.addEventListener('mouseup', mouseUpHandler);
  };

  ele.addEventListener('mousedown', triggerMouseDown);

  return () => {
    // 清除时间监听
    ele.removeEventListener('mousedown', triggerMouseDown);
  };
};
