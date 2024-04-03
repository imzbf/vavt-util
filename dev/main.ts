import {
  debounce,
  isNumber,
  download,
  linkTo,
  deepClone,
  objectSort,
  objToSearch,
  searchToObj,
  deepMerge,
  throttle
} from '~/index';

const debounceHandler = debounce(() => {
  console.log('\n防抖', 'debounce');
}, 1000);
const throttleHandler = throttle<any, any>((ddd) => {
  console.log('\n节流', 'throttle', ddd);
}, 1000);
document.documentElement.addEventListener('click', () => {
  debounceHandler();
  throttleHandler(1);
});

console.log('\nSearch转对象', searchToObj('?1=2&dd=123&dd=456'));
console.log(
  '\n对象转Search',
  objToSearch({
    '1': '2',
    a: new Date(),
    dd: ['123', '456']
  })
);

const aaa = {
  bbb: {}
};
const bbb = { aaa: {} };

aaa.bbb = bbb;
bbb.aaa = aaa;

const sss = new Set();
sss.add('sss');

console.log(
  '深克隆',
  deepClone({
    1: new Date(),
    a: /^\?/g,
    b: 'bbbb',
    c: {
      d: 'dddd'
    },
    aaa,
    bbb,
    sss
  })
);

window.onload = () => {
  document.querySelector('#link-to')?.addEventListener('click', () => {
    linkTo('https://github.com');
  });

  document.querySelector('#download')?.addEventListener('click', () => {
    download('https://www.cockos.com/licecap/licecap132.dmg');
  });
};

console.log('\n对象排序:\n');
console.table(
  objectSort(
    [
      { name: 'F', age: 25 },
      { name: 'D', age: null },
      { name: 'E', age: 0.001730103806228428 },
      { name: 'H', age: 0.09731833910034607 },
      { name: 'A', age: undefined },
      { name: 'J', age: 'b' },
      { name: 'K', age: 'c' },
      { name: 'I', age: 'a' },
      { name: 'B', age: undefined },
      { name: 'G', age: 25 },
      { name: 'C', age: undefined }
    ],
    (item) => item.age
  )
);

console.log('\nisNumber\n', isNumber('0.23e-1'));

const a = { a: 1, b: { c: 2, d: 3 }, e: 4 };
const b = { a: 1, b: { c: 5, f: 6 }, e: 4 };

console.log(deepMerge(a, b));
