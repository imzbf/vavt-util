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
  getParam: (item: T) => number,
  order: 'asc' | 'desc' = 'asc'
): Array<T> => {
  return [...list].sort((a, b) => {
    if (order === 'asc') {
      return getParam(a) - getParam(b);
    } else {
      return getParam(b) - getParam(a);
    }
  });
};
