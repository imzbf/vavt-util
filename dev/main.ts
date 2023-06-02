import { deepClone } from '~/clone';
import { debounce } from '~/index';
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
  })
);
