import { type Page, type Route } from '@playwright/test';

/**
 * E2E测试API Mock助手
 * 使用Playwright的 page.route() 拦截所有API请求，返回mock数据
 * 同时通过 addInitScript 预设localStorage认证状态，跳过登录UI
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

const MOCK_TOKEN = 'mock-jwt-token-e2e-test';

const ok = <T>(data: T) => ({ code: 0, data, message: 'ok' });
const paginated = <T>(items: T[]) => ({ code: 0, data: { items, total: items.length, page: 1, pageSize: 20 }, message: 'ok' });

// Mock数据
const mockCustomers = [
  { id: 'c1', name: '顺丰物流有限公司', code: 'SF001', shortName: '顺丰', type: 'direct', industry: '物流', region: '华东', level: 'A', source: '展会', status: 'active', createdBy: '2', createdAt: '2025-01-15T10:00:00Z', updatedBy: '2', updatedAt: '2025-01-15T10:00:00Z', projectId: 'p1' },
  { id: 'c2', name: '京东仓储科技有限公司', code: 'JD001', shortName: '京东仓储', type: 'direct', industry: '电商仓储', region: '华东', level: 'A', source: '老客户推荐', status: 'active', createdBy: '2', createdAt: '2025-01-15T10:00:00Z', updatedBy: '2', updatedAt: '2025-01-15T10:00:00Z', projectId: 'p1' },
  { id: 'c3', name: '中储股份南京分公司', code: 'ZC001', shortName: '中储', type: 'agent', industry: '仓储', region: '华东', level: 'B', source: '电话营销', status: 'active', createdBy: '2', createdAt: '2025-01-15T10:00:00Z', updatedBy: '2', updatedAt: '2025-01-15T10:00:00Z', projectId: 'p1' },
];

const mockContacts = [
  { id: 'ct1', customerId: 'c1', name: '王经理', position: '采购经理', phone: '13900000001', email: 'wang@sf.com', isPrimary: true, remark: '', createdBy: '2', createdAt: '2025-01-15T10:00:00Z', updatedBy: '2', updatedAt: '2025-01-15T10:00:00Z' },
  { id: 'ct2', customerId: 'c1', name: '赵主管', position: '仓储主管', phone: '13900000002', email: 'zhao@sf.com', isPrimary: false, remark: '', createdBy: '2', createdAt: '2025-01-15T10:00:00Z', updatedBy: '2', updatedAt: '2025-01-15T10:00:00Z' },
  { id: 'ct3', customerId: 'c2', name: '刘总监', position: '运营总监', phone: '13900000003', email: 'liu@jd.com', isPrimary: true, remark: '', createdBy: '2', createdAt: '2025-01-15T10:00:00Z', updatedBy: '2', updatedAt: '2025-01-15T10:00:00Z' },
];

const mockShelfTypes = [
  { id: 'st1', code: 'PRA', name: '横梁式货架', category: 'heavy', description: '最常用的托盘存储货架', loadRange: '500-5000kg', status: 'active', createdAt: '2025-01-15T10:00:00Z' },
  { id: 'st2', code: 'PRB', name: '窄巷道货架', category: 'heavy', description: '高密度存储', loadRange: '500-3000kg', status: 'active', createdAt: '2025-01-15T10:00:00Z' },
  { id: 'st3', code: 'ATT', name: '阁楼式货架', category: 'medium', description: '双层存储空间', loadRange: '200-1000kg', status: 'active', createdAt: '2025-01-15T10:00:00Z' },
];

const mockConfigs = [
  { id: 'cfg1', name: '标准横梁式 L2700*W1000*H2000 4层500kg', shelfTypeId: 'st1', shelfTypeName: '横梁式货架', parameters: { length: 2.7, width: 1, height: 2, layers: 4, loadPerLayer: 500 }, status: 'active', createdAt: '2025-01-15T10:00:00Z' },
  { id: 'cfg2', name: '重型横梁式 L3000*W1100*H3000 5层1000kg', shelfTypeId: 'st1', shelfTypeName: '横梁式货架', parameters: { length: 3, width: 1.1, height: 3, layers: 5, loadPerLayer: 1000 }, status: 'active', createdAt: '2025-01-15T10:00:00Z' },
];

const mockQuotations = [
  { id: 'q1', code: 'QUO202501001', customerId: 'c1', customerName: '顺丰物流有限公司', shelfTypeName: '横梁式货架', configName: '标准横梁式 L2700*W1000*H2000 4层500kg', quantity: 200, unit: '组', totalAmount: 580000, status: 'draft', createdBy: '2', createdAt: '2025-01-15T10:00:00Z', updatedBy: '2', updatedAt: '2025-01-15T10:00:00Z' },
  { id: 'q2', code: 'QUO202501002', customerId: 'c2', customerName: '京东仓储科技有限公司', shelfTypeName: '阁楼式货架', configName: '阁楼式 L4000*W2000*H4500 3层', quantity: 50, unit: '组', totalAmount: 350000, status: 'sent', createdBy: '2', createdAt: '2025-01-16T10:00:00Z', updatedBy: '2', updatedAt: '2025-01-16T10:00:00Z' },
  { id: 'q3', code: 'QUO202501003', customerId: 'c3', customerName: '中储股份南京分公司', shelfTypeName: '窄巷道货架', configName: '窄巷道 L2700*W1100*H6000 6层', quantity: 100, unit: '组', totalAmount: 420000, status: 'approved', createdBy: '2', createdAt: '2025-01-17T10:00:00Z', updatedBy: '2', updatedAt: '2025-01-17T10:00:00Z' },
];

const mockBomResult = {
  totalWeight: 103.49,
  totalCost: 600.13,
  totalSurfaceArea: 12.5,
  items: [
    { id: 'bom1', partName: '立柱', spec: '90*70*2.0', quantity: 6, unit: '件', unitWeight: 7.86, unitCost: 53.62, totalCost: 321.72, category: 'main' },
    { id: 'bom2', partName: '横梁', spec: '100*50*1.5', quantity: 9, unit: '件', unitWeight: 2.26, unitCost: 18.79, totalCost: 169.11, category: 'main' },
    { id: 'bom3', partName: '层板', spec: 'panel', quantity: 5, unit: '件', unitWeight: 0, unitCost: 12.5, totalCost: 62.5, category: 'main' },
    { id: 'bom4', partName: '法兰螺栓10*20', spec: '10*20', quantity: 17, unit: '个', unitWeight: 0.11, unitCost: 0.15, totalCost: 2.55, category: 'accessory' },
    { id: 'bom5', partName: '法兰螺母M10', spec: 'M10', quantity: 17, unit: '个', unitWeight: 0.065, unitCost: 0.1, totalCost: 1.7, category: 'accessory' },
  ],
};

const mockCurrencies = [
  { id: 'cur1', code: 'CNY', name: '人民币', symbol: '¥', rate: 1, isDefault: true },
  { id: 'cur2', code: 'USD', name: '美元', symbol: '$', rate: 7.2, isDefault: false },
];

const mockOrganizations = [
  { id: 'org1', name: '默认组织', code: 'DEFAULT', parentId: null, type: 'group', contact: '张总', phone: '13800000001', address: '南京市江宁区', status: 'active', sort: 1, createdBy: '1', createdAt: '2025-01-15T10:00:00Z', updatedBy: '1', updatedAt: '2025-01-15T10:00:00Z' },
  { id: 'org2', name: '华东工厂', code: 'HD', parentId: 'org1', type: 'factory', contact: '李厂长', phone: '13800000002', address: '南京市浦口区', status: 'active', sort: 2, createdBy: '1', createdAt: '2025-01-15T10:00:00Z', updatedBy: '1', updatedAt: '2025-01-15T10:00:00Z' },
];

const mockUsers = [
  { id: '1', username: 'admin', name: '管理员', phone: '13800000001', email: 'admin@shelf.com', orgId: 'org1', orgName: '默认组织', roleIds: ['role1'], status: 'active', avatar: '', createdBy: '1', createdAt: '2025-01-15T10:00:00Z', updatedBy: '1', updatedAt: '2025-01-15T10:00:00Z' },
  { id: '2', username: 'zhangsan', name: '张三', phone: '13800000002', email: 'zhangsan@shelf.com', orgId: 'org2', orgName: '华东工厂', roleIds: ['role2'], status: 'active', avatar: '', createdBy: '1', createdAt: '2025-01-15T10:00:00Z', updatedBy: '1', updatedAt: '2025-01-15T10:00:00Z' },
];

const mockRoles = [
  { id: 'role1', name: '超级管理员', code: 'super_admin', description: '拥有全部权限', permissionIds: ['*'], status: 'active', createdBy: '1', createdAt: '2025-01-15T10:00:00Z', updatedBy: '1', updatedAt: '2025-01-15T10:00:00Z' },
  { id: 'role2', name: '销售经理', code: 'sales_manager', description: '管理客户和报价', permissionIds: ['m02:*', 'm05:*'], status: 'active', createdBy: '1', createdAt: '2025-01-15T10:00:00Z', updatedBy: '1', updatedAt: '2025-01-15T10:00:00Z' },
];

const mockProjects = [
  { id: 'p1', code: 'PRJ202501001', name: '顺丰华东分拨中心货架项目', customerId: 'c1', customerName: '顺丰物流有限公司', contractId: 'contract1', status: 'in_progress', startDate: '2025-02-01', endDate: '2025-04-30', manager: '张三', createdBy: '2', createdAt: '2025-01-15T10:00:00Z', updatedBy: '2', updatedAt: '2025-01-15T10:00:00Z' },
  { id: 'p2', code: 'PRJ202501002', name: '京东南京仓扩建项目', customerId: 'c2', customerName: '京东仓储科技有限公司', contractId: 'contract2', status: 'planning', startDate: '2025-03-01', endDate: '2025-06-30', manager: '张三', createdBy: '2', createdAt: '2025-01-16T10:00:00Z', updatedBy: '2', updatedAt: '2025-01-16T10:00:00Z' },
];

const mockContracts = [
  { id: 'contract1', code: 'CON202501001', customerId: 'c1', customerName: '顺丰物流有限公司', projectId: 'p1', projectName: '顺丰华东分拨中心货架项目', amount: 580000, signedDate: '2025-01-20', deliveryDate: '2025-04-01', status: 'active', paymentStatus: 'partial', createdBy: '2', createdAt: '2025-01-20T10:00:00Z', updatedBy: '2', updatedAt: '2025-01-20T10:00:00Z' },
  { id: 'contract2', code: 'CON202501002', customerId: 'c2', customerName: '京东仓储科技有限公司', projectId: 'p2', projectName: '京东南京仓扩建项目', amount: 350000, signedDate: '2025-02-01', deliveryDate: '2025-06-30', status: 'active', paymentStatus: 'paid', createdBy: '2', createdAt: '2025-02-01T10:00:00Z', updatedBy: '2', updatedAt: '2025-02-01T10:00:00Z' },
];

const mockWorkOrders = [
  { id: 'wo1', code: 'WO202501001', projectName: '顺丰华东分拨中心货架项目', productId: 'st1', productName: '横梁式货架', quantity: 200, unit: '组', status: 'in_progress', priority: 'high', plannedStart: '2025-02-15', plannedEnd: '2025-03-15', actualStart: '2025-02-15', createdBy: '2', createdAt: '2025-02-10T10:00:00Z', updatedBy: '2', updatedAt: '2025-02-15T10:00:00Z' },
  { id: 'wo2', code: 'WO202501002', projectName: '京东南京仓扩建项目', productId: 'st3', productName: '阁楼式货架', quantity: 50, unit: '组', status: 'pending', priority: 'medium', plannedStart: '2025-03-15', plannedEnd: '2025-04-15', actualStart: null, createdBy: '2', createdAt: '2025-02-20T10:00:00Z', updatedBy: '2', updatedAt: '2025-02-20T10:00:00Z' },
];

const mockWarehouses = [
  { id: 'wh1', code: 'WH01', name: '原材料仓', location: 'A区', type: 'raw_material', manager: '李仓管', status: 'active', createdBy: '1', createdAt: '2025-01-15T10:00:00Z', updatedBy: '1', updatedAt: '2025-01-15T10:00:00Z' },
  { id: 'wh2', code: 'WH02', name: '成品仓', location: 'B区', type: 'finished_goods', manager: '王仓管', status: 'active', createdBy: '1', createdAt: '2025-01-15T10:00:00Z', updatedBy: '1', updatedAt: '2025-01-15T10:00:00Z' },
];

const mockInventory = [
  { id: 'inv1', warehouseId: 'wh1', warehouseName: '原材料仓', materialCode: 'SQ90*70*2.0', materialName: '立柱型材90*70*2.0', spec: '90*70*2.0', quantity: 500, unit: '件', batchNo: 'B202501001', status: 'normal', createdBy: '1', createdAt: '2025-01-15T10:00:00Z', updatedBy: '1', updatedAt: '2025-01-15T10:00:00Z' },
  { id: 'inv2', warehouseId: 'wh1', warehouseName: '原材料仓', materialCode: 'SQ100*50*1.5', materialName: '横梁型材100*50*1.5', spec: '100*50*1.5', quantity: 800, unit: '件', batchNo: 'B202501002', status: 'normal', createdBy: '1', createdAt: '2025-01-15T10:00:00Z', updatedBy: '1', updatedAt: '2025-01-15T10:00:00Z' },
];

// 仪表盘统计数据
const mockDashboardStats = {
  customerCount: 3,
  quotationCount: 3,
  contractCount: 2,
  projectCount: 2,
  workOrderCount: 2,
  monthlyRevenue: 930000,
  pendingQuotations: 1,
  activeProjects: 1,
};

/**
 * 路由处理器 — 拦截所有API请求
 */
