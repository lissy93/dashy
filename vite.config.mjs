import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import svgLoader from 'vite-svg-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, copyFileSync, existsSync, readdirSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'));
const userDataDir = path.resolve(__dirname, process.env.USER_DATA_DIR || 'user-data');

function serveUserData() {
  return {
    name: 'serve-user-data',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        const filePath = path.join(userDataDir, req.url.split('?')[0]);
        try {
          const content = readFileSync(filePath);
          const ext = path.extname(filePath);
          const types = { '.yml': 'text/yaml', '.yaml': 'text/yaml', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
          res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
          res.end(content);
        } catch {
          next();
        }
      });
    },
  };
}

function copyUserDataConfig() {
  return {
    name: 'copy-user-data-config',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist');
      if (!existsSync(userDataDir)) return;
      const ymlFiles = readdirSync(userDataDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
      for (const file of ymlFiles) {
        const src = path.join(userDataDir, file);
        const dest = path.join(outDir, file);
        copyFileSync(src, dest);
      }
    },
  };
}

export default defineConfig({
  envPrefix: ['VITE_', 'DASHY_'],
  plugins: [
    vue(),
    svgLoader(),
    serveUserData(),
    copyUserDataConfig(),
    VitePWA({
      registerType: 'prompt',
      useCredentials: true,
      manifest: {
        name: 'Dashy',
        theme_color: '#00af87',
        background_color: '#0b1021',
        icons: [
          { src: '/web-icons/favicon-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: '/web-icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
          { src: '/web-icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
          { src: '/web-icons/dashy-logo.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/(status-check|ping-check|system-info|cors-proxy|get-user|config-manager)\b/,
        ],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        globIgnores: [
          '**/*.map',
          '**/manifest*.js',
          '**/.nojekyll',
          '**/.gitignore',
          '**/*.yml',
          '**/*.yaml',
        ],
        runtimeCaching: [
          {
            urlPattern: /\.ya?ml(\?.*)?$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'dashy-config',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: /\/(status-check|system-info|cors-proxy|get-user|config-manager)\b/,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],

  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
  },

  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import', 'legacy-js-api'],
      },
    },
  },

  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 7000,
  },

  server: {
    port: 8080,
  },
});
