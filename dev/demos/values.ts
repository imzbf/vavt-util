import { isNumber, isPrimitive } from '~/index';

import {
  createButton,
  createDemoCard,
  createHelperText,
  createStatusChip,
  insertHelperAboveActions,
  renderPre
} from '@/ui/components';

export const registerValueDemos = (app: HTMLElement): void => {
  registerPrimitiveDemo(app);
  registerIsNumberDemo(app);
};

type PrimitiveExample = {
  label: string;
  preview: string;
  factory: () => unknown;
  expectPrimitive: boolean;
};

const registerPrimitiveDemo = (app: HTMLElement): void => {
  const primitiveCard = createDemoCard(app, '基础类型判断', 'isPrimitive 判断值是否为原始类型', {
    badge: '类型'
  });

  insertHelperAboveActions(
    primitiveCard,
    createHelperText('点击任意按钮即可查看 isPrimitive 的判断结果。')
  );

  const primitiveExamples: PrimitiveExample[] = [
    { label: '"hello"', preview: '"hello"', factory: () => 'hello', expectPrimitive: true },
    { label: '42', preview: '42', factory: () => 42, expectPrimitive: true },
    { label: 'true', preview: 'true', factory: () => true, expectPrimitive: true },
    { label: 'null', preview: 'null', factory: () => null, expectPrimitive: true },
    { label: 'undefined', preview: 'undefined', factory: () => undefined, expectPrimitive: true },
    {
      label: 'Symbol("id")',
      preview: 'Symbol(id)',
      factory: () => Symbol('id'),
      expectPrimitive: true
    },
    { label: '[]', preview: '[]', factory: () => [], expectPrimitive: false },
    { label: '{}', preview: '{ foo: 1 }', factory: () => ({ foo: 1 }), expectPrimitive: false },
    { label: '() => {}', preview: '函数', factory: () => () => 'hello', expectPrimitive: false }
  ];

  const renderPrimitiveExample = (example: PrimitiveExample): void => {
    const value = example.factory();
    const result = isPrimitive(value);
    primitiveCard.setOutput(
      createStatusChip(result ? '基础类型 ✅' : '引用类型 ❌', result ? 'good' : 'warn'),
      renderPre(
        {
          input: example.preview,
          typeof: typeof value,
          result
        },
        'isPrimitive 结果'
      )
    );
  };

  primitiveExamples.forEach((example) => {
    primitiveCard.actions.append(
      createButton(
        example.label,
        () => renderPrimitiveExample(example),
        example.expectPrimitive ? 'primary' : 'secondary'
      )
    );
  });

  renderPrimitiveExample(primitiveExamples[0]);
};

const registerIsNumberDemo = (app: HTMLElement): void => {
  const isNumberCard = createDemoCard(
    app,
    '数字校验 (isNumber)',
    '输入任意字符串判断是否为合法数字',
    {
      badge: '数字'
    }
  );

  insertHelperAboveActions(
    isNumberCard,
    createHelperText('输入框实时校验，点击按钮可在日志区锁定一次结果。')
  );

  const numberInput = document.createElement('input');
  numberInput.className = 'demo-input';
  numberInput.placeholder = '例如：0.23e-1';
  numberInput.value = '0.23e-1';

  const updateIsNumberResult = (): void => {
    const value = numberInput.value.trim();
    const valid = isNumber(value);
    const status = createStatusChip(
      valid ? `合法数字：${value || '（空）'}` : `非法：${value || '（空）'}`,
      valid ? 'good' : 'warn'
    );
    isNumberCard.setOutput(status);
  };

  isNumberCard.actions.append(
    numberInput,
    createButton('立即检测', () => updateIsNumberResult())
  );
  numberInput.addEventListener('input', updateIsNumberResult);
  updateIsNumberResult();
};
