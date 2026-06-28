// mock-server.js - 开发环境 Mock API 服务器（Express 版）
// 运行: node mock-server.js
// 端口: 3000

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ========== Mock 数据 ==========
const MOCK_USER = {
  id: '1', username: 'admin', name: '管理员',
  orgId: 'org1', orgName: '默认组织',
  roles: ['super_admin'], permissions: ['*'],
};

const mockDB = {
  customers: [
    { id: '1', name: '测试客户A', contact: '张三', phone: '13800138000', email: 'a@test.com', level: 'A', status: 'active' },
    { id: '2', name: '测试客户B', contact: '李四', phone: '13900139000', email: 'b@test.com', level: 'B', status: 'active' },
  ],
  quotations: [
    { id: '1', code: 'QUO-2024-001', customerName: '测试客户A', totalAmount: 50000, status: 'draft' },
    { id: '2', code: 'QUO-2024-002', customerName: '测试客户B', totalAmount: 80000, status: 'submitted' },
  ],
};

let nextId = 100;

// 标准响应格式
function ok(data) {
  return { code: 0, data, message: 'ok' };
}
function fail(code, message) {
  return { code, data: null, message };
}

// ========== 路由 ==========

// 认证
app.post('/api/m01/auth/login', (req, res) => {
  console.log('[Mock] 登录请求:', req.body);
  if (req.body.username === 'admin' && req.body.password === 'admin123') {
    res.json(ok({
      accessToken: 'mock-jwt-token-xxxx',
      refreshToken: 'mock-refresh-token-xxxx',
      user: MOCK_USER,
    }));
  } else {
    res.status(401).json(fail(401, '用户名或密码错误'));
  }
});

app.get('/api/m01/auth/me', (req, res) => {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) {
    res.json(ok(MOCK_USER));
  } else {
    res.status(401).json(fail(401, '未登录'));
  }
});

// M02 客户管理
app.get('/api/m02/customers', (req, res) => {
  res.json(ok({ items: mockDB.customers, total: mockDB.customers.length }));
});

app.post('/api/m02/customers', (req, res) => {
  const item = { ...req.body, id: String(nextId++) };
  mockDB.customers.push(item);
  res.json(ok(item));
});

// M04 产品管理
app.get('/api/m04/shelf-types', (req, res) => {
  res.json(ok([
    { id: '1', name: '横梁式货架', category: '横梁式', status: 'active' },
    { id: '2', name: '贯通式货架', category: '贯通式', status: 'active' },
  ]));
});

app.get('/api/m04/configs', (req, res) => {
  res.json(ok([{ id: '1', name: '标准横梁式-2.0', shelfTypeId: '1', status: 'active' }]));
});

app.get('/api/m04/specifications', (req, res) => {
  res.json(ok([{ id: '1', name: '2000×600×2000', shelfConfigId: '1', status: 'active' }]));
});

// M05 报价管理
app.get('/api/m05/quotations', (req, res) => {
  res.json(ok({ items: mockDB.quotations, total: mockDB.quotations.length }));
});

app.post('/api/m05/quotations', (req, res) => {
  const item = { ...req.body, id: String(nextId++), code: `QUO-2024-${nextId}` };
  mockDB.quotations.push(item);
  res.json(ok(item));
});

app.get('/api/m05/currencies', (req, res) => {
  res.json(ok([{ code: 'CNY', name: '人民币', rate: 1 }, { code: 'USD', name: '美元', rate: 7.2 }]));
});

// M06 合同管理
app.get('/api/m06/contracts', (req, res) => {
  res.json(ok({ items: [{ id: '1', code: 'CT-2024-001', customerName: '测试客户A', totalAmount: 50000, status: 'active' }], total: 1 }));
});

// M07 项目管理
app.get('/api/m07/projects', (req, res) => {
  res.json(ok({ items: [{ id: '1', code: 'PJ-2024-001', name: '测试项目A', status: 'active' }], total: 1 }));
});

// M10 生产管理
app.get('/api/m10/work-orders', (req, res) => {
  res.json(ok({ items: [{ id: '1', code: 'WO-2024-001', name: '生产工单A', status: 'pending' }], total: 1 }));
});

// M11 仓储管理
app.get('/api/m11/warehouses', (req, res) => {
  res.json(ok([{ id: '1', name: '主仓库', location: '车间A' }]));
});

app.get('/api/m11/inventory', (req, res) => {
  res.json(ok({ items: [{ id: '1', materialName: '钢材', quantity: 1000, warehouseName: '主仓库' }], total: 1 }));
});

// M12 成本管理
app.get('/api/m12/dimensions', (req, res) => {
  res.json(ok([]));
});

// 兜底：所有未匹配请求
app.use((req, res, next) => {
  if (req.method === 'GET') {
    console.warn('[Mock] 未匹配的 GET 请求:', req.url);
    return res.json(ok({ items: [], total: 0 }));
  }
  if (req.method === 'POST') {
    console.warn('[Mock] 未匹配的 POST 请求:', req.url);
    return res.json(ok({ ...req.body, id: String(nextId++) }));
  }
  next();
});

// 启动服务器
app.listen(3000, () => {
  console.log('[Mock API] ✅ 服务器已启动 http://localhost:3000');
  console.log('[Mock API] 登录账号: admin / admin123');
});
