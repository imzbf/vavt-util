import {
  debounce,
  isNumber,
  download,
  linkTo,
  deepClone,
  objectSort,
  objToSearch,
  searchToObj
} from '~/index';

document.documentElement.addEventListener('click', () => {
  debounce(() => {
    console.log('\n防抖', 'debounce');
  });
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
  )
);

console.log('\nisNumber\n', isNumber('0.23e-1'));
