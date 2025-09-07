import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  root: 'src/client',
  build: {
    outDir: '../../dist/public',
    emptyOutDir: true,
  }
});