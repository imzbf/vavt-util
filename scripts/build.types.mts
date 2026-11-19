import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

execFileSync(
  process.execPath,
  [
    fileURLToPath(import.meta.resolve('typescript/bin/tsc')),
    '-p',
    fileURLToPath(new URL('../tsconfig.build.json', import.meta.url))
  ],
  { stdio: 'inherit' }
);

// 工具链使用 ESM，发布的声明仍遵循 2.x 的 CommonJS 解析规则，兼容 Node16/NodeNext 消费方。
await writeFile(
  new URL('../lib/types/package.json', import.meta.url),
  `${JSON.stringify({ type: 'commonjs' }, null, 2)}\n`
);
