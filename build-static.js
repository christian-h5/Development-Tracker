#!/usr/bin/env node

import { build } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Build the static version
async function buildStatic() {
  try {
    console.log('Building static version...');
    
    await build({
      root: path.resolve(__dirname, 'client'),
      build: {
        outDir: path.resolve(__dirname, 'dist'),
        emptyOutDir: true,
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs'],
              'utils': ['date-fns', 'clsx', 'tailwind-merge']
            }
          }
        }
      },
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "client", "src"),
          "@shared": path.resolve(__dirname, "shared"),
          "@assets": path.resolve(__dirname, "attached_assets"),
        },
      },
    });
    
    console.log('Static build completed successfully!');
    console.log('Files are in the dist/ directory');
    console.log('');
    console.log('To serve locally: npx serve dist');
    console.log('To deploy: Upload the dist/ directory to your static hosting provider');
    
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildStatic();