import {resolve} from 'node:path';
import {defineConfig} from 'vite';

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
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                home: resolve(__dirname, 'home/index.html'),
                electronics: resolve(__dirname, 'electronics/index.html'),
                smartphones: resolve(__dirname, 'smartphones/index.html'),
                android: resolve(__dirname, 'android/index.html'),
                premium: resolve(__dirname, 'premium/index.html'),
                featuredProduct: resolve(__dirname, 'featured-product/index.html'),
                checkout: resolve(__dirname, 'checkout/index.html'),
            },
        },
    },
});
