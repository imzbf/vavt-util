import { deepClone, deepMerge, objectSort } from '~/index';

import {
  createButton,
  createDemoCard,
  createHelperText,
  createStatusChip,
  createTable,
  createTextarea,
  insertHelperAboveActions,
  isMergeableStructure,
  renderPre,
  safeParseJSON
} from '@/ui/components';

type People = Array<{ name: string; age: number | string | null | undefined }>;

export const registerDataDemos = (app: HTMLElement): void => {
  registerCloneDemo(app);
  registerSortDemo(app);
  registerMergeDemo(app);
};

const registerCloneDemo = (app: HTMLElement): void => {
  const cloneCard = createDemoCard(
    app,
    '深克隆',
    '可视化查看深克隆结果，包括 Date、RegExp、Set、循环引用',
    {
      badge: '数据'
    }
  );

  insertHelperAboveActions(
    cloneCard,
    createHelperText('点击按钮修改原对象或克隆对象，观察双方是否相互影响。')
  );

  const nodeA: { bbb?: unknown } = { bbb: {} };
  const nodeB: { aaa?: unknown } = { aaa: {} };
  nodeA.bbb = nodeB;
  nodeB.aaa = nodeA;
  const complexSet = new Set(['sss']);

  const cloneSource = {
    num: 123,
    date: new Date(),
    regexp: /^\?/g,
    nested: {
      d: 'dddd'
    },
    nodeA,
    nodeB,
    complexSet
  };
  let cloned = deepClone(cloneSource);

  const refreshCloneView = (): void => {
    const asRecord = cloned as typeof cloneSource;
    const isIsolated =
      cloneSource !== cloned &&
      cloneSource.nested !== asRecord.nested &&
      cloneSource.nodeA !== asRecord.nodeA;
    cloneCard.setOutput(
      renderPre(cloneSource, '原始对象'),
      renderPre(cloned, '克隆结果'),
      createStatusChip(
        isIsolated ? '修改互不影响 ✅' : '值同步，需重新克隆',
        isIsolated ? 'good' : 'warn'
      )
    );
  };

  cloneCard.actions.append(
    createButton('修改原对象', () => {
      cloneSource.nested.d = `原对象-${Date.now()}`;
      cloneSource.complexSet.add(Math.random().toString(36).slice(2));
      refreshCloneView();
    }),
    createButton(
      '修改克隆对象',
      () => {
        (cloned as { nested: { d: string } }).nested.d = `克隆对象-${Date.now()}`;
        refreshCloneView();
      },
      'secondary'
    ),
    createButton(
      '重新克隆',
      () => {
        cloned = deepClone(cloneSource);
        refreshCloneView();
      },
      'secondary'
    )
  );

  refreshCloneView();
};

const registerSortDemo = (app: HTMLElement): void => {
  const sortCard = createDemoCard(app, '对象排序', 'objectSort 根据 age 排序并输出表格', {
    badge: '排序'
  });

  insertHelperAboveActions(
    sortCard,
    createHelperText('切换排序方式或生成新数据，立即查看排序结果。')
  );

  const people: People = [
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
  ];

  const orderSelect = document.createElement('select');
  orderSelect.className = 'demo-input';
  orderSelect.style.minWidth = '140px';
  orderSelect.innerHTML = '<option value="asc">升序</option><option value="desc">降序</option>';

  const mutateData = (): void => {
    people.forEach((item) => {
      item.age = Math.random() > 0.5 ? Math.round(Math.random() * 40) : undefined;
    });
  };

  const renderSorted = (): void => {
    const cloned = deepClone(people) as People;
    const sorted = objectSort(cloned, (item) => item.age, orderSelect.value as 'asc' | 'desc');
    sortCard.setOutput(createTable(sorted as Record<string, unknown>[]));
  };

  sortCard.actions.append(
    orderSelect,
    createButton('应用排序', () => renderSorted()),
    createButton(
      '随机生成数据',
      () => {
        mutateData();
        renderSorted();
      },
      'secondary'
    )
  );

  orderSelect.addEventListener('change', () => renderSorted());
  renderSorted();
};

const registerMergeDemo = (app: HTMLElement): void => {
  const mergeCard = createDemoCard(app, '深度合并', 'deepMerge 展示对象与数组的合并结果', {
    badge: '合并'
  });

  insertHelperAboveActions(
    mergeCard,
    createHelperText('编辑左右 JSON 输入并点击按钮，即可查看最新合并结果。')
  );

  const mergeInputA = createTextarea(
    JSON.stringify({ a: 1, b: { c: 2, d: 3 }, e: 4, list: [1, { deep: 'target' }] }, null, 2),
    '目标对象 (target)'
  );
  const mergeInputB = createTextarea(
    JSON.stringify(
      { a: 1, b: { c: 5, f: 6 }, e: 4, list: [9, { deep: 'source', extra: true }] },
      null,
      2
    ),
    '源对象 (source)'
  );

  const mergeInputs = document.createElement('div');
  mergeInputs.className = 'split-layout';
  mergeInputs.append(mergeInputA, mergeInputB);
  mergeCard.card.insertBefore(mergeInputs, mergeCard.actions);

  const renderMergeCard = (): void => {
    const parsedA = safeParseJSON(mergeInputA.value || '{}');
    const parsedB = safeParseJSON(mergeInputB.value || '{}');

    if (!parsedA.ok) {
      mergeCard.setOutput(createStatusChip(`target JSON 解析失败：${parsedA.error}`, 'warn'));
      return;
    }
    if (!parsedB.ok) {
      mergeCard.setOutput(createStatusChip(`source JSON 解析失败：${parsedB.error}`, 'warn'));
      return;
    }
    if (!isMergeableStructure(parsedA.value) || !isMergeableStructure(parsedB.value)) {
      mergeCard.setOutput(createStatusChip('请输入合法的对象或数组', 'warn'));
      return;
    }

    const target = deepClone(parsedA.value) as object;
    const result = deepMerge(target, parsedB.value as object);
    mergeCard.setOutput(
      renderPre(parsedA.value, 'target'),
      renderPre(parsedB.value, 'source'),
      renderPre(result, '合并结果')
    );
  };

  mergeCard.actions.append(createButton('执行合并', () => renderMergeCard()));
  mergeInputA.addEventListener('input', () => renderMergeCard());
  mergeInputB.addEventListener('input', () => renderMergeCard());
  renderMergeCard();
};
