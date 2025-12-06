import { cloudflareDevProxyVitePlugin as remixCloudflareDevProxy, vitePlugin as remixVitePlugin } from '@remix-run/dev';
import UnoCSS from 'unocss/vite';
import { defineConfig, type ViteDevServer } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { optimizeCssModules } from 'vite-plugin-optimize-css-modules';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path'; // Import path module to resolve directory paths

export default defineConfig((config) => {
  return {
    resolve: {
      alias: {
        // Define alias for '~' to point to the 'app' directory
        '~': path.resolve(__dirname, 'app'),
      },
    },
    build: {
      // Set build target to ESNext for modern JavaScript support
      target: 'esnext',
    },
    plugins: [
      // Add Node.js polyfills for certain modules
      nodePolyfills({
        include: ['path', 'buffer'],
      }),
      // Add Remix plugin for Cloudflare proxy during development
      config.mode !== 'test' && remixCloudflareDevProxy(),
      // Add Remix plugin with future flags enabled
      remixVitePlugin({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
        },
      }),
      // Add UnoCSS plugin for utility-first CSS
      UnoCSS(),
      // Add plugin to resolve paths from tsconfig.json
      tsconfigPaths(),
      // Add plugin to fix issues with Chrome version 129
      chrome129IssuePlugin(),
      // Add CSS Modules optimization plugin for production builds
      config.mode === 'production' && optimizeCssModules({ apply: 'build' }),
    ],
    envPrefix: [
      // Define environment variables prefixes to be used
      "VITE_",
      "OPENAI_LIKE_API_",
      "OLLAMA_API_BASE_URL",
      "LMSTUDIO_API_BASE_URL",
    ],
    css: {
      // Configure SCSS preprocessing options
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  };
});

// Define a custom plugin to handle issues with Chrome version 129
function chrome129IssuePlugin() {
  return {
    name: 'chrome129IssuePlugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        // Extract Chrome version from user-agent
        const raw = req.headers['user-agent']?.match(/Chrom(e|ium)\/([0-9]+)\./);

        if (raw) {
          const version = parseInt(raw[2], 10);

          if (version === 129) {
            // Respond with an error message for Chrome version 129
            res.setHeader('content-type', 'text/html');
            res.end(
              '<body><h1>Please use Chrome Canary for testing.</h1><p>Chrome 129 has an issue with JavaScript modules & Vite local development, see <a href="https://github.com/stackblitz/bolt.new/issues/86#issuecomment-2395519258">for more information.</a></p><p><b>Note:</b> This only impacts <u>local development</u>. `pnpm run build` and `pnpm run start` will work fine in this browser.</p></body>',
            );
            return;
          }
        }

        // Continue to the next middleware if no issues
        next();
      });
    },
  };
}
