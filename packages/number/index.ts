/**
 * 校验内容是不是数字
 *
 * @param v 需要确认的内容
 * @returns
 */
export const isNumber = (v: unknown): boolean => {
  return !isNaN(Number(v));
};
