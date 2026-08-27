import { isNumber } from '../number/index.ts';

/**
 * 空值排序权重：undefined 最小，null 次小，其余正常值最大。
 */
const nullishRank = (value: unknown): number => {
  if (value === undefined) {
    return 0;
  }

  if (value === null) {
    return 1;
  }

  return 2;
};

/**
 * 对对象列表按照某个字段进行排序
 *
 * 排序规则：undefined < null < 数字 < 字符串（`desc` 时整体反转）。
 * 数字、bigint、数字字符串按数值比较，Date 按时间戳比较，其余按 `localeCompare` 比较。
 *
 * 不会修改入参，返回新数组。相等项保持原有顺序（稳定排序）。
 *
 * @param list 待排序的列表
 * @param getParam 获取用于排序的字段值
 * @param order 排序方式，默认升序
 * @returns 排序后的新数组
 */
export const objectSort = <T>(
  list: Array<T>,
  getParam: (item: T) => unknown,
  order: 'asc' | 'desc' = 'asc'
): Array<T> => {
  const direction = order === 'asc' ? 1 : -1;

  return [...list].sort((a, b) => {
    const compA = getParam(a);
    const compB = getParam(b);

    const rankA = nullishRank(compA);
    const rankB = nullishRank(compB);

    // 只要有一侧是空值，就按权重比较；两侧同为 undefined 或同为 null 时视作相等
    if (rankA !== 2 || rankB !== 2) {
      return (rankA - rankB) * direction;
    }

    if (compA instanceof Date && compB instanceof Date) {
      return (compA.getTime() - compB.getTime()) * direction;
    }

    if (isNumber(compA) && isNumber(compB)) {
      const numA = Number(compA);
      const numB = Number(compB);

      if (numA === numB) {
        return 0;
      }

      return (numA < numB ? -1 : 1) * direction;
    }

    return String(compA).localeCompare(String(compB), undefined, { numeric: true }) * direction;
  });
};
