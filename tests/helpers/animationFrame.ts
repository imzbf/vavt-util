import type { TestContext } from 'node:test';

/** 用可手动推进的帧队列验证重入与取消，避免依赖真实动画耗时。 */
export const mockAnimationFrame = (t: TestContext) => {
  const callbacks = new Map<number, FrameRequestCallback>();
  let nextId = 0;

  const replacements = {
    requestAnimationFrame(callback: FrameRequestCallback) {
      callbacks.set(++nextId, callback);
      return nextId;
    },
    cancelAnimationFrame(id: number) {
      callbacks.delete(id);
    }
  };

  for (const [key, value] of Object.entries(replacements)) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    t.after(() => {
      if (original) {
        Object.defineProperty(globalThis, key, original);
      } else {
        Reflect.deleteProperty(globalThis, key);
      }
    });
  }

  return {
    get size() {
      return callbacks.size;
    },
    step(timeStamp: number) {
      // 本帧新注册的回调要等下一帧；已被其他回调取消的任务不再执行。
      for (const id of [...callbacks.keys()]) {
        const callback = callbacks.get(id);
        callbacks.delete(id);
        callback?.(timeStamp);
      }
    }
  };
};
