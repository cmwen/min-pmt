#!/usr/bin/env node

/**
 * Bundle CLI using esbuild - simple and reliable
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function bundleCLI() {
  console.log('🚀 Bundling CLI with esbuild...\n');

  try {
    await build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm', // Use ESM to keep import.meta.url working
      outfile: 'dist/bundled.js',
      external: ['commander', 'gray-matter'], // Keep these as external dependencies
      minify: false, // Keep readable for debugging
      sourcemap: false,
    });

    // Add shebang manually after build
    const bundledContent = fs.readFileSync('dist/bundled.js', 'utf8');
    // Remove any existing shebangs first
    const cleanContent = bundledContent.replace(/^#!.*\n/gm, '');
    const contentWithShebang = `#!/usr/bin/env node\n${cleanContent}`;
    fs.writeFileSync('dist/bundled.js', contentWithShebang);

    // Make the output executable
    fs.chmodSync('dist/bundled.js', '755');

    console.log('✅ CLI bundled successfully!');
    console.log('📦 Output: dist/bundled.js');
    console.log('💡 This file contains all your packages bundled together');
    console.log('🎯 Dependencies: commander + gray-matter (will be installed from npm)');
  } catch (error) {
    console.error('❌ Bundle failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  bundleCLI();
}