async function handleApiRoute(route: Route) {
  const url = new URL(route.request().url());
  const path = url.pathname;
  const method = route.request().method();

  // 认证接口
  if (path === '/api/m01/auth/login' && method === 'POST') {
    const body = route.request().postDataJSON();
    if (body?.username === 'admin' && body?.password === 'admin123') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ok({ accessToken: MOCK_TOKEN, refreshToken: 'mock-refresh', user: MOCK_USER })),
      });
    }
    return route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ code: 401, data: null, message: '用户名或密码错误' }),
    });
  }

  if (path === '/api/m01/auth/me' && method === 'GET') {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(ok(MOCK_USER)),
    });
  }

  // M01 系统管理
  if (path === '/api/m01/organizations' && method === 'GET') {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(paginated(mockOrganizations)) });
  }
  if (path === '/api/m01/users' && method === 'GET') {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(paginated(mockUsers)) });
  }
  if (path === '/api/m01/roles' && method === 'GET') {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(paginated(mockRoles)) });
  }

  // M02 客户管理
  if (path === '/api/m02/customers' && method === 'GET') {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(paginated(mockCustomers)) });
  }
  if (path === '/api/m02/customers' && method === 'POST') {
    const body = route.request().postDataJSON();
    const newItem = { ...body, id: `c${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(newItem)) });
  }
  if (path.match(/^\/api\/m02\/customers\/[^/]+$/) && method === 'GET') {
    const id = path.split('/').pop();
    const item = mockCustomers.find((c) => c.id === id);
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(item || mockCustomers[0])) });
  }
  if (path.match(/^\/api\/m02\/customers\/[^/]+\/contacts$/) && method === 'GET') {
    const customerId = path.split('/')[4];
    const contacts = mockContacts.filter((c) => c.customerId === customerId);
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(paginated(contacts)) });
  }
  if (path === '/api/m02/opportunities' && method === 'GET') {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(paginated([])) });
  }
  if (path === '/api/m02/inquiries' && method === 'GET') {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(paginated([])) });
  }
  if (path === '/api/m02/followups' && method === 'GET') {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(paginated([])) });
  }

  // M04 产品管理
  if (path === '/api/m04/shelf-types' && method === 'GET') {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(paginated(mockShelfTypes)) });
  }
  if (path === '/api/m04/configs' && method === 'GET') {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(paginated(mockConfigs)) });
  }
  if (path.match(/^\/api\/m04\/configs\/[^/]+\/calculate-bom$/) && method === 'POST') {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(mockBomResult)) });
  }

  // M05 报价管理
  if (path === '/api/m05/quotations' && method === 'GET') {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(paginated(mockQuotations)) });
  }
  if (path === '/api/m05/quotations' && method === 'POST') {
    const body = route.request().postDataJSON();
    const newItem = { ...body, id: `q${Date.now()}`, code: `QUO${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(newItem)) });
  }
  if (path.match(/^\/api\/m05\/quotations\/[^/]+$/) && method === 'GET') {
    const id = path.split('/').pop();
    const item = mockQuotations.find((q) => q.id === id);
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(item || mockQuotations[0])) });
  }
  if (path === '/api/m05/currencies' && method === 'GET') {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(mockCurrencies)) });
  }

  // M06 合同管理
  if (path === '/api/m06/contracts' && method === 'GET') {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(paginated(mockContracts)) });
  }

  // M07 项目管理
  if (path === '/api/m07/projects' && method === 'GET') {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(paginated(mockProjects)) });
  }

  // M10 生产管理
  if (path === '/api/m10/work-orders' && method === 'GET') {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(paginated(mockWorkOrders)) });
  }

  // M11 仓储管理
  if (path === '/api/m11/warehouses' && method === 'GET') {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(paginated(mockWarehouses)) });
  }
  if (path === '/api/m11/inventory' && method === 'GET') {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(paginated(mockInventory)) });
  }

  // 仪表盘统计
  if (path === '/api/dashboard/stats' || path === '/api/m01/dashboard/stats' || path === '/api/stats') {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(mockDashboardStats)) });
  }

  // 默认：返回空分页数据
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(paginated([])),
  });
}

/**
 * 设置E2E测试的API Mock + 预设登录状态
 * 在 beforeEach 中调用（在 page.goto 之后调用以确保 baseURL 生效）
 */
export async function setupTestEnv(page: Page) {
  // 1. 预设localStorage认证状态（在任何页面脚本执行前）
  await page.addInitScript(() => {
    localStorage.setItem('token', 'mock-jwt-token-e2e-test');
    localStorage.setItem('user', JSON.stringify({
      id: '1', username: 'admin', name: '管理员', orgId: 'org1', orgName: '默认组织', roles: ['super_admin'], permissions: ['*'],
    }));
    localStorage.setItem('permissions', JSON.stringify(['*']));
  });

  // 2. 拦截所有API请求
  await page.route('**/api/**', handleApiRoute);
}

/**
 * 仅设置API Mock（不预设登录状态，用于登录测试）
 */
export async function setupApiMock(page: Page) {
  await page.route('**/api/**', handleApiRoute);
}
