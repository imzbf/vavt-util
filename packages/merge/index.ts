/* eslint-disable @typescript-eslint/no-explicit-any */
const isPlainObject = (item: unknown): item is Record<string, unknown> => {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
};

const UNSAFE_MERGE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

const isSafeMergeKey = (key: string): boolean => {
  return !UNSAFE_MERGE_KEYS.has(key);
};

interface DeepMergeOptions {
  excludeKeys?: (key: string) => boolean;
}

/**
 * 深度合并对象与数组：对象字段与数组项都会按层级递归合并，其他类型均会被新的值替换。
 * 如果某层级的 key 被过滤，则执行替换而不继续深度合并。
 */
export const deepMerge = <T extends object, U extends object>(
  target: T,
  source: U,
  options: DeepMergeOptions = {}
): T & U => {
  if (Array.isArray(target) && Array.isArray(source)) {
    return mergeArrays(target, source, options) as T & U;
  }

  const { excludeKeys } = options;
  const targetRecord = target as Record<string, unknown>;
  const sourceRecord = source as Record<string, unknown>;

  // 只处理 source 自身的可枚举属性，并过滤原型链污染相关的危险 key。
  for (const key of Object.keys(sourceRecord)) {
    if (!isSafeMergeKey(key)) {
      continue;
    }

    const sourceValue = sourceRecord[key];
    const targetValue = targetRecord[key];

    // 如果匹配到过滤规则，则直接替换，不进行深度合并
    if (excludeKeys && excludeKeys(key)) {
      targetRecord[key] = sourceValue;
    } else if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
      targetRecord[key] = mergeArrays(targetValue, sourceValue, options);
    } else if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      // 递归深度合并
      targetRecord[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
        options
      );
    } else {
      // 直接替换
      targetRecord[key] = sourceValue;
    }
  }

  return target as T & U;
};

const mergeArrays = (
  targetArr: unknown[],
  sourceArr: unknown[],
  options: DeepMergeOptions
): unknown[] => {
  const merged = targetArr.slice();

  sourceArr.forEach((sourceItem, index) => {
    const targetItem = merged[index];

    if (Array.isArray(sourceItem) && Array.isArray(targetItem)) {
      merged[index] = mergeArrays(targetItem, sourceItem, options);
    } else if (isPlainObject(sourceItem) && isPlainObject(targetItem)) {
      merged[index] = deepMerge(
        targetItem as Record<string, unknown>,
        sourceItem as Record<string, unknown>,
        options
      );
    } else {
      merged[index] = sourceItem;
    }
  });

  return merged;
};
