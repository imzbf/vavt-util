interface LinkToOptions {
  /** 是否新窗口打开，省略整个配置对象时默认为 true */
  _blank?: boolean;
  /** 是否禁止新窗口访问 opener（rel="noopener noreferrer"），省略整个配置对象时默认为 true */
  nofollow?: boolean;
}

/**
 * 触发一次 a 标签点击。部分浏览器（Firefox）要求节点在文档中才会响应 click。
 */
const clickAnchor = (a: HTMLAnchorElement) => {
  a.style.display = 'none';
  document.body.appendChild(a);

  try {
    a.click();
  } finally {
    document.body.removeChild(a);
  }
};

/**
 * 打开链接
 *
 * @param href 跳转链接
 * @param option 是否新窗口打开、是否取消跟踪
 */
export const linkTo = (href: string, option: LinkToOptions = { _blank: true, nofollow: true }) => {
  // 2.x 只在整个配置对象省略时使用默认值，已传对象中的缺失字段保持假值。
  const a = document.createElement('a');
  a.href = href;

  if (option._blank) {
    a.target = '_blank';
  }

  if (option.nofollow) {
    a.rel = 'noopener noreferrer';
  }

  clickAnchor(a);
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

  clickAnchor(a);
};
