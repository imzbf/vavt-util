/* eslint-disable indent */

import { isNumber } from '..';

/**
 * 对对象列表按照某个字段进行排序
 *
 * @param list 待排序的列表
 * @param getParam 获取用于排序的字段值
 * @param order 排序方式，默认升序
 * @returns
 */
export const objectSort = <T>(
  list: Array<T>,
  getParam: (item: T) => unknown,
  order: 'asc' | 'desc' = 'asc'
): Array<T> => {
  return list.sort((a, b) => {
    const compA = getParam(a);
    const compB = getParam(b);

    // undefined永远是最小的，它比另一个undefined更小
    if ((compA === undefined && compB !== undefined) || (compA === null && compB !== undefined)) {
      return order === 'asc' ? -1 : 1;
    }

    if ((compA === null || compA === undefined) && compB === undefined) {
      return order === 'asc' ? 1 : -1;
    }

    // compA这里不会是null和undefined，所以compB如果是的话，一定比compA小
    if (compB === undefined || compB === null) {
      return order === 'asc' ? 1 : -1;
    }

    // 如果都是number
    if (isNumber(compA) && isNumber(compB)) {
      return order == 'asc'
        ? (((compA as number) - (compB as number)) as number)
        : (compB as number) - (compA as number);
    }

    return order == 'asc'
      ? String(compA).localeCompare(String(compB), undefined, {
          numeric: true
        })
      : String(compB).localeCompare(String(compA), undefined, {
          numeric: true
        });
  });
};
