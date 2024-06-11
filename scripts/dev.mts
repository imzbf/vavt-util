import path from 'path';
import { createServer } from 'vite';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('..', import.meta.url));
const resolvePath = (p: string) => path.resolve(__dirname, p);

!(async () => {
  const server = await createServer({
    base: '/',
    server: {
      host: '0.0.0.0',
      port: 6102
    },
    resolve: {
      alias: {
        '@': resolvePath('dev'),
        '~': resolvePath('packages')
      }
    },
    plugins: []
  });

  await server.listen();

  server.printUrls();
})();
