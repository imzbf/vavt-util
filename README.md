# vavt-util

English \| [中文](https://github.com/imzbf/vavt-util/blob/develop/README-CN.md)

A JavaScript library.

```shell
yarn add @vavt/util
# or
npm i @vavt/util
```

## Usage

### deepClone

Can be used for most basic reference types(`Map`, `Set`, `RegExp`, `Date`)

```js
const newObj = deepClone({ a: 1 });
```

### debounce

Default delay of 200 ms

```js
const handler = debounce(() => {
  // Do something
}, 100);
```

### linkTo

Open a new page.

```js
linkTo('https://github.com/imzbf/vavt-util', {
  // Open on a new window, default true
  _blank: false,
  // Access opener, default true
  nofollow: false
});
```

### download

Only can be used for `get` request, or base64

```js
download('https://github.com/imzbf/vavt-util/archive/refs/tags/v1.0.0.zip', 'v1.0.0.zip');

download('data:image/svg+xml,xxxxx', 'v1.0.0.png');
```

### smoothScroll

Smooth scrolling to specified height

```js
smoothScroll(
  // Scrolling element
  document.documentElement,
  // Scroll to 100px
  100,
  // Callback at the end of scrolling
  () => {
    console.log('end');
  },
  // Whether to delay the execution of the callback at the end of the scrolling, defalut 100ms
  50
);
```

Create independent scrolling methods

```js
import { createSmoothScroll } from '@vavt/util';
const smoothScroll = createSmoothScroll();
```

### throttle

Default delay of 200 ms

```js
const handler = throttle(() => {
  // Do something
}, 100);
```

### searchToObj

Convert `location.search` to object

```js
searchToObj('?age=18&name=lili&h=1&h=2');
// { age: 18, name: 'lili', h: [1, 2] }
```

### objToSearch

Convert object to `location.search`

```js
objToSearch({ age: 18, name: 'lili', h: [1, 2] });
// 'age=18&name=lili&h=1&h=2'
```

### objectSort

Sort object arrays by keyword

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

Dragging and scrolling element while holding it down.

```js
const removeListener = draggingScroll(document.getElementById('id'));

// removeListener()
```

### uuid

Generate a string of random characters.

```js
console.log(uuid());
// lmsimogsk7pukfcia4
```

### isNumber

To determine whether a string is a number, Scientific notation will also be considered as a number.

```js
console.log(isNumber('0.23e-1'));
// true
```

...More to be updated

## Develop

```shell
yarn dev
```

### Build

```shell
# build es\cjs\umd
yarn build

# build es
yarm build:es
```

### Folder

```
/dev             // Debug code
/packages        // Source code of utils
  /xxx           // Item of utils
  /index.ts      // Exported entry
```
