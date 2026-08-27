/**
 * 判断是否是「纯对象」：字面量对象或 `Object.create(null)` 产物。
 * Date、RegExp、Map、Set、类实例等都不是纯对象，合并时应整体替换而非递归。
 */
const isPlainObject = (item: unknown): item is Record<string, unknown> => {
  if (item === null || typeof item !== 'object' || Array.isArray(item)) {
    return false;
  }

  const proto = Object.getPrototypeOf(item);
  return proto === null || proto === Object.prototype;
};

const UNSAFE_MERGE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

const isSafeMergeKey = (key: string): boolean => {
  return !UNSAFE_MERGE_KEYS.has(key);
};

interface DeepMergeOptions {
  excludeKeys?: (key: string) => boolean;
}

/**
 * 深度合并对象与数组：对象字段与数组项都会按层级递归合并，其他类型（Date、RegExp、Map、Set、
 * 类实例等）均会被新的值整体替换。
 * 如果某层级的 key 被过滤，则执行替换而不继续深度合并。
 *
 * 注意：`target` 会被原地修改，返回值即 `target` 本身。
 *
 * @param target 合并目标，会被原地修改
 * @param source 合并来源
 * @param options 合并配置
 * @returns target 本身
 */
export const deepMerge = <T extends object, U extends object>(
  target: T,
  source: U,
  options: DeepMergeOptions = {}
): T & U => {
  return mergeValues(target, source, options, new WeakMap()) as T & U;
};

/**
 * 实际的合并实现，`seen` 记录「已合并过的 source」以支持循环引用。
 */
const mergeValues = (
  target: object,
  source: object,
  options: DeepMergeOptions,
  seen: WeakMap<object, unknown>
): unknown => {
  if (Array.isArray(target) && Array.isArray(source)) {
    return mergeArrays(target, source, options, seen);
  }

  // 循环引用：同一个 source 再次进入时，直接复用上一次的结果，避免无限递归。
  const cached = seen.get(source);
  if (cached !== undefined) {
    return cached;
  }
  seen.set(source, target);

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
      targetRecord[key] = mergeArrays(targetValue, sourceValue, options, seen);
    } else if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      // 递归深度合并
      targetRecord[key] = mergeValues(targetValue, sourceValue, options, seen);
    } else {
      // 直接替换
      targetRecord[key] = sourceValue;
    }
  }

  return target;
};

const mergeArrays = (
  targetArr: unknown[],
  sourceArr: unknown[],
  options: DeepMergeOptions,
  seen: WeakMap<object, unknown>
): unknown[] => {
  const cached = seen.get(sourceArr);
  if (cached !== undefined) {
    return cached as unknown[];
  }

  const merged = targetArr.slice();
  seen.set(sourceArr, merged);

  sourceArr.forEach((sourceItem, index) => {
    const targetItem = merged[index];

    if (Array.isArray(sourceItem) && Array.isArray(targetItem)) {
      merged[index] = mergeArrays(targetItem, sourceItem, options, seen);
    } else if (isPlainObject(sourceItem) && isPlainObject(targetItem)) {
      merged[index] = mergeValues(targetItem, sourceItem, options, seen);
    } else {
      merged[index] = sourceItem;
    }
  });

  return merged;
};
