import { randomId } from '~/index';

import {
  copyToClipboard,
  createButton,
  createDemoCard,
  createHelperText,
  createStatusChip
} from '@/ui/components';

export const registerUtilityDemos = (app: HTMLElement): void => {
  const randomCard = createDemoCard(app, '随机 ID', 'randomId 每次点击都会生成新的 ID', {
    badge: '标识'
  });

  const randomList = document.createElement('div');
  randomList.className = 'pill-list';

  const updateRandomOutput = (status?: string, success = true): void => {
    const nodes: Array<Node> = [randomList, createHelperText('点击任意 ID 即可复制到剪贴板。')];
    if (status) {
      nodes.push(createStatusChip(status, success ? 'good' : 'warn'));
    }
    randomCard.setOutput(...nodes);
  };

  const pushRandomId = (): void => {
    const id = randomId();
    const pill = document.createElement('span');
    pill.className = 'pill';
    pill.textContent = id;
    pill.style.cursor = 'pointer';
    pill.title = '点击复制 ID';
    pill.addEventListener('click', async () => {
      const ok = await copyToClipboard(id);
      updateRandomOutput(ok ? `已复制 ${id}` : '复制失败，浏览器限制', ok);
    });
    randomList.prepend(pill);
    updateRandomOutput(`已生成 ${id}`);
  };

  randomCard.actions.append(createButton('生成 ID', () => pushRandomId()));
  updateRandomOutput();
  pushRandomId();
};
