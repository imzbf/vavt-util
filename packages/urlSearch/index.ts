/**
 * 解码单个片段，遇到非法百分号转义（如 `%E4%B8`）时退回原文，避免抛出 URIError。
 */
const safeDecode = (raw: string): string => {
  // 查询串中 '+' 表示空格
  const normalized = raw.replace(/\+/g, ' ');

  try {
    return decodeURIComponent(normalized);
  } catch {
    return normalized;
  }
};

/**
 * location.search 转对象，同名 key 会聚合为数组
 *
 * @param search location.search eg: '?age=18&name=lili'
 * @param decode 是否需要解密
 * @returns 解析后的对象
 */
export const searchToObj = (search: string, decode = true): Record<string, string | string[]> => {
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

      const key = decode ? safeDecode(rKey) : rKey;
      const value = decode ? safeDecode(rValue) : rValue;

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
 * 对象转 search，`undefined` 与 `null`（含数组项）会被忽略
 *
 * @param obj 待转化对象
 * @param encode 是否加密 默认true
 * @returns search 字符串，不含前导 '?'
 */
export const objToSearch = (obj: Record<string, unknown>, encode = true): string => {
  if (!obj) {
    return '';
  }

  const pairs: string[] = [];

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const rKey = encode ? encodeURIComponent(key) : key;

    const pushPair = (item: unknown) => {
      // 空值不参与拼接，避免出现 'a=undefined'
      if (item === undefined || item === null) {
        return;
      }

      const rValue = encode ? encodeURIComponent(String(item)) : String(item);
      pairs.push(`${rKey}=${rValue}`);
    };

    if (Array.isArray(value)) {
      value.forEach(pushPair);
    } else {
      pushPair(value);
    }
  });

  return pairs.join('&');
};
