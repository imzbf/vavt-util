/* eslint-disable @typescript-eslint/no-explicit-any */
type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

const isObject = (item: unknown): item is object => {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
};

/**
 * 深度合并对象，只有对象会被合并，其他类型均会被新的值替换
 */
export const deepMerge = <T extends object, U extends object>(target: T, source: U): T & U => {
  for (const key in source) {
    if (isObject(source[key]) && isObject((target as any)[key])) {
      (target as any)[key] = deepMerge(
        (target as any)[key] as DeepPartial<T[keyof T]>,
        source[key] as DeepPartial<U[keyof U]>
      );
    } else {
      (target as any)[key] = source[key];
    }
  }

  return target as T & U;
};
