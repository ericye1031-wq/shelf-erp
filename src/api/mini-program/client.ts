/**
 * 微信小程序 API 客户端实现
 * ===========================
 *
 * 基于 axios 封装，提供：
 * - 微信登录认证（wxLogin）
 * - Token 管理与自动刷新
 * - 各业务模块 API 调用（客户、报价、合同、项目、生产、仓储）
 * - 离线缓存支持
 * - 请求重试机制
 *
 * 使用方式：
 *   import { mpClient } from '@/api/mini-program';
 *   await mpClient.auth.wxLogin(code);
 *   const customers = await mpClient.customer.getCustomers({ page: 1, pageSize: 20 });
 */

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import {
  MINI_PROGRAM_API,
  type ApiResponse,
  type WxLoginResponse,
  type MiniUser,
  type PagedRequest,
  type PagedResponse,
} from './types';

// ============================================================
// 离线缓存管理
// ============================================================

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number; // 过期时间（毫秒）
}

class OfflineCache {
  private cache = new Map<string, CacheEntry>();
  private readonly prefix = 'mp_cache_';

  /** 设置缓存 */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl };
    this.cache.set(key, entry);

    // 持久化到 localStorage（H5环境）
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(entry));
      } catch {
        // 存储空间不足时忽略
      }
    }
  }

  /** 获取缓存 */
  get<T>(key: string): T | null {
    // 先查内存
    let entry = this.cache.get(key) as CacheEntry<T> | undefined;

    // 内存中没有，尝试从 localStorage 恢复
    if (!entry && typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(`${this.prefix}${key}`);
        if (stored) {
          entry = JSON.parse(stored) as CacheEntry<T>;
          this.cache.set(key, entry);
        }
      } catch {
        return null;
      }
    }

    if (!entry) return null;

    // 检查是否过期
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }

    return entry.data;
  }

  /** 删除缓存 */
  delete(key: string): void {
    this.cache.delete(key);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(`${this.prefix}${key}`);
      } catch {
        // ignore
      }
    }
  }

  /** 清空所有缓存 */
  clear(): void {
    this.cache.clear();
    if (typeof localStorage !== 'undefined') {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(this.prefix));
      keys.forEach((k) => localStorage.removeItem(k));
    }
  }

  /** 获取所有缓存键（用于离线同步） */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }
}

// ============================================================
// Token 管理器
// ============================================================

class TokenManager {
  private token: string | null = null;
  private expiresAt: number = 0;
  private readonly storageKey = 'mp_auth_token';
  private readonly expiryKey = 'mp_auth_expiry';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem(this.storageKey);
      const expiry = localStorage.getItem(this.expiryKey);
      this.expiresAt = expiry ? Number(expiry) : 0;
    }
  }

  setToken(token: string, expiresAt: number): void {
    this.token = token;
    this.expiresAt = expiresAt;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, token);
      localStorage.setItem(this.expiryKey, String(expiresAt));
    }
  }

  getToken(): string | null {
    return this.token;
  }

  isExpired(): boolean {
    // 提前 60 秒认为过期，避免请求时刚好过期
    return Date.now() / 1000 >= this.expiresAt - 60;
  }

  isAuthenticated(): boolean {
    return !!this.token && !this.isExpired();
  }

  clear(): void {
    this.token = null;
    this.expiresAt = 0;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.expiryKey);
    }
  }
}

// ============================================================
// 微信小程序 API 客户端
// ============================================================

