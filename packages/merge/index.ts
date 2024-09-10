/* eslint-disable @typescript-eslint/no-explicit-any */
type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

const isObject = (item: unknown): item is object => {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
};

interface DeepMergeOptions {
  excludeKeys?: (key: string) => boolean;
}

/**
 * 深度合并对象，只有对象会被合并，其他类型均会被新的值替换。
 * 如果某层级的 key 被过滤，则执行替换而不继续深度合并。
 */
export const deepMerge = <T extends object, U extends object>(
  target: T,
  source: U,
  options: DeepMergeOptions = {}
): T & U => {
  const { excludeKeys } = options;

  for (const key in source) {
    // 如果匹配到过滤规则，则直接替换，不进行深度合并
    if (excludeKeys && excludeKeys(key)) {
      (target as any)[key] = source[key];
    } else if (isObject(source[key]) && isObject((target as any)[key])) {
      // 递归深度合并
      (target as any)[key] = deepMerge(
        (target as any)[key] as DeepPartial<T[keyof T]>,
        source[key] as DeepPartial<U[keyof U]>,
        options
      );
    } else {
      // 直接替换
      (target as any)[key] = source[key];
    }
  }

  return target as T & U;
};
