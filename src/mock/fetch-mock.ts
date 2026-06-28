/**
 * 开发环境 Fetch Mock
 * 直接覆盖 window.fetch，拦截所有 /api/* 请求并返回 mock 数据
 * 比 MSW 和 axios adapter 拦截更可靠
 */

const MOCK_USER = {
  id: '1',
  username: 'admin',
  name: '管理员',
  orgId: 'org1',
  orgName: '默认组织',
  roles: ['super_admin'],
  permissions: ['*'],
};

// 标准响应格式 { code, data, message }
function ok(data: any) {
  return { code: 0, data, message: 'ok' };
}

function fail(status: number, code: number, message: string) {
  return { status, body: { code, data: null, message } };
}

// 模拟数据库
let customerId = 3;
let quotationId = 3;

const mockDB: Record<string, any[]> = {
  customers: [
    { id: '1', name: '测试客户A', contact: '张三', phone: '13800138000', email: 'a@test.com', level: 'A', status: 'active' },
    { id: '2', name: '测试客户B', contact: '李四', phone: '13900139000', email: 'b@test.com', level: 'B', status: 'active' },
  ],
  shelfTypes: [
    { id: '1', name: '横梁式货架', category: '横梁式', status: 'active' },
    { id: '2', name: '贯通式货架', category: '贯通式', status: 'active' },
  ],
  quotations: [
    { id: '1', code: 'QUO-2024-001', customerName: '测试客户A', totalAmount: 50000, status: 'draft' },
    { id: '2', code: 'QUO-2024-002', customerName: '测试客户B', totalAmount: 80000, status: 'submitted' },
  ],
};

// 路由处理
const routes: Record<string, (method: string, body: any, url: string) => any> = {
  // ========== POST /api/m01/auth/login ==========
  'POST:/api/m01/auth/login': (_, body) => {
    if (body.username === 'admin' && body.password === 'admin123') {
      return ok({
        accessToken: 'mock-jwt-token-xxxx',
        refreshToken: 'mock-refresh-token-xxxx',
        user: MOCK_USER,
      });
    }
    return fail(401, 401, '用户名或密码错误');
  },

  // ========== GET /api/m01/auth/me ==========
  'GET:/api/m01/auth/me': () => ok(MOCK_USER),

  // ========== GET /api/m01/users ==========
  'GET:/api/m01/users': () => ok([MOCK_USER]),

  // ========== GET /api/m02/customers ==========
  'GET:/api/m02/customers': () => ok(mockDB.customers),

  // ========== POST /api/m02/customers ==========
  'POST:/api/m02/customers': (_, body) => {
    const item = { ...body, id: String(customerId++) };
    mockDB.customers.push(item);
    return ok(item);
  },

  // ========== GET /api/m04/shelf-types ==========
  'GET:/api/m04/shelf-types': () => ok(mockDB.shelfTypes),

  'GET:/api/m04/configs': () => ok([{ id: '1', name: '标准横梁式-2.0', shelfTypeId: '1', status: 'active' }]),
  'GET:/api/m04/specifications': () => ok([{ id: '1', name: '2000×600×2000', shelfConfigId: '1', status: 'active' }]),

  // ========== GET /api/m05/quotations ==========
  'GET:/api/m05/quotations': () => ok(mockDB.quotations),

  'POST:/api/m05/quotations': (_, body) => {
    const item = { ...body, id: String(quotationId++), code: `QUO-2024-00${quotationId}` };
    mockDB.quotations.push(item);
    return ok(item);
  },

  'GET:/api/m05/currencies': () => ok([{ code: 'CNY', name: '人民币', rate: 1 }, { code: 'USD', name: '美元', rate: 7.2 }]),

  // ========== 其他模块 ==========
  'GET:/api/m06/contracts': () => ok([{ id: '1', code: 'HT-2024-001', customerName: '测试客户A', totalAmount: 50000, status: 'active' }]),
  'GET:/api/m07/projects': () => ok([{ id: '1', code: 'PJ-2024-001', name: '测试项目A', status: 'active' }]),
  'GET:/api/m10/work-orders': () => ok([{ id: '1', code: 'WO-2024-001', name: '生产工单A', status: 'pending' }]),
  'GET:/api/m11/warehouses': () => ok([{ id: '1', name: '主仓库', location: '车间A' }]),
  'GET:/api/m11/inventory': () => ok([{ id: '1', materialName: '钢材', quantity: 1000, warehouseName: '主仓库' }]),
};

// 覆盖 window.fetch
function installFetchMock() {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);
    const method = (init?.method || 'GET').toUpperCase();

    // 只拦截 /api/* 请求
    if (!url.includes('/api/')) {
      return originalFetch(input, init);
    }

    // 解析请求体
    let body: any = {};
    if (init?.body) {
      try { body = JSON.parse(init.body as string); } catch { /* ignore */ }
    }

    // 去掉 base URL 前缀（如 /shelf-erp），只保留 /api/... 部分
    const urlObj = new URL(url, window.location.origin);
    const pathname = urlObj.pathname; // e.g. /shelf-erp/api/m01/auth/login
    const apiPath = pathname.includes('/api/') 
      ? pathname.substring(pathname.indexOf('/api/')) 
      : pathname;
    const routeKey = `${method}:${apiPath.split('?')[0]}`;
    const handler = routes[routeKey];

    if (handler) {
      const result = handler(method, body, url);

      // 如果返回 fail 对象
      if (result && result.status && result.body) {
        return new Response(JSON.stringify(result.body), {
          status: result.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 成功响应
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 未匹配的 API → 返回空列表（避免 404）
    console.warn(`[MOCK] 未匹配的请求: ${method} ${url}，返回空数据`);
    return new Response(JSON.stringify(ok([])), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  console.log('[MOCK] Fetch mock 已安装，所有 /api/* 请求将被本地拦截');
}

// 仅在开发环境安装
if (import.meta.env.DEV) {
  installFetchMock();
}
