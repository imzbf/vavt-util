/**
 * 获取随机字符
 *
 * @returns string
 */
export const uuid = (): string =>
  `${Date.now().toString(36)}${Math.random().toString(36).substring(2)}`;
