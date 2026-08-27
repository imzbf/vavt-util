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
 * 支持 Date、RegExp、Map、Set、Array、TypedArray、ArrayBuffer 与普通对象；
 * 类实例会保留原型链，Symbol 键也会被复制。函数按引用返回（不克隆）。
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
      clonedMap.set(deepClone(key, hash), deepClone(value, hash));
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

  if (obj instanceof ArrayBuffer) {
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

  // 保留原型链，让类实例克隆后依然是同一个类的实例
  const clonedObj = Object.create(Object.getPrototypeOf(ref)) as Record<string | symbol, unknown>;
  hash.set(ref, clonedObj);

  // Reflect.ownKeys 同时覆盖字符串键与 Symbol 键
  for (const key of Reflect.ownKeys(ref)) {
    const descriptor = Object.getOwnPropertyDescriptor(ref, key);

    if (!descriptor || !descriptor.enumerable) {
      continue;
    }

    // getter/setter 原样保留，不触发取值
    if (descriptor.get || descriptor.set) {
      Object.defineProperty(clonedObj, key, descriptor);
    } else {
      clonedObj[key] = deepClone(descriptor.value, hash);
    }
  }

  return clonedObj as T;
};
