// 这些内建对象的值依赖内部状态，逐字段合并不能更新其实际内容。
const OPAQUE_OBJECT_TAGS = new Set([
  '[object Date]',
  '[object RegExp]',
  '[object Map]',
  '[object Set]',
  '[object WeakMap]',
  '[object WeakSet]',
  '[object ArrayBuffer]',
  '[object SharedArrayBuffer]',
  '[object Promise]'
]);

/** 普通对象与类实例沿用 2.x 的字段合并行为，内建数据对象整体替换。 */
const isMergeableObject = (item: unknown): item is Record<string, unknown> => {
  if (
    item === null ||
    typeof item !== 'object' ||
    Array.isArray(item) ||
    ArrayBuffer.isView(item)
  ) {
    return false;
  }

  return !OPAQUE_OBJECT_TAGS.has(Object.prototype.toString.call(item));
};

const UNSAFE_MERGE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

const isSafeMergeKey = (key: string): boolean => {
  return !UNSAFE_MERGE_KEYS.has(key);
};

interface DeepMergeOptions {
  excludeKeys?: (key: string) => boolean;
}

type MergeCache = WeakMap<object, WeakMap<object, object>>;

/**
 * 深度合并对象与数组，类实例仍按字段合并。Date、RegExp、Map、Set、缓冲区等内建数据对象
 * 作为字段值时会被新的值整体替换。
 * 如果某层级的 key 被过滤，则执行替换而不继续深度合并。
 *
 * 对象目标会被原地修改；两个数组合并时返回新数组，按索引合并并保留目标的多余项。
 *
 * @param target 合并目标
 * @param source 合并来源
 * @param options 合并配置
 * @returns 对象目标本身，或合并后的新数组
 */
export const deepMerge = <T extends object, U extends object>(
  target: T,
  source: U,
  options: DeepMergeOptions = {}
): T & U => {
  return mergeValues(target, source, options, new WeakMap()) as T & U;
};

/**
 * 缓存以 source 与 target 的组合为键：既终止循环，又保留不同目标分支各自的字段。
 */
const mergeValues = (
  target: object,
  source: object,
  options: DeepMergeOptions,
  seen: MergeCache
): object => {
  let targets = seen.get(source);
  const cached = targets?.get(target);
  if (cached !== undefined) {
    return cached;
  }

  if (!targets) {
    targets = new WeakMap();
    seen.set(source, targets);
  }

  if (Array.isArray(target) && Array.isArray(source)) {
    const merged = target.slice();
    targets.set(target, merged);

    source.forEach((sourceItem, index) => {
      const targetItem = merged[index];

      if (
        (Array.isArray(sourceItem) && Array.isArray(targetItem)) ||
        (isMergeableObject(sourceItem) && isMergeableObject(targetItem))
      ) {
        merged[index] = mergeValues(targetItem, sourceItem, options, seen);
      } else {
        merged[index] = sourceItem;
      }
    });

    return merged;
  }

  targets.set(target, target);

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
    } else if (
      (Array.isArray(sourceValue) && Array.isArray(targetValue)) ||
      (isMergeableObject(sourceValue) && isMergeableObject(targetValue))
    ) {
      // 递归深度合并
      targetRecord[key] = mergeValues(targetValue, sourceValue, options, seen);
    } else {
      // 直接替换
      targetRecord[key] = sourceValue;
    }
  }

  return target;
};
