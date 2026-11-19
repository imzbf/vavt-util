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
 * undefined < null < 其他值（`desc` 时整体反转）。
 * 两侧都能通过 isNumber 时按数值比较，否则按本地化字符串规则比较。
 *
 * 保留 2.x 的原地排序行为，返回入参数组本身。相等项保持原有顺序（稳定排序）。
 *
 * @param list 待排序的列表
 * @param getParam 获取用于排序的字段值
 * @param order 排序方式，默认升序
 * @returns 排序后的原数组
 */
export const objectSort = <T>(
  list: Array<T>,
  getParam: (item: T) => unknown,
  order: 'asc' | 'desc' = 'asc'
): Array<T> => {
  const direction = order === 'asc' ? 1 : -1;
  let collator: Intl.Collator | undefined;

  return list.sort((a, b) => {
    const compA = getParam(a);
    const compB = getParam(b);

    const rankA = nullishRank(compA);
    const rankB = nullishRank(compB);

    // 只要有一侧是空值，就按权重比较；两侧同为 undefined 或同为 null 时视作相等
    if (rankA !== 2 || rankB !== 2) {
      return (rankA - rankB) * direction;
    }

    if (isNumber(compA) && isNumber(compB)) {
      // bigint 保留原值，避免转换成 Number 后丢失精度；关系比较也支持与 number 混排。
      const numA = typeof compA === 'bigint' ? compA : Number(compA);
      const numB = typeof compB === 'bigint' ? compB : Number(compB);

      return (numA < numB ? -1 : numA > numB ? 1 : 0) * direction;
    }

    // 每次排序只创建一次比较器，纯数值排序不承担本地化比较器的初始化开销。
    collator ??= new Intl.Collator(undefined, { numeric: true });
    return collator.compare(String(compA), String(compB)) * direction;
  });
};
