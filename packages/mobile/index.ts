interface MobileCheckOptions {
  /**
   * 是否强制使用屏幕宽度检查。
   * 默认为 false。
   */
  forceScreenWidth?: boolean;

  /**
   * 自定义的屏幕宽度阈值（单位为像素）。
   * 默认为 768 像素。
   */
  threshold?: number;

  /**
   * 当 User-Agent 检查结果为 false 时，是否自动降级使用屏幕宽度检查。
   * 默认为 true。
   */
  fallbackToScreenWidth?: boolean;
}

/**
 * 判断当前设备是否为移动端设备。
 * 依据：userAgent包含移动端信息并且支持触摸事件，否则降级为使用屏幕宽度判断
 *
 * 非浏览器环境（SSR）下无法探测，返回 false。
 *
 * @param options - 可选参数的对象，用于配置判断逻辑。
 * @returns 如果判断为移动端设备则返回 true，否则返回 false。
 */
export const isMobile = (options: MobileCheckOptions = {}): boolean => {
  const { forceScreenWidth = false, threshold = 768, fallbackToScreenWidth = true } = options;

  // SSR / 非浏览器环境没有 window 与 navigator，直接返回 false
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  // 检查屏幕宽度，matchMedia 不可用时退回 innerWidth
  const screenWidthCheck = (): boolean => {
    if (typeof window.matchMedia === 'function') {
      return window.matchMedia(`(max-width: ${threshold}px)`).matches;
    }

    return window.innerWidth <= threshold;
  };

  if (forceScreenWidth) {
    return screenWidthCheck();
  }

  // 检查触摸节点
  const maxTouchPoints = navigator.maxTouchPoints ?? 0;
  const touchNodeCheck = 'ontouchstart' in window || maxTouchPoints > 0;

  // 检查 User-Agent 字符串
  const userAgent = navigator.userAgent || '';
  // iPadOS 13+ 默认伪装成 Macintosh，需要结合多点触控判断
  const isIpadOS = /macintosh/i.test(userAgent) && maxTouchPoints > 1;
  const userAgentCheck =
    /android|ipad|iphone|ipod|windows phone|blackberry/i.test(userAgent) || isIpadOS;

  if (userAgentCheck && touchNodeCheck) {
    return true;
  }

  return fallbackToScreenWidth ? screenWidthCheck() : false;
};
