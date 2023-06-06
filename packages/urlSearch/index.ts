/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * localtion.search 转对象
 *
 * @param search localtion.search eg: '?age=18&name=lili'
 * @param decode 是否需要解密
 * @returns
 */
export const searchToObj = (search: string, decode = true) => {
  if (!search) {
    return {};
  }

  const obj: { [key: string]: any } = {};

  search
    .replace(/^\?/, '')
    .split('&')
    .forEach((str) => {
      const [rKey, rValue] = str.split('=');

      if (rKey) {
        const key = decode ? decodeURIComponent(rKey) : rKey;
        const value = decode ? decodeURIComponent(rValue) : rValue;

        if (obj[key] !== undefined) {
          if (!Array.isArray(obj[key])) {
            obj[key] = [obj[key]];
          }
          obj[key].push(value);
        } else {
          obj[key] = value;
        }
      }
    });

  return obj;
};

/**
 *  对象转search
 *
 * @param obj 待转化对象
 * @param encode 是否加密 默认true
 * @returns
 */
export const objToSearch = (obj: any, encode = true) => {
  if (!obj) {
    return '';
  }

  return Object.keys(obj)
    .map((key) => {
      const rKey = encode ? encodeURIComponent(key) : key;

      if (Array.isArray(obj[key])) {
        return (obj[key] as Array<unknown>)
          .map((value) => {
            const rValue = encode ? encodeURIComponent(value as string) : value;
            return `${rKey}=${rValue}`;
          })
          .join('&');
      } else {
        const rValue = encode ? encodeURIComponent(obj[key]) : obj[key];
        return `${rKey}=${rValue}`;
      }
    })
    .join('&');
};
