import { debounce } from '~/index';
import { objToSearch, searchToObj } from '~/urlSearch';

document.documentElement.addEventListener(
  'click',
  debounce(() => {
    console.log('debounce');
  })
);

console.log(searchToObj('?1=2&dd=123&dd=456'));
console.log(
  objToSearch({
    '1': '2',
    a: new Date(),
    dd: ['123', '456'],
  })
);
