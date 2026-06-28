/**
 * 微信小程序 API 接口层 — 统一导出
 * =================================
 *
 * 使用方式：
 *   import { mpClient, type MiniUser } from '@/api/mini-program';
 *   await mpClient.auth.wxLogin(code);
 *   const customers = await mpClient.customer.getCustomers({ page: 1, pageSize: 20 });
 */

// 类型定义
export * from './types';

// API 客户端
export { MiniProgramClient, mpClient, type OfflineCache, type TokenManager } from './client';

// 后端规范文档（仅注释，不导出运行时值）
// 详见 ./backend-spec.md
