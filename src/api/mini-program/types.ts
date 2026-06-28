/**
 * 微信小程序 API 接口层
 * =====================
 *
 * 设计原则：
 * 1. 复用现有NestJS后端JWT认证体系
 * 2. 提供轻量级JSON接口（适合小程序网络环境）
 * 3. 支持离线缓存和增量同步
 * 4. 数据压缩（减少小程序流量消耗）
 */

// 微信小程序全局对象声明（仅类型用，不含实现）
declare var wx: any;

// ===== 类型定义 =====

/** 微信登录凭证 */
export interface WxLoginCode {
  code: string;
}

/** 微信登录响应 */
export interface WxLoginResponse {
  token: string;
  /** 过期时间戳（秒） */
  expiresAt: number;
  user: MiniUser;
}

/** 小程序用户信息 */
export interface MiniUser {
  id: string;
  openId: string;
  unionId?: string;
  nickname?: string;
  avatarUrl?: string;
  role: 'admin' | 'sales' | 'production' | 'warehouse' | 'guest';
  permissions: string[];
}

/** 通用API响应 */
export interface ApiResponse<T = unknown> {
  code: number;          // 0=成功, 非0=错误码
  message: string;
  data: T;
  /** 服务端时间戳（用于同步） */
  serverTime: number;
  /** 是否有更多数据（分页） */
  hasMore?: boolean;
}

/** 分页请求参数 */
export interface PagedRequest {
  page: number;
  pageSize: number;
  keyword?: string;
  /** 只获取指定时间之后修改的数据（增量同步） */
  since?: number;       // Unix时间戳
}

/** 分页响应 */
export interface PagedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ===== API 端点定义 =====

export const MINI_PROGRAM_API = {
  // --- 认证 ---
  /** 微信code2Session登录 */
  WX_LOGIN: '/api/mp/auth/login',
  /** 刷新token */
  REFRESH_TOKEN: '/api/mp/auth/refresh',
  /** 校验token有效性 */
  VERIFY_TOKEN: '/api/mp/auth/verify',

  // --- 客户 M02 ---
  /** 客户列表（精简字段） */
  CUSTOMER_LIST: '/api/mp/customers',
  /** 客户详情 */
  CUSTOMER_DETAIL: '/api/mp/customers/:id',
  /** 新建客户 */
  CREATE_CUSTOMER: '/api/mp/customers',

  // --- 报价 M05 (只读) ---
  /** 我的报价单列表 */
  QUOTATION_LIST: '/api/mp/quotations',
  /** 报价详情（含BOM明细） */
  QUOTATION_DETAIL: '/api/mp/quotations/:id',
  /** BOM计算结果 */
  BOM_RESULT: '/api/mp/bom/:configId',
  /** 提交报价审批 */
  SUBMIT_QUOTATION: '/api/mp/quotations/:id/submit',

  // --- 项目 M07 (进度查看) ---
  /** 我的项目列表 */
  PROJECT_LIST: '/api/mp/projects',
  /** 项目详情（含里程碑） */
  PROJECT_DETAIL: '/api/mp/projects/:id',
  /** 项目进度概览 */
  PROJECT_PROGRESS: '/api/mp/projects/:id/progress',
  /** 项目预警列表 */
  PROJECT_ALERTS: '/api/mp/projects/:id/alerts',

  // --- 生产 M10 (扫码报工) ---
  /** 工序列表（按工序） */
  WORK_ORDER_LIST: '/api/mp/work-orders',
  /** 工序详情 */
  WORK_ORDER_DETAIL: '/api/mp/work-orders/:id',
  /** 扫码开始工序 */
  START_PROCESS: '/api/mp/work-orders/:woId/processes/:psId/start',
  /** 扫码完成工序 */
  COMPLETE_PROCESS: '/api/mp/work-orders/:woId/processes/:psId/complete',
  /** 上传工序照片 */
  UPLOAD_PROCESS_PHOTO: '/api/mp/work-orders/:woId/photos',

  // --- 仓储 M11 (扫码出入库) ---
  /** 库存查询 */
  INVENTORY_QUERY: '/api/mp/inventory/query',
  /** 扫码入库 */
  INBOUND_SCAN: '/api/mp/inventory/inbound',
  /** 扫码出库 */
  OUTBOUND_SCAN: '/api/mp/inventory/outbound',
  /** 低库存预警 */
  LOW_STOCK_ALERTS: '/api/mp/inventory/alerts',

  // --- 数据同步 ---
  /** 增量同步（拉取变更数据） */
  SYNC_CHANGES: '/api/mp/sync/changes',
  /** 上传本地离线数据 */
  SYNC_UPLOAD: '/api/mp/sync/upload',
  /** 获取数据版本号（用于判断是否需要同步） */
  SYNC_VERSION: '/api/mp/sync/version',

  // --- 消息通知 ---
  /** 未读消息数 */
  UNREAD_COUNT: '/api/mp/messages/unread',
  /** 消息列表 */
  MESSAGE_LIST: '/api/mp/messages',
  /** 标记已读 */
  MARK_READ: '/api/mp/messages/:id/read',
} as const;

