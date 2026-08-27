# vavt-util

一个 JavaScript 工具库

```shell
npm i @vavt/util
```

## 使用

### deepClone

深克隆，支持 `Date`、`RegExp`、`Map`、`Set`、`TypedArray`、循环引用与 `Symbol` 键；类实例会保留原型链，函数按引用返回。

```js
const newObj = deepClone({ a: 1 });
```

### debounce

函数防抖，默认延迟 200 毫秒

每次调用返回一个 Promise：被后续调用取代时 resolve `'cancel'`，真正执行时 resolve `'done'`，不会有 Promise 悬挂。

```js
const handler = debounce(() => {
  // 做点什么
}, 100);

await handler(); // 'done' 或 'cancel'
```

### linkTo

模拟跳转

两个选项都可以单独传入，未传的一项仍取默认值。

```js
linkTo('https://github.com/imzbf/vavt-util', {
  // 是否新窗口打开，默认true
  _blank: false,
  // 是否禁止新窗口访问 opener（rel="noopener noreferrer"），默认true
  nofollow: false
});

// 只关掉新窗口，nofollow 仍为默认的 true
linkTo('https://github.com/imzbf/vavt-util', { _blank: false });
```

### download

基础下载，仅支持`get`，同时支持下载`base64`为图片

```js
download('https://github.com/imzbf/vavt-util/archive/refs/tags/v1.0.0.zip', 'v1.0.0.zip');

download('data:image/svg+xml,xxxxx', 'v1.0.0.png');
```

### smoothScroll

平滑滚动至指定高度

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

创建独立的滚动方法

```js
import { createSmoothScroll } from '@vavt/util';
const smoothScroll = createSmoothScroll();
```

> [!NOTE] 滚动动画由 `requestAnimationFrame` 驱动，而浏览器会暂停隐藏标签页（以及被 `display: none` 等隐藏的场景）的 `requestAnimationFrame`。因此在标签页切到后台时滚动会停在当前位置、结束回调也不会触发，等标签页重新可见后动画会从暂停处继续。
>
> 如果需要「即使不可见也立刻到位」，直接用 `ele.scrollTo(0, top)` 更合适。

### throttle

函数节流，默认延迟 200 毫秒。以尾部触发（trailing）的方式执行：节流窗口内多次调用只会执行最后一次的参数。

```js
const handler = throttle(() => {
  // 做点什么
}, 100);
```

> [!NOTE] 节流的计时由 `requestAnimationFrame` 驱动，而浏览器会暂停隐藏标签页的 `requestAnimationFrame`。因此标签页切到后台时，已排队的调用不会执行，会一直等到标签页重新可见；期间的新调用只会不断覆盖待执行的参数，恢复后按最后一次参数执行一次。
>
> 非浏览器环境（SSR、Node）没有 `requestAnimationFrame`，会自动降级为 `setTimeout`，不受此限制。绑定 `scroll`、`resize`、`mousemove` 这类只在可见时才产生的事件不受影响；如果节流的是定时任务或后台轮询这类需要在不可见时也持续推进的逻辑，应改用 `debounce` 或自行用 `setTimeout` 实现。

### searchToObj

将`location.search`转换为对象结构，同名 key 聚合为数组

值中的 `=` 不会被截断，`+` 解码为空格，裸 key 取空字符串，非法百分号转义会退回原文而不抛错。

```js
searchToObj('?age=18&name=lili&h=1&h=2');
// { age: '18', name: 'lili', h: ['1', '2'] }

searchToObj('?token=YWJjPT0=&flag');
// { token: 'YWJjPT0=', flag: '' }
```

### objToSearch

将对象转换为`location.search`结构，`undefined` 与 `null`（含数组项）会被忽略

```js
objToSearch({ age: 18, name: 'lili', h: [1, 2] });
// 'age=18&name=lili&h=1&h=2'

objToSearch({ a: undefined, b: null, c: 1 });
// 'c=1'
```

### objectSort

将对象数组进行关键词排序。不修改入参，返回新数组，相等项保持原有顺序。

排序规则：`undefined` < `null` < 数字 < 字符串（`desc` 时整体反转）。数字与数字字符串按数值比较，`Date` 按时间戳比较。

