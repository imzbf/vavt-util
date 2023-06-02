/**
 * 打开链接
 *
 * @param href 跳转链接
 * @param option 是否新窗口打开、是否取消跟踪
 */
export const linkTo = (
  href: string,
  option = {
    _blank: true,
    nofollow: true,
  }
) => {
  const a = document.createElement('a');
  a.href = href;

  if (option._blank) {
    a.target = '_blank';
  }

  if (option.nofollow) {
    a.rel = 'noopener noreferrer';
  }

  a.click();
};

/**
 * 网络文件下载，支持base64
 * 链接需要指定返回文件类型
 *
 * @param href 文件链接
 * @param title 下载文件名
 */
export const download = (href: string, title = '') => {
  const a = document.createElement('a');
  a.setAttribute('href', href);
  a.setAttribute('download', title);
  a.click();
};
