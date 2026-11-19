/**
 * 沿 offsetParent 链计算边框外缘坐标，忽略滚动与 transform。
 */
const getDocumentOffset = (ele: HTMLElement) => {
  let offsetTop = 0;
  let offsetLeft = 0;
  let current: HTMLElement | null = ele;

  while (current) {
    offsetTop += current.offsetTop;
    offsetLeft += current.offsetLeft;
    const parent = current.offsetParent as HTMLElement | null;
    // offsetTop/Left 相对 offsetParent 的内边框边缘，跨层时需要加上其边框宽度。
    if (parent) {
      offsetTop += parent.clientTop;
      offsetLeft += parent.clientLeft;
    }
    current = parent;
  }

  return { offsetTop, offsetLeft };
};

/**
 * 获取元素相对某个祖先节点的偏移量，默认相对 document.body
 *
 * 通过「各自到文档的偏移量相减」实现，因此 `rootEle` 无需是定位元素
 * （position 非 static）也能得到正确结果。坐标相对 rootEle 的内边框边缘，忽略滚动与 transform。
 *
 * @param ele 目标元素
 * @param rootEle 参照的祖先元素，默认 document.body
 * @returns 相对 rootEle 的 offsetTop 与 offsetLeft
 */
export const getRootOffset = (ele: HTMLElement, rootEle: HTMLElement = document.body) => {
  if (ele === rootEle) {
    return { offsetTop: 0, offsetLeft: 0 };
  }

  const eleOffset = getDocumentOffset(ele);
  const rootOffset = getDocumentOffset(rootEle);

  return {
    offsetTop: eleOffset.offsetTop - rootOffset.offsetTop - rootEle.clientTop,
    offsetLeft: eleOffset.offsetLeft - rootOffset.offsetLeft - rootEle.clientLeft
  };
};
