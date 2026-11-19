import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  types: string;
};
const consumer = `
import {
  debounce, throttle, searchToObj, objToSearch, deepClone, deepMerge,
  objectSort, isNumber, getRootOffset, draggingScroll, createSmoothScroll,
  smoothScroll, isMobile, linkTo, download, randomId, isPrimitive
} from '@vavt/util';

// 2.x 的显式泛型表示参数元素类型。
const debounced: (...args: number[]) => Promise<unknown> = debounce<number, void>((n) => {});
const throttled: (...args: number[]) => void = throttle<number, void>((n) => {});
debounced(1, 2);
throttled(1, 2);

interface Query { name: string; list: number[]; empty?: null; }
declare const query: Query;
objToSearch(query);
objToSearch(null);
objToSearch(undefined);
objToSearch(1);
objToSearch(['a']);

// 既有调用方可直接为查询结果字段指定业务类型。
const parsed = searchToObj('?name=a&list=1&list=2');
const name: string = parsed.name;
const list: string[] = parsed.list;
parsed.extra = 1;

const sorted: Array<{ value: number }> = objectSort([{ value: 1 }], item => item.value);
const cloned: { value: number } = deepClone(sorted[0]);
const merged: { a: number; b: string } = deepMerge({ a: 1 }, { b: '2' });
`;

const modes = [
  ['NodeNext', ts.ModuleKind.NodeNext, ts.ModuleResolutionKind.NodeNext],
  ['Node16', ts.ModuleKind.Node16, ts.ModuleResolutionKind.Node16],
  ['Bundler', ts.ModuleKind.Preserve, ts.ModuleResolutionKind.Bundler]
] as const;

for (const [name, module, moduleResolution] of modes) {
  for (const extension of ['mts', 'cts']) {
    test(`published declarations accept legacy ${extension} consumers with ${name}`, () => {
      const fileName = path.join(root, 'tests', `consumer.${extension}`);
      const options: ts.CompilerOptions = {
        target: ts.ScriptTarget.ES2022,
        module,
        moduleResolution,
        strict: true,
        noEmit: true,
        skipLibCheck: false,
        types: [],
        baseUrl: root,
        // 按 package.json 声明的类型入口读取构建产物，避免依赖本地自引用包解析。
        paths: { '@vavt/util': [manifest.types] }
      };
      const host = ts.createCompilerHost(options);
      const originalGetSourceFile = host.getSourceFile;
      host.getSourceFile = (file, languageVersion, onError, shouldCreateNewSourceFile) => {
        if (file === fileName) {
          return ts.createSourceFile(file, consumer, languageVersion, true);
        }
        return originalGetSourceFile(file, languageVersion, onError, shouldCreateNewSourceFile);
      };

      // 虚拟消费者无需写入项目；声明和依赖解析仍使用真实文件系统。
      const program = ts.createProgram([fileName], options, host);
      const diagnostics = ts.getPreEmitDiagnostics(program);
      assert.equal(
        diagnostics.length,
        0,
        ts.formatDiagnostics(diagnostics, {
          getCanonicalFileName: (file) => file,
          getCurrentDirectory: () => root,
          getNewLine: () => '\n'
        })
      );
    });
  }
}
