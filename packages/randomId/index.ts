/**
 * 获取随机字符，沿用 2.x 的 base36 时间戳与 Math.random 随机串，长度不固定
 *
 * @returns string
 */
export const randomId = (): string =>
  `${Date.now().toString(36)}${Math.random().toString(36).substring(2)}`;
