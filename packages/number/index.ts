/**
 * 校验内容是不是数字，支持数字、bigint 与数字字符串（含科学计数法、0x 进制）
 *
 * 只接受基础类型：数组、Date、对象等引用类型一律返回 false，
 * 避免 `[5]`、`new Date()` 这类值因隐式转换被误判为数字。
 *
 * @param v 需要确认的内容
 * @returns 是否为合法数字
 */
export const isNumber = (v: unknown): boolean => {
  if (typeof v === 'number') {
    return Number.isFinite(v);
  }

  if (typeof v === 'bigint') {
    return true;
  }

  // 排除空字符串与纯空格字符串，它们会被 Number() 转成 0
  if (typeof v !== 'string' || /^\s*$/.test(v)) {
    return false;
  }

  // Number.isFinite 同时排除了 NaN 与 Infinity
  return Number.isFinite(Number(v));
};
