import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/shelf-erp/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // 转发 /api/* 到 mock 服务器 (3000)
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // 转发 /shelf-erp/api/* 到 mock 服务器 (3000)，并去掉 /shelf-erp 前缀
      '/shelf-erp/api': {
        target: 'http://localhost:3000',
        rewrite: (path) => path.replace(/^\/shelf-erp/, ''),
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