```js
objectSort(
  [
    { name: 'F', age: 25 },
    { name: 'D', age: null },
    { name: 'E', age: 20 },
    { name: 'H', age: 30 },
    { name: 'A', age: undefined },
    { name: 'J', age: 'b' },
    { name: 'K', age: 'c' },
    { name: 'I', age: 'a' },
    { name: 'B', age: undefined },
    { name: 'G', age: 25 },
    { name: 'C', age: undefined }
  ],
  (item) => item.age
);
// [
//   { name: 'A', age: undefined },
//   { name: 'B', age: undefined },
//   { name: 'C', age: undefined },
//   { name: 'D', age: null },
//   { name: 'E', age: 20 },
//   { name: 'F', age: 25 },
//   { name: 'G', age: 25 },
//   { name: 'H', age: 30 },
//   { name: 'I', age: 'a' },
//   { name: 'J', age: 'b' },
//   { name: 'K', age: 'c' }
// ];
```

### draggingScroll

按住元素时，拖拽滚动元素。拖动过程中禁用文本选中，超出滚动范围时按边界收敛。返回的方法会解绑监听，包含仍在进行中的拖动。

```js
const removeListener = draggingScroll(document.getElementById('id'));

// removeListener()
```

### randomId

生成一串随机字符，由 base36 时间戳与固定长度随机串拼接，优先使用 `crypto` 保证随机性

```js
console.log(randomId());
// lmsimogsk7pukfcia4
```

### isNumber

判断内容是否是数字，科学计数法也会被认为是数字。只接受数字、`bigint` 与数字字符串，数组、`Date`、对象等引用类型一律为 `false`。

```js
console.log(isNumber('0.23e-1'));
// true

console.log(isNumber([5]), isNumber(new Date()));
// false false
```

### deepMerge

深度合并对象与数组，只有纯对象与数组会被递归合并，其他类型（`Date`、`RegExp`、`Map`、`Set`、类实例等）均会被新的值整体替换。支持循环引用。

`target` 会被原地修改，返回值即 `target` 本身。

```js
const a = { a: 1, b: { c: 2, d: 3 }, e: 4 };
const b = { a: 1, b: { c: 5, f: 6 }, e: 4 };

console.log(deepMerge(a, b));
// { a: 1, b: { c: 5, d: 3, f: 6 }, e: 4 }
```

### getRootOffset

获取元素相对某个祖先节点的偏移量，默认相对 `document.body`。

通过「各自到文档的偏移量相减」实现，因此参照节点无需是定位元素（`position` 非 `static`）也能得到正确结果。

```js
getRootOffset(inner, wrapper);
// { offsetTop: 50, offsetLeft: 80 }
```

### isMobile

判断当前设备是否为移动端设备。依据：userAgent 包含移动端信息并且支持触摸事件，否则降级为使用屏幕宽度判断。

入参描述：

```ts
interface MobileCheckOptions {
  /**
   * 是否强制使用屏幕宽度检查。
   * 默认为 false。
   */
  forceScreenWidth?: boolean;

  /**
   * 自定义的屏幕宽度阈值（单位为像素）。
   * 默认为 768 像素。
   */
  threshold?: number;

  /**
   * 当 User-Agent 检查结果为 false 时，是否自动降级使用屏幕宽度检查。
   * 默认为 true。
   */
  fallbackToScreenWidth?: boolean;
}
```

...更多待更新

## 开发

需要 Node.js >= 23.6，直接由 Node 原生执行 TypeScript，无需额外的运行时转译工具。

```shell
npm install

npm run dev
```

### 构建

```shell
# 同时构建es\cjs\umd版本
npm run build

# 仅构建类型声明
npm run build:type
```

### 测试与检查

```shell
# 单元测试，由 node:test 直接运行 .ts
npm test

# 代码检查
npm run lint
npm run lint:fix

# 格式化
npm run format
npm run format:check
```

### 文件夹说明

```
/dev             // 开发调试代码
/packages        // 组件库源码
  /xxx           // 工具
  /index.ts      // 统一导出
```
