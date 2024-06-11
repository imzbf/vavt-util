import path from 'path';
import { fileURLToPath } from 'url';
import { build } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const resolvePath = (p: string) => path.resolve(__dirname, p);

!(async () => {
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
})();
