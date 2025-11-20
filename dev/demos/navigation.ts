import { message } from '@vavt/message';

import { download, isMobile, linkTo } from '~/index';

import {
  createButton,
  createDemoCard,
  createHelperText,
  createStatusChip,
  insertHelperAboveActions
} from '@/ui/components';

export const registerNavigationDemos = (app: HTMLElement): void => {
  const quickActionsCard = createDemoCard(app, '常用操作', 'linkTo / download / isMobile 示例', {
    badge: '导航 / 设备'
  });

  insertHelperAboveActions(
    quickActionsCard,
    createHelperText('点击按钮即可触发行为，输出区会同步显示执行结果。')
  );

  quickActionsCard.actions.append(
    createButton('打开 GitHub', () => {
      linkTo('https://github.com/imzbf/vavt-util');
      quickActionsCard.setOutput(createStatusChip('已尝试在新窗口打开 GitHub', 'good'));
    }),
    createButton('下载示例文件', () => {
      download('https://www.cockos.com/licecap/licecap132.dmg');
      quickActionsCard.setOutput(createStatusChip('已触发 dmg 文件下载', 'good'));
    }),
    createButton(
      '是否移动端？',
      () => {
        const mobile = isMobile();
        const text = mobile ? '是移动端 ✅' : '不是移动端 ❌';
        message.info(text);
        quickActionsCard.setOutput(createStatusChip(text, mobile ? 'good' : 'warn'));
      },
      'secondary'
    )
  );

  quickActionsCard.setOutput(createHelperText('点击上方按钮体验快捷方法。'));
};
