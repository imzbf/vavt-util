import path from 'path';
import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { build } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const resolvePath = (p: string) => path.resolve(__dirname, p);

const moduleEntry = {
  index: resolvePath('../packages')
};

await build({
  base: '/',
  build: {
    emptyOutDir: true,
    cssCodeSplit: true,
    outDir: resolvePath('../lib'),
    lib: {
      entry: moduleEntry,
      name: 'VavtUtil',
      formats: ['es', 'cjs', 'umd'],
      fileName(format) {
        switch (format) {
          case 'es': {
            return 'es/[name].mjs';
          }
          case 'cjs': {
            return 'cjs/[name].cjs';
          }
          default: {
            return 'umd/index.js';
          }
        }
      }
    }
  }
});

// 根 package.json 声明了 "type": "module"，Node 会把 lib/umd/index.js 当 ESM 解析，
// UMD 工厂函数不会执行。写一个目录级 package.json 把该目录还原为 CommonJS。
await writeFile(
  resolvePath('../lib/umd/package.json'),
  `${JSON.stringify({ type: 'commonjs' }, null, 2)}\n`
);
