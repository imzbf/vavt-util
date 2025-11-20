import { debounce, throttle } from '~/index';

import {
  createButton,
  createDemoCard,
  createHelperText,
  createPill,
  insertHelperAboveActions
} from '@/ui/components';

export const registerInteractionDemos = (app: HTMLElement): void => {
  const interactionCard = createDemoCard(
    app,
    '防抖与节流可视化',
    '高频点击下观察触发次数与节流/防抖生效情况',
    { badge: '节流/防抖' }
  );

  insertHelperAboveActions(
    interactionCard,
    createHelperText('点击“快速点击”重复触发事件，输出区会展示命中统计与最新时间戳。')
  );

  const interactionStats = {
    trigger: 0,
    debounce: 0,
    throttle: 0
  };
  const interactionLog: string[] = [];

  const renderInteractionStats = (): void => {
    const pills = document.createElement('div');
    pills.className = 'pill-list';
    pills.append(
      createPill('点击总次数', interactionStats.trigger),
      createPill('防抖命中', interactionStats.debounce),
      createPill('节流命中', interactionStats.throttle)
    );

    const logList = document.createElement('div');
    logList.className = 'info-block';
    const latest = interactionLog.slice(-3).reverse();
    latest.forEach((item) => {
      const line = document.createElement('span');
      line.textContent = item;
      logList.appendChild(line);
    });
    if (!latest.length) {
      logList.textContent = '暂无触发记录';
    }
    interactionCard.setOutput(pills, logList);
  };

  const debounced = debounce(() => {
    interactionStats.debounce += 1;
    interactionLog.push(`防抖回调 · ${new Date().toLocaleTimeString()}`);
    if (interactionLog.length > 20) interactionLog.shift();
    renderInteractionStats();
  }, 1000);

  const throttled = throttle(() => {
    interactionStats.throttle += 1;
    interactionLog.push(`节流回调 · ${new Date().toLocaleTimeString()}`);
    if (interactionLog.length > 20) interactionLog.shift();
    renderInteractionStats();
  }, 1000);

  interactionCard.actions.append(
    createButton('快速点击', () => {
      interactionStats.trigger += 1;
      debounced();
      throttled();
      interactionLog.push(`触发点击 · ${new Date().toLocaleTimeString()}`);
      if (interactionLog.length > 20) interactionLog.shift();
      renderInteractionStats();
    }),
    createButton(
      '重置数据',
      () => {
        interactionStats.trigger = 0;
        interactionStats.debounce = 0;
        interactionStats.throttle = 0;
        renderInteractionStats();
      },
      'secondary'
    )
  );

  renderInteractionStats();
};
