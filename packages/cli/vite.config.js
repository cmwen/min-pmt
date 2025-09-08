import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Build for Node.js
    target: 'node18',

    // Output configuration
    outDir: 'dist',
    emptyOutDir: false, // Don't clear TypeScript outputs

    // Build as a single file
    rollupOptions: {
      input: resolve(__dirname, 'src/cli-bundled.ts'),
      output: {
        entryFileNames: 'cli-bundled.js',
        format: 'es',
      },
      external: (id) => {
        // External Node.js built-ins (with or without node: prefix)
        const builtins = [
          'fs',
          'path',
          'url',
          'process',
          'os',
          'util',
          'child_process',
          'events',
          'stream',
          'buffer',
          'crypto',
          'http',
          'https',
          'net',
          'tls',
          'zlib',
          'readline',
          'module',
          'cluster',
          'worker_threads',
          'querystring',
          'async_hooks',
          'string_decoder',
        ];

        // Check if it's a Node.js built-in
        if (builtins.includes(id) || builtins.some((builtin) => id === `node:${builtin}`)) {
          return true;
        }

        // Keep commander as external
        if (id === 'commander') {
          return true;
        }

        return false;
      },
    },

    // Don't minify for better debugging
    minify: false,

    // Generate source maps
    sourcemap: true,
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@cmwen/min-pmt-core': resolve(__dirname, '../core/src'),
      '@cmwen/min-pmt-web': resolve(__dirname, '../web/src'),
    },
  },

  // Define for replacing process.env etc
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});
