import test from 'node:test';
import assert from 'node:assert/strict';

import { createSmoothScroll } from '../packages/smoothScroll/index.ts';
import { draggingScroll } from '../packages/draggingScroll/index.ts';
import { getRootOffset } from '../packages/offset/index.ts';
import { linkTo } from '../packages/link/index.ts';
import { mockAnimationFrame } from './helpers/animationFrame.ts';

test('smoothScroll keeps only the latest animation when an interrupted callback reenters', (t) => {
  const frames = mockAnimationFrame(t);
  const callbacks: string[] = [];
  const ele = {
    scrollTop: 0,
    scrollTo(_left: number, top: number) {
      this.scrollTop = top;
    }
  };
  const scroll = createSmoothScroll();
  const element = ele as HTMLElement;

  scroll(
    element,
    100,
    () => {
      callbacks.push('first');
      scroll(element, 200, () => callbacks.push('latest'), false);
    },
    false
  );
  scroll(element, 300, () => callbacks.push('middle'), false);

  assert.deepEqual(callbacks, ['first', 'middle']);
  assert.equal(frames.size, 1);
  for (let frame = 0; frame < 60 && frames.size > 0; frame += 1) {
    frames.step(frame * 16);
    assert.ok(frames.size <= 1);
  }

  assert.equal(frames.size, 0);
  assert.equal(ele.scrollTop, 200);
  assert.deepEqual(callbacks, ['first', 'middle', 'latest']);
});

test('smoothScroll settles interrupted and completed callbacks once with their own delays', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const frames = mockAnimationFrame(t);
  const ele = { scrollTop: 0, scrollTo() {} } as unknown as HTMLElement;
  const calls: string[] = [];
  const scroll = createSmoothScroll();

  scroll(ele, 100, () => calls.push('interrupted'), 10);
  scroll(ele, 0, () => calls.push('completed'), 20);
  frames.step(0);
  assert.equal(frames.size, 0);
  assert.deepEqual(calls, []);
  t.mock.timers.tick(10);
  assert.deepEqual(calls, ['interrupted']);
  t.mock.timers.tick(10);
  assert.deepEqual(calls, ['interrupted', 'completed']);
  t.mock.timers.tick(100);
  assert.equal(calls.length, 2);
});

class DragElement extends EventTarget {
  ownerDocument = Object.assign(new EventTarget(), { defaultView: new EventTarget() });
  style = { userSelect: 'text' };
  scrollHeight = 1000;
  scrollWidth = 1000;
  clientHeight = 100;
  clientWidth = 100;
  offsetHeight = 110;
  offsetWidth = 110;
  scrollLeft = 0;
  scrollTop = 0;

  scroll(options: ScrollToOptions) {
    this.scrollLeft = options.left ?? this.scrollLeft;
    this.scrollTop = options.top ?? this.scrollTop;
  }
}

const mouse = (target: EventTarget, type: string, x = 0, y = 0, button = 0) => {
  target.dispatchEvent(Object.assign(new Event(type), { clientX: x, clientY: y, button }));
};

test('draggingScroll reaches the client-area boundary for bordered elements', (t) => {
  const ele = new DragElement();
  const dispose = draggingScroll(ele as unknown as HTMLElement);
  t.after(dispose);

  mouse(ele, 'mousedown');
  mouse(ele.ownerDocument, 'mousemove', -2000, -2000);
  assert.equal(ele.scrollTop, 900);
  assert.equal(ele.scrollLeft, 900);
  mouse(ele.ownerDocument, 'mousemove', 2000, 2000);
  assert.equal(ele.scrollTop, 0);
  assert.equal(ele.scrollLeft, 0);
});

test('draggingScroll restores styles after a missed mouseup and a second drag', (t) => {
  const ele = new DragElement();
  const scroll = t.mock.method(ele, 'scroll');
  t.after(draggingScroll(ele as unknown as HTMLElement));

  mouse(ele, 'mousedown');
  mouse(ele, 'mousedown');
  assert.equal(ele.style.userSelect, 'none');
  mouse(ele.ownerDocument, 'mousemove', -20, -30);
  assert.equal(scroll.mock.callCount(), 1);
  mouse(ele.ownerDocument, 'mouseup');
  assert.equal(ele.style.userSelect, 'text');
  mouse(ele.ownerDocument, 'mousemove', -40, -50);
  assert.equal(scroll.mock.callCount(), 1);
});

