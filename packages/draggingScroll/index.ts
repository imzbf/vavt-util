const clamp = (value: number, max: number): number => {
  return Math.min(Math.max(value, 0), Math.max(max, 0));
};

/**
 * 鼠标按住拖动滚动元素
 *
 * 拖动过程中会禁用文本选中，超出滚动范围时按边界收敛（而不是停止跟随）。
 *
 * @param ele 待拖动的元素
 * @returns 移除相关监听的方法
 */
export const draggingScroll = (ele: HTMLElement) => {
  // 记录本次拖动注册的清理逻辑，便于外部提前解绑
  let stopDragging: (() => void) | null = null;

  const triggerMouseDown = (mdown: MouseEvent) => {
    // 只响应鼠标左键
    if (mdown.button !== 0) {
      return;
    }

    const { scrollHeight, scrollWidth, offsetHeight, offsetWidth, scrollLeft, scrollTop } = ele;

    const x = mdown.clientX;
    const y = mdown.clientY;

    const topScrollMax = scrollHeight - offsetHeight;
    const leftScrollMax = scrollWidth - offsetWidth;

    // 拖动时禁止选中文本，结束后还原
    const originalUserSelect = ele.style.userSelect;
    ele.style.userSelect = 'none';

    const mouseMoveHandler = (e: MouseEvent) => {
      ele.scroll({
        left: clamp(scrollLeft + x - e.clientX, leftScrollMax),
        top: clamp(scrollTop + y - e.clientY, topScrollMax)
      });
    };

    const mouseUpHandler = () => {
      ele.style.userSelect = originalUserSelect;
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
      stopDragging = null;
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
    stopDragging = mouseUpHandler;
  };

  ele.addEventListener('mousedown', triggerMouseDown);

  return () => {
    // 清除事件监听，包含仍在进行中的拖动
    ele.removeEventListener('mousedown', triggerMouseDown);
    stopDragging?.();
  };
};
