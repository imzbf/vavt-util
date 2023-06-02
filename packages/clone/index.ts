type Primitive = string | number | boolean | null | undefined | symbol | bigint;

/**
 * 判断对象是否是基础类型，Function也等同
 *
 * @param obj
 * @returns
 */
export const isPrimitive = (obj: unknown): obj is Primitive => {
  const ts = typeof obj;
  return (ts !== 'function' && ts !== 'object') || obj === null;
};

/**
 * 克隆一个正则
 *
 * @param re
 * @returns
 */
const cloneRegExp = (re: RegExp): RegExp => {
  const flags = re.flags === '' ? undefined : re.flags;
  return new RegExp(re.source, flags);
};

/**
 * 针对常见的数据类型进行深克隆
 *
 * @param obj
 * @returns
 */
export const deepClone = <T>(obj: T, hash = new WeakMap()): T => {
  if (obj === null || isPrimitive(obj)) {
    return obj;
  }

  if (hash.has(obj)) {
    return hash.get(obj) as T;
  }

  if (obj instanceof RegExp) {
    return cloneRegExp(obj) as T;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof Function) {
    return obj as T;
  }

  if (obj instanceof Map) {
    const clonedMap = new Map();
    hash.set(obj, clonedMap);
    obj.forEach((value, key) => {
      clonedMap.set(key, deepClone(value, hash));
    });
    return clonedMap as T;
  }

  if (obj instanceof Set) {
    const clonedSet = new Set();
    hash.set(obj, clonedSet);
    for (let value of obj) {
      clonedSet.add(deepClone(value, hash));
    }
    return clonedSet as T;
  }

  if (Array.isArray(obj)) {
    const clonedArr = [] as unknown as T extends (infer U)[] ? U[] : never;
    hash.set(obj, clonedArr);
    obj.forEach((value) => {
      clonedArr.push(deepClone(value, hash));
    });
    return clonedArr as T;
  }

  const clonedObj = {} as { [key: string]: any };
  hash.set(obj, clonedObj);
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key], hash);
    }
  }

  return clonedObj as T;
};
