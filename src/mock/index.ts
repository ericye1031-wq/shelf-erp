/**
 * MSW (Mock Service Worker) 开发环境设置
 * 在浏览器 network 层拦截 API 请求，返回 mock 数据
 * 兼容 axios (XHR) 和 fetch
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
