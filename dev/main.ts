import { debounce } from '~/index';

document.documentElement.addEventListener(
  'click',
  debounce(() => {
    console.log('debounce');
  })
);