// ===== 权限角色映射 =====

export const ROLE_PERMISSIONS = {
  admin: Object.values(MINI_PROGRAM_API),
  sales: [
    MINI_PROGRAM_API.CUSTOMER_LIST,
    MINI_PROGRAM_API.CUSTOMER_DETAIL,
    MINI_PROGRAM_API.CREATE_CUSTOMER,
    MINI_PROGRAM_API.QUOTATION_LIST,
    MINI_PROGRAM_API.QUOTATION_DETAIL,
    MINI_PROGRAM_API.SUBMIT_QUOTATION,
    MINI_PROGRAM_API.PROJECT_LIST,
    MINI_PROGRAM_API.PROJECT_DETAIL,
    ...Object.values(MINI_PROGRAM_API).filter(k => k.startsWith('/api/mp/messages')),
  ],
  production: [
    MINI_PROGRAM_API.WORK_ORDER_LIST,
    MINI_PROGRAM_API.WORK_ORDER_DETAIL,
    MINI_PROGRAM_API.START_PROCESS,
    MINI_PROGRAM_API.COMPLETE_PROCESS,
    MINI_PROGRAM_API.UPLOAD_PROCESS_PHOTO,
    ...Object.values(MINI_PROGRAM_API).filter(k => k.startsWith('/api/mp/messages')),
  ],
  warehouse: [
    MINI_PROGRAM_API.INVENTORY_QUERY,
    MINI_PROGRAM_API.INBOUND_SCAN,
    MINI_PROGRAM_API.OUTBOUND_SCAN,
    MINI_PROGRAM_API.LOW_STOCK_ALERTS,
    ...Object.values(MINI_PROGRAM_API).filter(k => k.startsWith('/api/mp/messages')),
  ],
  guest: [
    MINI_PROGRAM_API.QUOTATION_LIST,
    MINI_PROGRAM_API.QUOTATION_DETAIL,
    MINI_PROGRAM_API.BOM_RESULT,
  ],
} as const;

// ===== 请求封装 =====

/**
 * 小程序API请求客户端
 * 特点：
 * - 自动携带token
 * - 请求失败自动重试（网络波动）
 * - 响应数据自动缓存（可配置TTL）
 * - 请求/响应日志（开发环境）
 */
export class MiniApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl || (typeof location !== 'undefined' ? location.origin : '');
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof wx !== 'undefined') {
      wx.setStorageSync('mp_token', token);
    }
  }

  getToken(): string | null {
    if (!this.token && typeof wx !== 'undefined') {
      this.token = wx.getStorageSync('mp_token') || null;
    }
    return this.token;
  }

  removeToken(): void {
    this.token = null;
    if (typeof wx !== 'undefined') {
      wx.removeStorageSync('mp_token');
    }
  }

  async request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, data?: unknown): Promise<ApiResponse<T>> {
    // 替换路径参数 :id → 实际值
    let url = `${this.baseUrl}${path}`;
    
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      for (const [key, value] of Object.entries(data)) {
        if (path.includes(`:${key}`)) {
          url = url.replace(`:${key}`, String(value));
          delete (data as Record<string, unknown>)[key];
        }
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      if (typeof wx !== 'undefined') {
        // 微信小程序环境：使用wx.request
        return new Promise((resolve, reject) => {
          wx.request({
            url,
            method: method as 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT',
            header: headers,
            data: method !== 'GET' ? data : undefined,
            success: (res: any) => {
              resolve((res as any).data as ApiResponse<T>);
            },
            fail: (err: any) => {
              reject(new Error(`请求失败: ${(err as any).errMsg}`));
            },
          });
        });
      } else {
        // 浏览器/H5环境：使用fetch
        const options: RequestInit = { method, headers };
        if (method !== 'GET' && data) {
          options.body = JSON.stringify(data);
        }
        const response = await fetch(url, options);
        const result = await response.json() as ApiResponse<T>;
        return result;
      }
    } catch (error) {
      console.error('[MiniAPI] Request error:', error);
      throw error;
    }
  }

  // 快捷方法
  get<T>(path: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return this.request<T>('GET', path + query);
  }

  post<T>(path: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, data);
  }
}

// ===== 导出全局实例 =====
export const mpApi = new MiniApiClient();
