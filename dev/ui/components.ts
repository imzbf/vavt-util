export type DemoCard = {
  card: HTMLElement;
  actions: HTMLDivElement;
  output: HTMLDivElement | null;
  setOutput: (...nodes: (Node | string)[]) => void;
};

const stringify = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value !== 'object' || value === null) {
    return JSON.stringify(value, null, 2);
  }
  const seen = new WeakSet<object>();
  return JSON.stringify(
    value,
    (_, val) => {
      if (val instanceof Date) return val.toISOString();
      if (val instanceof RegExp) return val.toString();
      if (val instanceof Set) return Array.from(val);
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val as object)) {
          return '[Circular]';
        }
        seen.add(val as object);
      }
      return val;
    },
    2
  );
};

export const createBadge = (text: string): HTMLSpanElement => {
  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = text;
  return badge;
};

export const createHelperText = (text: string): HTMLParagraphElement => {
  const helper = document.createElement('p');
  helper.className = 'inline-info';
  helper.textContent = text;
  return helper;
};

export const createStatusChip = (text: string, type: 'good' | 'warn'): HTMLSpanElement => {
  const chip = document.createElement('span');
  chip.className = `status-chip ${type}`;
  chip.textContent = text;
  return chip;
};

export const createTextarea = (value: string, placeholder?: string): HTMLTextAreaElement => {
  const area = document.createElement('textarea');
  area.className = 'demo-textarea';
  area.value = value;
  if (placeholder) {
    area.placeholder = placeholder;
  }
  return area;
};

export const createDemoCard = (
  app: HTMLElement,
  title: string,
  description?: string,
  options?: { hideOutput?: boolean; badge?: string }
): DemoCard => {
  const card = document.createElement('section');
  card.className = 'demo-card';

  const heading = document.createElement('h2');
  if (options?.badge) {
    heading.appendChild(createBadge(options.badge));
  }
  const titleText = document.createElement('span');
  titleText.textContent = title;
  heading.appendChild(titleText);
  card.appendChild(heading);

  if (description) {
    const desc = document.createElement('p');
    desc.className = 'description';
    desc.textContent = description;
    card.appendChild(desc);
  }

  const actions = document.createElement('div');
  actions.className = 'demo-actions';
  card.appendChild(actions);

  let output: HTMLDivElement | null = null;
  if (!options?.hideOutput) {
    output = document.createElement('div');
    output.className = 'demo-output';
    card.appendChild(output);
  }

  app.appendChild(card);

  const setOutput = (...nodes: (Node | string)[]): void => {
    if (!output) return;
    const list = nodes.length ? nodes : ['暂无数据'];
    const normalized = list.map((node) =>
      typeof node === 'string' ? document.createTextNode(node) : node
    );
    output.replaceChildren(...normalized);
  };

  return { card, actions, output, setOutput };
};

export const createButton = (
  label: string,
  onClick: () => void,
  variant: 'primary' | 'secondary' = 'primary'
): HTMLButtonElement => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `demo-button${variant === 'secondary' ? ' secondary' : ''}`;
  btn.textContent = label;
  btn.addEventListener('click', onClick);
  return btn;
};

export const renderPre = (value: unknown, label?: string): HTMLDivElement => {
  const wrapper = document.createElement('div');
  wrapper.className = 'kv-block';

  if (label) {
    const title = document.createElement('strong');
    title.textContent = label;
    wrapper.appendChild(title);
  }

  const pre = document.createElement('pre');
  pre.textContent = stringify(value);
  wrapper.appendChild(pre);
  return wrapper;
};

export const createPill = (label: string, value: string | number): HTMLSpanElement => {
  const pill = document.createElement('span');
  pill.className = 'pill';
  pill.textContent = `${label}: ${value}`;
  return pill;
};

export const createTable = (data: Record<string, unknown>[]): HTMLTableElement => {
  const table = document.createElement('table');
  if (!data.length) return table;

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  Object.keys(data[0]).forEach((key) => {
    const th = document.createElement('th');
    th.textContent = key;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  data.forEach((row) => {
    const tr = document.createElement('tr');
    Object.keys(data[0]).forEach((key) => {
      const td = document.createElement('td');
      const cellValue = row[key];
      if (cellValue === null || cellValue === undefined) {
        td.textContent = String(cellValue);
      } else if (typeof cellValue === 'object') {
        td.textContent = stringify(cellValue);
      } else {
        td.textContent = String(cellValue);
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  return table;
};

export const insertHelperAboveActions = (card: DemoCard, helper: HTMLElement): void => {
  card.card.insertBefore(helper, card.actions);
};

export const safeParseJSON = (
  text: string
): { ok: true; value: unknown } | { ok: false; error: string } => {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
};

export const isPlainRecord = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

export const isMergeableStructure = (
  value: unknown
): value is Record<string, unknown> | Array<unknown> => {
  return value !== null && typeof value === 'object';
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.warn('Clipboard copy failed', error);
    return false;
  }
};