test('draggingScroll cleans up on window blur and disposal during a drag', () => {
  const ele = new DragElement();
  const dispose = draggingScroll(ele as unknown as HTMLElement);

  mouse(ele, 'mousedown');
  ele.ownerDocument.defaultView.dispatchEvent(new Event('blur'));
  assert.equal(ele.style.userSelect, 'text');
  mouse(ele.ownerDocument, 'mousemove', -50, -50);
  assert.equal(ele.scrollTop, 0);

  mouse(ele, 'mousedown');
  dispose();
  assert.equal(ele.style.userSelect, 'text');
  mouse(ele, 'mousedown');
  mouse(ele.ownerDocument, 'mousemove', -50, -50);
  assert.equal(ele.style.userSelect, 'text');
  assert.equal(ele.scrollTop, 0);
});

test('getRootOffset uses the same padding-edge coordinates for static and positioned roots', () => {
  const body = {
    offsetTop: 0,
    offsetLeft: 0,
    clientTop: 0,
    clientLeft: 0,
    offsetParent: null
  } as unknown as HTMLElement;
  const root = {
    offsetTop: 100,
    offsetLeft: 200,
    clientTop: 10,
    clientLeft: 10,
    offsetParent: body
  } as unknown as HTMLElement;
  const staticChild = {
    offsetTop: 130,
    offsetLeft: 230,
    offsetParent: body
  } as unknown as HTMLElement;
  const positionedChild = {
    offsetTop: 20,
    offsetLeft: 20,
    offsetParent: root
  } as unknown as HTMLElement;

  assert.deepEqual(getRootOffset(staticChild, root), { offsetTop: 20, offsetLeft: 20 });
  assert.deepEqual(getRootOffset(positionedChild, root), { offsetTop: 20, offsetLeft: 20 });
  assert.deepEqual(getRootOffset(root, root), { offsetTop: 0, offsetLeft: 0 });
});

test('getRootOffset includes borders of intermediate offset parents', () => {
  const root = {
    offsetTop: 0,
    offsetLeft: 0,
    clientTop: 10,
    clientLeft: 10,
    offsetParent: null
  } as unknown as HTMLElement;
  const intermediate = {
    offsetTop: 20,
    offsetLeft: 30,
    clientTop: 5,
    clientLeft: 6,
    offsetParent: root
  } as unknown as HTMLElement;
  const child = {
    offsetTop: 7,
    offsetLeft: 8,
    offsetParent: intermediate
  } as unknown as HTMLElement;

  assert.deepEqual(getRootOffset(child, root), { offsetTop: 32, offsetLeft: 44 });
});

test('linkTo preserves 2.x defaults for omitted and partial options', (t) => {
  const clicks: Array<{ target: string; rel: string; attached: boolean }> = [];
  const documentMock = {
    body: {
      appendChild(anchor: { attached: boolean }) {
        anchor.attached = true;
      },
      removeChild(anchor: { attached: boolean }) {
        anchor.attached = false;
      }
    },
    createElement() {
      return {
        style: { display: '' },
        href: '',
        target: '',
        rel: '',
        attached: false,
        click() {
          clicks.push({ target: this.target, rel: this.rel, attached: this.attached });
        }
      };
    }
  };
  const original = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: documentMock });
  t.after(() => {
    if (original) {
      Object.defineProperty(globalThis, 'document', original);
    } else {
      Reflect.deleteProperty(globalThis, 'document');
    }
  });

  linkTo('https://example.com');
  linkTo('https://example.com', {});
  linkTo('https://example.com', { _blank: true });
  linkTo('https://example.com', { nofollow: true });

  assert.deepEqual(clicks, [
    { target: '_blank', rel: 'noopener noreferrer', attached: true },
    { target: '', rel: '', attached: true },
    { target: '_blank', rel: '', attached: true },
    { target: '', rel: 'noopener noreferrer', attached: true }
  ]);
});
