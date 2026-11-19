/**
 * location.search 转对象，同名 key 会聚合为数组
 *
 * 沿用 decodeURIComponent：保留字面量 '+'，非法百分号转义抛出 URIError。
 *
 * @param search location.search eg: '?age=18&name=lili'
 * @param decode 是否需要解码
 * @returns 解析后的对象
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 保留 2.x 的公开返回类型，兼容调用方已有的字段类型赋值
export const searchToObj = (search: string, decode = true): Record<string, any> => {
  if (!search) {
    return {};
  }

  const obj: Record<string, string | string[]> = {};

  search
    .replace(/^\?/, '')
    .split('&')
    .forEach((str) => {
      if (!str) {
        return;
      }

      // 只按第一个 '=' 分割，值中含 '=' 的情况（如 base64）才不会被截断
      const eqIndex = str.indexOf('=');
      const rKey = eqIndex === -1 ? str : str.slice(0, eqIndex);
      // 没有 '=' 的裸 key（如 '?flag'）值取空字符串
      const rValue = eqIndex === -1 ? '' : str.slice(eqIndex + 1);

      if (!rKey) {
        return;
      }

      const key = decode ? decodeURIComponent(rKey) : rKey;
      const value = decode ? decodeURIComponent(rValue) : rValue;

      const existed = obj[key];

      if (existed !== undefined) {
        if (Array.isArray(existed)) {
          existed.push(value);
        } else {
          obj[key] = [existed, value];
        }
      } else {
        obj[key] = value;
      }
    });

  return obj;
};

/**
 * 对象转 search，`undefined` 与 `null`（含数组项）沿用 2.x 的字符串化行为
 *
 * @param obj 待转化对象
 * @param encode 是否编码 默认true
 * @returns search 字符串，不含前导 '?'
 */
export const objToSearch = (obj: unknown, encode = true): string => {
  if (!obj) {
    return '';
  }

  // 入参不要求索引签名，已有 interface、数组等调用方式仍可通过类型检查。
  const record = obj as Record<string, unknown>;

  return Object.keys(record)
    .map((key) => {
      const value = record[key];
      const rKey = encode ? encodeURIComponent(key) : key;

      if (Array.isArray(value)) {
        // map + join 保留稀疏数组和空数组原有的分隔符行为。
        return value
          .map((item: unknown) => {
            const rValue = encode ? encodeURIComponent(item as string) : item;
            return `${rKey}=${rValue}`;
          })
          .join('&');
      }

      const rValue = encode ? encodeURIComponent(value as string) : value;
      return `${rKey}=${rValue}`;
    })
    .join('&');
};
