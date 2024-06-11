/**
 * 校验内容是不是数字
 *
 * @param v 需要确认的内容
 * @returns
 */
export const isNumber = (v: unknown): boolean => {
  // 检查空字符串、空格字符串、null、undefined、Symbol类型
  if (
    v === null ||
    v === undefined ||
    ['boolean', 'symbol'].includes(typeof v) ||
    /^\s*$/.test(v.toString())
  ) {
    return false;
  }

  const num = Number(v);
  // 检查转换结果是否为有效数字，排除NaN、Infinity等
  return !isNaN(num) && isFinite(num);
};
