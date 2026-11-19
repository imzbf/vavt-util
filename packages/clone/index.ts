type Primitive = string | number | boolean | null | undefined | symbol | bigint;

/**
 * 判断对象是否是基础类型。函数与对象都不是基础类型，`null` 是。
 *
 * @param obj
 * @returns
 */
export const isPrimitive = (obj: unknown): obj is Primitive => {
  const ts = typeof obj;
  return (ts !== 'function' && ts !== 'object') || obj === null;
};

/**
 * 克隆一个正则，保留 flags 与 lastIndex
 *
 * @param re
 * @returns
 */
const cloneRegExp = (re: RegExp): RegExp => {
  const cloned = new RegExp(re.source, re.flags);
  cloned.lastIndex = re.lastIndex;
  return cloned;
};

/**
 * 针对常见的数据类型进行深克隆，支持循环引用
 *
 * 支持 Date、RegExp、Map、Set、Array、TypedArray、ArrayBuffer、SharedArrayBuffer；
 * 普通对象与类实例按自身可枚举属性生成普通对象快照，getter 会取值，Symbol 键也会复制。
 * Map 的键与函数沿用 2.x 的引用保留规则。
 *
 * @param obj
 * @returns
 */
export const deepClone = <T>(obj: T, hash = new WeakMap<object, unknown>()): T => {
  if (isPrimitive(obj)) {
    return obj;
  }

  if (typeof obj === 'function') {
    return obj;
  }

  // 到这里一定是非 null 的引用类型，收窄类型便于作为 WeakMap 的 key
  const ref = obj as unknown as object;

  if (hash.has(ref)) {
    return hash.get(ref) as T;
  }

  if (obj instanceof RegExp) {
    return cloneRegExp(obj) as T;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof Map) {
    const clonedMap = new Map();
    hash.set(ref, clonedMap);
    obj.forEach((value, key) => {
      clonedMap.set(key, deepClone(value, hash));
    });
    return clonedMap as T;
  }

  if (obj instanceof Set) {
    const clonedSet = new Set();
    hash.set(ref, clonedSet);
    for (const value of obj) {
      clonedSet.add(deepClone(value, hash));
    }
    return clonedSet as T;
  }

  if (
    obj instanceof ArrayBuffer ||
    (typeof SharedArrayBuffer !== 'undefined' && obj instanceof SharedArrayBuffer)
  ) {
    const clonedBuffer = obj.slice(0);
    hash.set(ref, clonedBuffer);
    return clonedBuffer as T;
  }

  if (ArrayBuffer.isView(obj)) {
    // TypedArray / DataView：按自身构造器复制底层数据
    const view = obj as ArrayBufferView & { length?: number };
    const ClonedCtor = view.constructor as new (...args: unknown[]) => unknown;
    const clonedView = new ClonedCtor(
      deepClone(view.buffer, hash),
      view.byteOffset,
      // TypedArray 用元素个数，DataView 用字节长度
      view.length ?? view.byteLength
    );
    hash.set(ref, clonedView);
    return clonedView as T;
  }

  if (Array.isArray(obj)) {
    // 用 length + 索引赋值，保留稀疏数组的空洞（forEach 会跳过空洞）
    const clonedArr = new Array(obj.length) as unknown as unknown[];
    hash.set(ref, clonedArr);
    obj.forEach((value, index) => {
      clonedArr[index] = deepClone(value, hash);
    });
    return clonedArr as T;
  }

  // 2.x 将类实例也转成普通对象；保留原型会改变方法调用与 getter 的既有语义。
  const clonedObj: Record<string | symbol, unknown> = {};
  hash.set(ref, clonedObj);

  // Reflect.ownKeys 同时覆盖字符串键与 Symbol 键
  for (const key of Reflect.ownKeys(ref)) {
    const descriptor = Object.getOwnPropertyDescriptor(ref, key);

    if (!descriptor || !descriptor.enumerable) {
      continue;
    }

    // 读取 getter 得到快照，并显式定义数据属性，避免触发 __proto__ 等继承的 setter。
    Object.defineProperty(clonedObj, key, {
      value: deepClone((ref as Record<string | symbol, unknown>)[key], hash),
      enumerable: true,
      configurable: true,
      writable: true
    });
  }

  return clonedObj as T;
};
