/**
 * MSW Handlers - 开发环境 API Mock
 * 拦截所有 /api/* 请求，返回 mock 数据
 */

import { http, HttpResponse } from 'msw';

// 模拟用户数据
const MOCK_USER = {
  id: '1',
  username: 'admin',
  name: '管理员',
  orgId: 'org1',
  orgName: '默认组织',
  roles: ['super_admin'],
  permissions: ['*'],
};

// 模拟数据库
const mockDB: Record<string, any[]> = {
  customers: [
    { id: '1', name: '测试客户A', contact: '张三', phone: '13800138000', email: 'a@test.com', level: 'A', status: 'active' },
    { id: '2', name: '测试客户B', contact: '李四', phone: '13900139000', email: 'b@test.com', level: 'B', status: 'active' },
  ],
  quotations: [
    { id: '1', code: 'QUO-2024-001', customerName: '测试客户A', totalAmount: 50000, status: 'draft' },
    { id: '2', code: 'QUO-2024-002', customerName: '测试客户B', totalAmount: 80000, status: 'submitted' },
  ],
  contracts: [
    { id: '1', code: 'CT-2024-001', customerName: '测试客户A', totalAmount: 50000, status: 'active' },
  ],
  projects: [
    { id: '1', code: 'PJ-2024-001', name: '测试项目A', status: 'active' },
  ],
  workOrders: [
    { id: '1', code: 'WO-2024-001', name: '生产工单A', status: 'pending' },
  ],
  warehouses: [
    { id: '1', name: '主仓库', location: '车间A' },
  ],
  inventory: [
    { id: '1', materialName: '钢材', quantity: 1000, warehouseName: '主仓库' },
  ],
};

let nextId = 100;

export const handlers = [
  // ========== 认证 ==========
  http.post('/api/m01/auth/login', async ({ request }) => {
    const body = await request.json() as { username: string; password: string };
    console.log('[MSW] 登录请求:', body);
    if (body.username === 'admin' && body.password === 'admin123') {
      return HttpResponse.json({
        code: 0,
        data: {
          accessToken: 'mock-jwt-token-xxxx',
          refreshToken: 'mock-refresh-token-xxxx',
          user: MOCK_USER,
        },
        message: 'ok',
      });
    }
    return HttpResponse.json(
      { code: 401, data: null, message: '用户名或密码错误' },
      { status: 401 }
    );
  }),

  http.get('/api/m01/auth/me', () => {
    return HttpResponse.json({
      code: 0,
      data: MOCK_USER,
      message: 'ok',
    });
  }),

  http.get('/api/m01/users', () => {
    return HttpResponse.json({ code: 0, data: [MOCK_USER], message: 'ok' });
  }),

  // ========== M02 客户管理 ==========
  http.get('/api/m02/customers', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const list = mockDB.customers;
    const items = list.slice((page - 1) * pageSize, page * pageSize);
    return HttpResponse.json({ code: 0, data: { items, total: list.length }, message: 'ok' });
  }),

  http.post('/api/m02/customers', async ({ request }) => {
    const body = await request.json();
    const item = { ...body, id: String(nextId++) };
    mockDB.customers.push(item);
    return HttpResponse.json({ code: 0, data: item, message: 'ok' });
  }),

  // ========== M04 产品管理 ==========
  http.get('/api/m04/shelf-types', () => {
    return HttpResponse.json({
      code: 0,
      data: [
        { id: '1', name: '横梁式货架', category: '横梁式', status: 'active' },
        { id: '2', name: '贯通式货架', category: '贯通式', status: 'active' },
      ],
      message: 'ok',
    });
  }),

  http.get('/api/m04/configs', () => {
    return HttpResponse.json({
      code: 0,
      data: [
        { id: '1', name: '标准横梁式-2.0', shelfTypeId: '1', status: 'active' },
      ],
      message: 'ok',
    });
  }),

  http.get('/api/m04/specifications', () => {
    return HttpResponse.json({
      code: 0,
      data: [
        { id: '1', name: '2000×600×2000', shelfConfigId: '1', status: 'active' },
      ],
      message: 'ok',
    });
  }),

  // ========== M05 报价管理 ==========
  http.get('/api/m05/quotations', () => {
    return HttpResponse.json({
      code: 0,
      data: { items: mockDB.quotations, total: mockDB.quotations.length },
      message: 'ok',
    });
  }),

  http.post('/api/m05/quotations', async ({ request }) => {
    const body = await request.json();
    const item = { ...body, id: String(nextId++), code: `QUO-2024-00${nextId}` };
    mockDB.quotations.push(item);
    return HttpResponse.json({ code: 0, data: item, message: 'ok' });
  }),

  http.get('/api/m05/currencies', () => {
    return HttpResponse.json({
      code: 0,
      data: [
        { code: 'CNY', name: '人民币', rate: 1 },
        { code: 'USD', name: '美元', rate: 7.2 },
      ],
      message: 'ok',
    });
  }),

  // ========== M06 合同管理 ==========
  http.get('/api/m06/contracts', () => {
    return HttpResponse.json({
      code: 0,
      data: { items: mockDB.contracts, total: mockDB.contracts.length },
      message: 'ok',
    });
  }),

  // ========== M07 项目管理 ==========
  http.get('/api/m07/projects', () => {
    return HttpResponse.json({
      code: 0,
      data: { items: mockDB.projects, total: mockDB.projects.length },
      message: 'ok',
    });
  }),

  // ========== M10 生产管理 ==========
  http.get('/api/m10/work-orders', () => {
    return HttpResponse.json({
      code: 0,
      data: { items: mockDB.workOrders, total: mockDB.workOrders.length },
      message: 'ok',
    });
  }),

  // ========== M11 仓储管理 ==========
  http.get('/api/m11/warehouses', () => {
    return HttpResponse.json({ code: 0, data: mockDB.warehouses, message: 'ok' });
  }),

  http.get('/api/m11/inventory', () => {
    return HttpResponse.json({
      code: 0,
      data: { items: mockDB.inventory, total: mockDB.inventory.length },
      message: 'ok',
    });
  }),

  // ========== M12 成本管理 ==========
  http.get('/api/m12/dimensions', () => {
    return HttpResponse.json({ code: 0, data: [], message: 'ok' });
  }),

  // ========== 兜底：返回空列表 ==========
  http.get('/api/*', ({ request }) => {
    console.warn('[MSW] 未匹配的 GET 请求:', request.url);
    return HttpResponse.json({ code: 0, data: { items: [], total: 0 }, message: 'ok' });
  }),

  http.post('/api/*', async ({ request }) => {
    console.warn('[MSW] 未匹配的 POST 请求:', request.url);
    return HttpResponse.json({ code: 0, data: null, message: 'ok' });
  }),
];
