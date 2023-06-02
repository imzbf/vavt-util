import { deepClone } from '~/clone';
import { debounce } from '~/index';
import { download, linkTo } from '~/link';
import { objToSearch, searchToObj } from '~/urlSearch';

document.documentElement.addEventListener(
  'click',
  debounce(() => {
    console.log('\n防抖', 'debounce');
  })
);

console.log('\nSearch转对象', searchToObj('?1=2&dd=123&dd=456'));
console.log(
  '\n对象转Search',
  objToSearch({
    '1': '2',
    a: new Date(),
    dd: ['123', '456'],
  })
);

const aaa = {
  bbb: {},
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
      d: 'dddd',
    },
    aaa,
    bbb,
    sss,
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
