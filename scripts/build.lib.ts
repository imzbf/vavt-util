import path from 'path';
import { fileURLToPath } from 'url';
import { build, LibraryFormats } from 'vite';
import dts from 'vite-plugin-dts';

import { removeDir } from './u';

const __dirname = fileURLToPath(new URL('..', import.meta.url));
const resolvePath = (p: string) => path.resolve(__dirname, p);

const defaultFormats: LibraryFormats[] = ['es', 'cjs', 'umd'];

const argvs = process.argv.slice(2);

// 是否构建时不区别版本，均构建类型
const forceBuildType = argvs.indexOf('type') !== -1;

// 构建目标版本列表
let formats = argvs.filter((i: LibraryFormats) =>
  defaultFormats.includes(i)
) as LibraryFormats[];

// 没有指定就打包全部
formats = formats.length === 0 ? defaultFormats : formats;

!(async () => {
  const moduleEntry = {
    index: resolvePath('packages'),
  };

  const entries = {
    es: moduleEntry,
    cjs: moduleEntry,
    umd: resolvePath('packages'),
  };

  const extnames = {
    es: 'mjs',
    cjs: 'cjs',
  };

  removeDir(resolvePath('lib'));

  await Promise.all(
    formats.map((t) => {
      return build({
        base: '/',
        publicDir: false,
        resolve: {
          alias: {
            '~': resolvePath('packages'),
          },
        },
        plugins: [
          (t === 'es' || forceBuildType) &&
            dts({
              outputDir: resolvePath('lib/types'),
              include: [resolvePath('packages')],
            }),
        ],
        css: {
          modules: {
            localsConvention: 'camelCase', // 默认只支持驼峰，修改为同事支持横线和驼峰
          },
          preprocessorOptions: {
            less: {
              javascriptEnabled: true,
            },
          },
        },
        build: {
          emptyOutDir: false,
          cssCodeSplit: true,
          outDir: resolvePath('lib'),
          lib: {
            entry: entries[t],
            name: 'VavtUtil',
            formats: [t],
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
            },
          },
          rollupOptions: {
            // umd可能不需要移除部分依赖库
            external: t === 'umd' ? [] : [],
            output: {
              chunkFileNames: `${t}/chunks/[hash].${extnames[t]}`,
              assetFileNames: '[name][extname]',
              globals: t === 'umd' ? {} : {},
            },
          },
        },
      });
    })
  );
})();
