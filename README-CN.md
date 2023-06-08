# vavt-util

[English](https://github.com/imzbf/vavt-util) \| 中文

Js 工具库

## 使用

- `deepClone`：深克隆，支持大部分基础引用类型

  ```js
  const newObj = deepClone({ a: 1 });
  ```

- `debounce`：函数防抖，默认延迟 200 毫秒

  ```js
  const handler = debounce(() => {
    // 做点什么
  }, 100);
  ```

- `linkTo`：模拟跳转

  ```js
  linkTo('https://github.com/imzbf/vavt-util', {
    // 是否新窗口打开，默认true
    _blank: false,
    // 是否可访问opener，默认true
    nofollow: false
  });
  ```

- `download`：基础下载，仅支持`get`，同时支持下载`base64`为图片

  ```js
  download('https://github.com/imzbf/vavt-util/archive/refs/tags/v1.0.0.zip', 'v1.0.0.zip');

  download('data:image/svg+xml,xxxxx', 'v1.0.0.png');
  ```

- `smoothScroll`：平滑滚动至指定高度

  ```js
  smoothScroll(
    // 滚动元素
    document.documentElement,
    // 滚动至100px高度
    100,
    // 滚动结束回调
    () => {
      console.log('滚动结束');
    },
    // 是否延迟执行滚动结束回调，默认100毫秒
    50
  );
  ```

- `throttle`：函数节流，默认延迟 200 毫秒

  ```js
  const handler = throttle(() => {
    // 做点什么
  }, 100);
  ```

- `searchToObj`：将`location.search`转换为对象结构

  ```js
  searchToObj('?age=18&name=lili&h=1&h=2');
  // { age: 18, name: 'lili', h: [1, 2] }
  ```

- `objToSearch`：将对象转换为`location.search`结构

  ```js
  objToSearch({ age: 18, name: 'lili', h: [1, 2] });
  // 'age=18&name=lili&h=1&h=2'
  ```

- `objectSort`：将对象数组进行关键词排序

  ```js
  objectSort(
    [
      { name: 'B', age: 17 },
      { name: 'A', age: 13 },
      { name: 'D', age: 27 },
      { name: 'C', age: 23 }
    ],
    (item) => item.age
  );
  // [
  //   { name: 'A', age: 13 },
  //   { name: 'B', age: 17 },
  //   { name: 'C', age: 23 },
  //   { name: 'D', age: 27 }
  // ];
  ```

...更多待更新

## 开发

```shell
yarn dev
```

### 构建

```shell
# 同时构建es\cjs\umd版本
yarn build

# 构建指定版本
yarm build:es
```

### 文件夹说明

```
/dev             // 开发调试代码
/packages        // 组件库源码
  /xxx           // 工具
  /index.ts      // 统一导出
```
