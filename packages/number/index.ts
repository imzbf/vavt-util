/**
 * 校验内容能否转换为有限数字，支持科学计数法、0x 进制等数字字符串
 *
 * 保留 2.x 的数值转换规则：[5]、有效 Date、可转换为数字的对象也可以通过。
 * 空白内容、null、undefined、boolean、symbol 与非有限数值返回 false。
 *
 * @param v 需要确认的内容
 * @returns 是否为合法数字
 */
export const isNumber = (v: unknown): boolean => {
  if (typeof v === 'number') {
    return Number.isFinite(v);
  }

  if (v === null || v === undefined || typeof v === 'boolean' || typeof v === 'symbol') {
    return false;
  }

  try {
    // 沿用先检查 toString 再转换的顺序，空数组等空白内容仍然不能通过。
    return !/^\s*$/.test(v.toString()) && Number.isFinite(Number(v));
  } catch {
    // 自定义转换方法可能抛错，校验函数将这种值视为不可转换。
    return false;
  }
};
