export const getRootOffset = (ele: HTMLElement, rootEle = document.body) => {
  let par = ele.offsetParent as HTMLElement;
  let offsetTop = ele.offsetTop;
  let offsetLeft = ele.offsetLeft;

  while (par !== null && par !== rootEle) {
    offsetTop += par.offsetTop;
    offsetLeft += par.offsetLeft;
    par = par.offsetParent as HTMLElement;
  }

  return { offsetTop, offsetLeft };
};
