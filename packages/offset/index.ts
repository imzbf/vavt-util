/**
 * 累加元素到文档顶部的 offset（沿 offsetParent 链求和）。
 */
const getDocumentOffset = (ele: HTMLElement) => {
  let offsetTop = 0;
  let offsetLeft = 0;
  let current: HTMLElement | null = ele;

  while (current) {
    offsetTop += current.offsetTop;
    offsetLeft += current.offsetLeft;
    current = current.offsetParent as HTMLElement | null;
  }

  return { offsetTop, offsetLeft };
};

/**
 * 获取元素相对某个祖先节点的偏移量，默认相对 document.body
 *
 * 通过「各自到文档的偏移量相减」实现，因此 `rootEle` 无需是定位元素
 * （position 非 static）也能得到正确结果。不计入滚动距离。
 *
 * @param ele 目标元素
 * @param rootEle 参照的祖先元素，默认 document.body
 * @returns 相对 rootEle 的 offsetTop 与 offsetLeft
 */
export const getRootOffset = (ele: HTMLElement, rootEle: HTMLElement = document.body) => {
  const eleOffset = getDocumentOffset(ele);

  if (ele === rootEle) {
    return { offsetTop: 0, offsetLeft: 0 };
  }

  const rootOffset = getDocumentOffset(rootEle);

  return {
    offsetTop: eleOffset.offsetTop - rootOffset.offsetTop,
    offsetLeft: eleOffset.offsetLeft - rootOffset.offsetLeft
  };
};
