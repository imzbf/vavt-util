/** 随机部分的字符数，固定长度避免 Math.random().toString(36) 长度不稳定 */
const RANDOM_LENGTH = 10;

/**
 * 生成指定长度的 base36 随机字符串，优先使用 crypto 保证随机性
 */
const randomChars = (length: number): string => {
  const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;

  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const bytes = new Uint8Array(length);
    cryptoObj.getRandomValues(bytes);

    return Array.from(bytes, (byte) => (byte % 36).toString(36)).join('');
  }

  let result = '';
  while (result.length < length) {
    // substring(2) 后长度不固定，用循环补足
    result += Math.random().toString(36).substring(2);
  }

  return result.substring(0, length);
};

/**
 * 获取随机字符，由 base36 时间戳与固定长度随机串拼接而成
 *
 * @returns string
 */
export const randomId = (): string => `${Date.now().toString(36)}${randomChars(RANDOM_LENGTH)}`;
