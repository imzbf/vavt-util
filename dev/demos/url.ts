import { objToSearch, searchToObj } from '~/index';

import {
  createButton,
  createDemoCard,
  createHelperText,
  createStatusChip,
  createTextarea,
  insertHelperAboveActions,
  isPlainRecord,
  renderPre,
  safeParseJSON
} from '@/ui/components';

export const registerUrlDemos = (app: HTMLElement): void => {
  const searchCard = createDemoCard(
    app,
    'Search ↔ Object',
    'objToSearch 与 searchToObj 双向演示',
    {
      badge: 'URL'
    }
  );

  insertHelperAboveActions(searchCard, createHelperText('任意修改输入，两侧结果会实时更新。'));

  const searchInput = createTextarea('?1=2&dd=123&dd=456', '输入 URL search 片段，例如 ?foo=bar');
  const objectInput = createTextarea(
    JSON.stringify(
      {
        id: '2',
        a: new Date().toISOString(),
        dd: ['123', '456']
      },
      null,
      2
    ),
    '输入 JSON 对象，将会转换为 search 字符串'
  );

  const inputsWrapper = document.createElement('div');
  inputsWrapper.className = 'split-layout';
  inputsWrapper.append(searchInput, objectInput);
  searchCard.card.insertBefore(inputsWrapper, searchCard.actions);

  const updateSearchCard = (): void => {
    const nodes: Array<Node> = [];
    nodes.push(
      renderPre(searchToObj(searchInput.value), `searchToObj(${searchInput.value || '（空）'})`)
    );

    const parsed = safeParseJSON(objectInput.value || '{}');
    if (!parsed.ok) {
      nodes.push(createStatusChip(`对象 JSON 解析失败：${parsed.error}`, 'warn'));
    } else if (!isPlainRecord(parsed.value)) {
      nodes.push(createStatusChip('对象需为普通 JSON 对象', 'warn'));
    } else {
      nodes.push(renderPre(objToSearch(parsed.value), 'objToSearch(对象)'));
    }
    searchCard.setOutput(...nodes);
  };

  searchCard.actions.append(createButton('同步转换', () => updateSearchCard()));
  searchInput.addEventListener('input', () => updateSearchCard());
  objectInput.addEventListener('input', () => updateSearchCard());
  updateSearchCard();
};
