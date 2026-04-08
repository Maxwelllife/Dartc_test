import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    open: false,
  },
  preview: {
    host: true,
  },
  build: {
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
  },
});