export class MiniProgramClient {
  private axiosInstance: AxiosInstance;
  private tokenManager: TokenManager;
  private cache: OfflineCache;
  private currentUser: MiniUser | null = null;
  private refreshPromise: Promise<string | null> | null = null;
  private maxRetries: number = 2;
  private retryDelay: number = 1000;

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL || '') {
    this.tokenManager = new TokenManager();
    this.cache = new OfflineCache();

    this.axiosInstance = axios.create({
      baseURL,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.setupInterceptors();
  }

  // ============================================================
  // Axios 拦截器
  // ============================================================

  private setupInterceptors(): void {
    // 请求拦截：自动携带 token
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.tokenManager.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // 响应拦截：解包 ApiResponse、自动刷新 token、重试
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // 解包 ApiResponse 信封
        if (response.data && typeof response.data === 'object' && 'code' in response.data) {
          const apiResp = response.data as ApiResponse;
          if (apiResp.code !== 0) {
            // 业务错误
            return Promise.reject(new Error(apiResp.message || 'API返回错误'));
          }
          // 将 data 提取到 response.data
          response.data = apiResp.data as any;
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _retryCount?: number };

        // 401 未授权：尝试刷新 token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const newToken = await this.refreshToken();
          if (newToken) {
            originalRequest.headers!.Authorization = `Bearer ${newToken}`;
            return this.axiosInstance(originalRequest);
          } else {
            this.tokenManager.clear();
            return Promise.reject(new Error('登录已过期，请重新登录'));
          }
        }

        // 网络错误：自动重试
        if (!error.response && originalRequest) {
          const retryCount = originalRequest._retryCount || 0;
          if (retryCount < this.maxRetries) {
            originalRequest._retryCount = retryCount + 1;
            await new Promise((resolve) => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
            return this.axiosInstance(originalRequest);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  // ============================================================
  // Token 自动刷新
  // ============================================================

  private async refreshToken(): Promise<string | null> {
    // 避免并发刷新
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await this.axiosInstance.post<unknown, AxiosResponse<{ token: string; expiresAt: number }>>(
          MINI_PROGRAM_API.REFRESH_TOKEN,
          { token: this.tokenManager.getToken() },
        );
        const { token, expiresAt } = response.data;
        this.tokenManager.setToken(token, expiresAt);
        return token;
      } catch {
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // ============================================================
  // 通用请求方法
  // ============================================================

  private async request<T>(method: string, path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.request<T, AxiosResponse<T>>({
      method,
      url: path,
      data: method !== 'GET' ? data : undefined,
      params: method === 'GET' ? data : undefined,
      ...config,
    });
    return response.data;
  }

  /** 替换路径参数 */
  private buildPath(path: string, params: Record<string, string | number>): string {
    let result = path;
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(`:${key}`, String(value));
    }
    return result;
  }

  /** 带缓存的请求 */
  private async cachedRequest<T>(
    cacheKey: string,
    method: string,
    path: string,
    data?: unknown,
    ttl: number = 5 * 60 * 1000,
  ): Promise<T> {
    const cached = this.cache.get<T>(cacheKey);
    if (cached) return cached;

    const result = await this.request<T>(method, path, data);
    this.cache.set(cacheKey, result, ttl);
    return result;
  }

  // ============================================================
  // 认证模块
  // ============================================================

  auth = {
    /** 微信登录 */
    wxLogin: async (code: string): Promise<WxLoginResponse> => {
      const result = await this.request<WxLoginResponse>('POST', MINI_PROGRAM_API.WX_LOGIN, { code });
      this.tokenManager.setToken(result.token, result.expiresAt);
      this.currentUser = result.user;
      this.cache.clear(); // 登录后清空旧缓存
      return result;
    },

    /** 刷新 token */
    refreshToken: async (): Promise<string | null> => {
      return this.refreshToken();
    },

    /** 验证 token 有效性 */
    verifyToken: async (): Promise<boolean> => {
      try {
        await this.request<{ valid: boolean }>('GET', MINI_PROGRAM_API.VERIFY_TOKEN);
        return true;
      } catch {
        return false;
      }
    },

    /** 退出登录 */
    logout: async (): Promise<void> => {
      this.tokenManager.clear();
      this.currentUser = null;
      this.cache.clear();
    },

    /** 获取当前用户 */
    getCurrentUser: (): MiniUser | null => {
      return this.currentUser;
    },

    /** 是否已认证 */
    isAuthenticated: (): boolean => {
      return this.tokenManager.isAuthenticated();
    },
  };

  // ============================================================
  // 客户模块 (M02)
  // ============================================================

  customer = {
    /** 获取客户列表（分页，支持缓存） */
    getCustomers: async (params: PagedRequest): Promise<PagedResponse<unknown>> => {
      const cacheKey = `customers_${params.page}_${params.pageSize}_${params.keyword || ''}_${params.since || ''}`;
      return this.cachedRequest(cacheKey, 'GET', MINI_PROGRAM_API.CUSTOMER_LIST, params);
    },

    /** 获取客户详情 */
    getCustomerDetail: async (id: string): Promise<unknown> => {
      const path = this.buildPath(MINI_PROGRAM_API.CUSTOMER_DETAIL, { id });
      return this.cachedRequest(`customer_${id}`, 'GET', path);
    },

    /** 新建客户 */
    createCustomer: async (data: Record<string, unknown>): Promise<unknown> => {
      const result = await this.request<unknown>('POST', MINI_PROGRAM_API.CREATE_CUSTOMER, data);
      this.cache.delete('customers_1_20__'); // 清除列表缓存
      return result;
    },
  };

  // ============================================================
  // 报价模块 (M05)
  // ============================================================

  quotation = {
    /** 获取报价列表 */
    getQuotations: async (params: PagedRequest): Promise<PagedResponse<unknown>> => {
      const cacheKey = `quotations_${params.page}_${params.pageSize}_${params.keyword || ''}`;
      return this.cachedRequest(cacheKey, 'GET', MINI_PROGRAM_API.QUOTATION_LIST, params, 2 * 60 * 1000);
    },

    /** 获取报价详情（含BOM明细） */
    getQuotationDetail: async (id: string): Promise<unknown> => {
      const path = this.buildPath(MINI_PROGRAM_API.QUOTATION_DETAIL, { id });
      return this.cachedRequest(`quotation_${id}`, 'GET', path, undefined, 10 * 60 * 1000);
    },

    /** 获取BOM计算结果 */
    getBomResult: async (configId: string): Promise<unknown> => {
      const path = this.buildPath(MINI_PROGRAM_API.BOM_RESULT, { configId });
      return this.cachedRequest(`bom_${configId}`, 'GET', path, undefined, 30 * 60 * 1000);
    },

    /** 提交报价审批 */
    submitQuotation: async (id: string): Promise<unknown> => {
      const path = this.buildPath(MINI_PROGRAM_API.SUBMIT_QUOTATION, { id });
      const result = await this.request<unknown>('POST', path);
      this.cache.delete(`quotation_${id}`);
      return result;
    },
  };

  // ============================================================
  // 项目模块 (M07)
  // ============================================================

  project = {
    /** 获取项目列表 */
    getProjects: async (params: PagedRequest): Promise<PagedResponse<unknown>> => {
      const cacheKey = `projects_${params.page}_${params.pageSize}`;
      return this.cachedRequest(cacheKey, 'GET', MINI_PROGRAM_API.PROJECT_LIST, params);
    },

    /** 获取项目详情 */
    getProjectDetail: async (id: string): Promise<unknown> => {
      const path = this.buildPath(MINI_PROGRAM_API.PROJECT_DETAIL, { id });
      return this.cachedRequest(`project_${id}`, 'GET', path);
    },

    /** 获取项目进度概览 */
    getProjectProgress: async (id: string): Promise<unknown> => {
      const path = this.buildPath(MINI_PROGRAM_API.PROJECT_PROGRESS, { id });
      return this.cachedRequest(`project_progress_${id}`, 'GET', path);
    },

    /** 获取项目预警列表 */
    getProjectAlerts: async (id: string): Promise<unknown> => {
      const path = this.buildPath(MINI_PROGRAM_API.PROJECT_ALERTS, { id });
      return this.request<unknown>('GET', path); // 预警不缓存
    },
  };

  // ============================================================
  // 生产模块 (M10 - 扫码报工)
  // ============================================================

  production = {
    /** 获取工单列表 */
    getWorkOrders: async (params: PagedRequest): Promise<PagedResponse<unknown>> => {
      return this.request<PagedResponse<unknown>>('GET', MINI_PROGRAM_API.WORK_ORDER_LIST, params);
    },

    /** 获取工单详情 */
    getWorkOrderDetail: async (id: string): Promise<unknown> => {
      const path = this.buildPath(MINI_PROGRAM_API.WORK_ORDER_DETAIL, { id });
      return this.request<unknown>('GET', path);
    },

    /** 扫码开始工序 */
    startProcess: async (woId: string, psId: string, data?: { startedAt?: string; remark?: string }): Promise<unknown> => {
      const path = this.buildPath(MINI_PROGRAM_API.START_PROCESS, { woId, psId });
      return this.request<unknown>('POST', path, data);
    },

    /** 扫码完成工序 */
    completeProcess: async (
      woId: string,
      psId: string,
      data?: { completedAt?: string; actualMinutes?: number; remark?: string; photoIds?: string[] },
    ): Promise<unknown> => {
      const path = this.buildPath(MINI_PROGRAM_API.COMPLETE_PROCESS, { woId, psId });
      return this.request<unknown>('POST', path, data);
    },

    /** 上传工序照片 */
    uploadProcessPhoto: async (woId: string, photoData: FormData): Promise<unknown> => {
      const path = this.buildPath(MINI_PROGRAM_API.UPLOAD_PROCESS_PHOTO, { woId });
      return this.request<unknown>('POST', path, photoData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  };

  // ============================================================
  // 仓储模块 (M11 - 扫码出入库)
  // ============================================================

  warehouse = {
    /** 查询库存 */
    queryInventory: async (params: { keyword?: string; warehouseId?: string }): Promise<unknown> => {
      return this.cachedRequest(
        `inventory_${params.keyword || ''}_${params.warehouseId || ''}`,
        'GET',
        MINI_PROGRAM_API.INVENTORY_QUERY,
        params,
        60 * 1000, // 库存缓存1分钟
      );
    },

    /** 扫码入库 */
    inboundScan: async (data: {
      barcode: string;
      quantity: number;
      batchNo?: string;
      refOrderId?: string;
      remark?: string;
    }): Promise<unknown> => {
      const result = await this.request<unknown>('POST', MINI_PROGRAM_API.INBOUND_SCAN, data);
      this.cache.delete('inventory__'); // 清除库存缓存
      return result;
    },

    /** 扫码出库 */
    outboundScan: async (data: {
      barcode: string;
      quantity: number;
      batchNo?: string;
      refOrderId?: string;
      remark?: string;
    }): Promise<unknown> => {
      const result = await this.request<unknown>('POST', MINI_PROGRAM_API.OUTBOUND_SCAN, data);
      this.cache.delete('inventory__');
      return result;
    },

    /** 获取低库存预警 */
    getLowStockAlerts: async (): Promise<unknown> => {
      return this.request<unknown>('GET', MINI_PROGRAM_API.LOW_STOCK_ALERTS);
    },
  };

  // ============================================================
  // 数据同步模块
  // ============================================================

  sync = {
    /** 增量同步：拉取变更数据 */
    getChanges: async (since: number): Promise<unknown> => {
      return this.request<unknown>('GET', MINI_PROGRAM_API.SYNC_CHANGES, { since });
    },

    /** 上传本地离线数据 */
    uploadOfflineData: async (data: Record<string, unknown[]>): Promise<unknown> => {
      const result = await this.request<unknown>('POST', MINI_PROGRAM_API.SYNC_UPLOAD, data);
      this.cache.clear();
      return result;
    },

    /** 获取数据版本号 */
    getSyncVersion: async (): Promise<number> => {
      const result = await this.request<{ version: number }>('GET', MINI_PROGRAM_API.SYNC_VERSION);
      return result.version;
    },
  };

  // ============================================================
  // 消息通知模块
  // ============================================================

  message = {
    /** 获取未读消息数 */
    getUnreadCount: async (): Promise<number> => {
      const result = await this.request<{ count: number }>('GET', MINI_PROGRAM_API.UNREAD_COUNT);
      return result.count;
    },

    /** 获取消息列表 */
    getMessages: async (params: PagedRequest): Promise<PagedResponse<unknown>> => {
      return this.request<PagedResponse<unknown>>('GET', MINI_PROGRAM_API.MESSAGE_LIST, params);
    },

    /** 标记消息已读 */
    markRead: async (id: string): Promise<unknown> => {
      const path = this.buildPath(MINI_PROGRAM_API.MARK_READ, { id });
      return this.request<unknown>('POST', path);
    },
  };

  // ============================================================
  // 缓存管理
  // ============================================================

  /** 获取缓存实例 */
  getCache(): OfflineCache {
    return this.cache;
  }

  /** 清除所有缓存 */
  clearCache(): void {
    this.cache.clear();
  }
}

// ============================================================
// 导出全局实例
// ============================================================

export const mpClient = new MiniProgramClient();

// 导出类型
export type { OfflineCache, TokenManager };
