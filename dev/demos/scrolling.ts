import { createSmoothScroll, draggingScroll, getRootOffset, smoothScroll } from '~/index';

import {
  createButton,
  createDemoCard,
  createHelperText,
  insertHelperAboveActions,
  renderPre
} from '@/ui/components';

export const registerScrollingDemos = (app: HTMLElement): void => {
  registerSmoothScrollDemo(app);
  registerDraggingScrollDemo(app);
  registerOffsetDemo(app);
};

const registerSmoothScrollDemo = (app: HTMLElement): void => {
  const smoothCard = createDemoCard(
    app,
    '平滑滚动',
    '对比默认 smoothScroll 与 createSmoothScroll 实例',
    {
      badge: '滚动'
    }
  );

  insertHelperAboveActions(
    smoothCard,
    createHelperText('点击按钮即可观察容器滚动到指定位置，输出窗同步展示当前滚动信息。')
  );

  const smoothArea = document.createElement('div');
  smoothArea.style.height = '180px';
  smoothArea.style.overflow = 'auto';
  smoothArea.style.border = '1px solid #e2e8f0';
  smoothArea.style.borderRadius = '6px';
  smoothArea.style.padding = '12px';
  smoothArea.style.background = '#fff';
  smoothArea.style.display = 'flex';
  smoothArea.style.flexDirection = 'column';
  smoothArea.style.gap = '8px';

  for (let i = 1; i <= 18; i += 1) {
    const block = document.createElement('div');
    block.textContent = `示例段落 ${i}：滚动效果连贯且平缓。`;
    block.style.padding = '8px';
    block.style.borderRadius = '4px';
    block.style.background = i % 2 === 0 ? '#f1f5f9' : '#fff';
    smoothArea.appendChild(block);
  }

  if (smoothCard.output) {
    smoothCard.card.insertBefore(smoothArea, smoothCard.output);
  }

  const smoothInstance = createSmoothScroll();

  const updateSmoothOutput = (): void => {
    smoothCard.setOutput(
      renderPre(
        {
          scrollTop: Math.round(smoothArea.scrollTop),
          scrollHeight: Math.round(smoothArea.scrollHeight)
        },
        '滚动状态'
      )
    );
  };

  smoothArea.addEventListener('scroll', updateSmoothOutput);

  smoothCard.actions.append(
    createButton('滚到顶部', () => smoothScroll(smoothArea, 0)),
    createButton(
      '滚到中部',
      () => {
        const middle = Math.max(0, smoothArea.scrollHeight / 2 - smoothArea.clientHeight / 2);
        smoothScroll(smoothArea, middle);
      },
      'secondary'
    ),
    createButton('实例滚到底部', () => smoothInstance(smoothArea, smoothArea.scrollHeight))
  );

  updateSmoothOutput();
};

const registerDraggingScrollDemo = (app: HTMLElement): void => {
  const draggingCard = createDemoCard(app, '拖拽滚动区域', 'draggingScroll 让容器支持鼠标拖动', {
    badge: '滚动'
  });

  insertHelperAboveActions(
    draggingCard,
    createHelperText('按住上方浅蓝区域拖动即可横向滚动，或使用按钮完成快速定位。')
  );

  const dragArea = document.createElement('div');
  dragArea.style.width = '100%';
  dragArea.style.overflow = 'auto';
  dragArea.style.border = '1px solid #e2e8f0';
  dragArea.style.borderRadius = '6px';
  dragArea.style.padding = '12px';
  dragArea.style.cursor = 'grab';

  const dragContent = document.createElement('div');
  dragContent.style.display = 'flex';
  dragContent.style.gap = '12px';
  dragContent.style.width = 'max-content';

  for (let i = 1; i <= 14; i += 1) {
    const tile = document.createElement('div');
    tile.style.minWidth = '120px';
    tile.style.height = '80px';
    tile.style.borderRadius = '6px';
    tile.style.background = '#e0e7ff';
    tile.style.display = 'flex';
    tile.style.alignItems = 'center';
    tile.style.justifyContent = 'center';
    tile.textContent = `卡片 ${i}`;
    dragContent.appendChild(tile);
  }

  dragArea.appendChild(dragContent);
  if (draggingCard.output) {
    draggingCard.card.insertBefore(dragArea, draggingCard.output);
  }

  draggingScroll(dragArea);

  draggingCard.actions.append(
    createButton('回到起点', () => dragArea.scrollTo({ left: 0, behavior: 'smooth' })),
    createButton(
      '滚动至末尾',
      () => dragArea.scrollTo({ left: dragArea.scrollWidth, behavior: 'smooth' }),
      'secondary'
    )
  );

  draggingCard.setOutput(createHelperText('按住上方区域拖动，即可横向浏览所有卡片。'));
};

const registerOffsetDemo = (app: HTMLElement): void => {
  const offsetCard = createDemoCard(
    app,
    '元素偏移量',
    'getRootOffset 计算节点相对容器/页面的距离',
    {
      badge: '几何'
    }
  );

  insertHelperAboveActions(
    offsetCard,
    createHelperText('点击“随机移动元素”后重新计算，可直观看到偏移数值变化。')
  );

  const offsetWrapper = document.createElement('div');
  offsetWrapper.style.border = '1px dashed #cbd5f5';
  offsetWrapper.style.padding = '20px';
  offsetWrapper.style.borderRadius = '6px';
  offsetWrapper.style.background = '#fff';

  const offsetInner = document.createElement('div');
  offsetInner.style.width = '140px';
  offsetInner.style.height = '80px';
  offsetInner.style.background = '#fde68a';
  offsetInner.style.display = 'flex';
  offsetInner.style.alignItems = 'center';
  offsetInner.style.justifyContent = 'center';
  offsetInner.style.borderRadius = '6px';
  offsetInner.style.margin = '50px 0 0 80px';
  offsetInner.textContent = '目标元素';
  offsetWrapper.appendChild(offsetInner);

  if (offsetCard.output) {
    offsetCard.card.insertBefore(offsetWrapper, offsetCard.output);
  }

  const updateOffset = (): void => {
    const containerOffset = getRootOffset(offsetInner, offsetWrapper);
    const bodyOffset = getRootOffset(offsetInner);
    offsetCard.setOutput(
      renderPre(containerOffset, '相对容器'),
      renderPre(bodyOffset, '相对 document.body')
    );
  };

  offsetCard.actions.append(
    createButton('重新计算', () => updateOffset()),
    createButton(
      '随机移动元素',
      () => {
        offsetInner.style.marginLeft = `${60 + Math.floor(Math.random() * 120)}px`;
        offsetInner.style.marginTop = `${40 + Math.floor(Math.random() * 100)}px`;
        updateOffset();
      },
      'secondary'
    )
  );

  updateOffset();
};
