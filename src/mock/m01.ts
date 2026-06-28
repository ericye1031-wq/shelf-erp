import { http, HttpResponse } from 'msw';
import type { Organization, User, Role, Dictionary, SystemLog, SystemConfig } from '@/types/m01';

const now = '2025-01-15T10:00:00Z';

const mockOrganizations: Organization[] = [
  { id: 'org1', name: '默认组织', code: 'DEFAULT', parentId: null, type: 'group', contact: '张总', phone: '13800000001', address: '南京市江宁区', status: 'active', sort: 1, audit: { createdBy: '1', createdAt: now, updatedBy: '1', updatedAt: now } },
  { id: 'org2', name: '华东工厂', code: 'HD', parentId: 'org1', type: 'factory', contact: '李厂长', phone: '13800000002', address: '南京市浦口区', status: 'active', sort: 2, audit: { createdBy: '1', createdAt: now, updatedBy: '1', updatedAt: now } },
  { id: 'org3', name: '华南工厂', code: 'HN', parentId: 'org1', type: 'factory', contact: '王厂长', phone: '13800000003', address: '广州市白云区', status: 'active', sort: 3, audit: { createdBy: '1', createdAt: now, updatedBy: '1', updatedAt: now } },
];

const mockUsers: User[] = [
  { id: '1', username: 'admin', name: '管理员', phone: '13800000001', email: 'admin@shelf.com', orgId: 'org1', orgName: '默认组织', roleIds: ['role1'], status: 'active', avatar: '', audit: { createdBy: '1', createdAt: now, updatedBy: '1', updatedAt: now } },
  { id: '2', username: 'zhangsan', name: '张三', phone: '13800000002', email: 'zhangsan@shelf.com', orgId: 'org2', orgName: '华东工厂', roleIds: ['role2'], status: 'active', avatar: '', audit: { createdBy: '1', createdAt: now, updatedBy: '1', updatedAt: now } },
  { id: '3', username: 'lisi', name: '李四', phone: '13800000003', email: 'lisi@shelf.com', orgId: 'org2', orgName: '华东工厂', roleIds: ['role3'], status: 'active', avatar: '', audit: { createdBy: '1', createdAt: now, updatedBy: '1', updatedAt: now } },
];

const mockRoles: Role[] = [
  { id: 'role1', name: '超级管理员', code: 'super_admin', description: '拥有全部权限', permissionIds: ['*'], status: 'active', audit: { createdBy: '1', createdAt: now, updatedBy: '1', updatedAt: now } },
  { id: 'role2', name: '销售经理', code: 'sales_manager', description: '管理客户和报价', permissionIds: ['m02:*', 'm05:*'], status: 'active', audit: { createdBy: '1', createdAt: now, updatedBy: '1', updatedAt: now } },
  { id: 'role3', name: '生产主管', code: 'production_supervisor', description: '管理工单和排程', permissionIds: ['m10:*', 'm08:*'], status: 'active', audit: { createdBy: '1', createdAt: now, updatedBy: '1', updatedAt: now } },
];

const mockDictionaries: Dictionary[] = [
  { id: 'dict1', category: 'customer_type', code: 'direct', label: '直客', value: 'direct', sort: 1, parentId: null, remark: '' },
  { id: 'dict2', category: 'customer_type', code: 'agent', label: '代理商', value: 'agent', sort: 2, parentId: null, remark: '' },
  { id: 'dict3', category: 'customer_type', code: 'distributor', label: '经销商', value: 'distributor', sort: 3, parentId: null, remark: '' },
  { id: 'dict4', category: 'shelf_category', code: 'light', label: '轻量型', value: 'light', sort: 1, parentId: null, remark: '' },
  { id: 'dict5', category: 'shelf_category', code: 'medium', label: '中量型', value: 'medium', sort: 2, parentId: null, remark: '' },
  { id: 'dict6', category: 'shelf_category', code: 'heavy', label: '重量型', value: 'heavy', sort: 3, parentId: null, remark: '' },
];

const mockLogs: SystemLog[] = [
  { id: 'log1', userId: '1', userName: '管理员', module: 'auth', action: 'login', ip: '192.168.1.100', detail: '登录系统', createdAt: now },
  { id: 'log2', userId: '2', userName: '张三', module: 'm02', action: 'create', ip: '192.168.1.101', detail: '创建客户：顺丰物流', createdAt: now },
];

const mockConfigs: SystemConfig[] = [
  { id: 'cfg1', key: 'default_currency', value: 'CNY', label: '默认币种', group: 'system', remark: '系统默认币种', updatedAt: now },
  { id: 'cfg2', key: 'tax_rate', value: '13', label: '默认税率(%)', group: 'finance', remark: '增值税率', updatedAt: now },
];

const ok = <T>(data: T) => ({ code: 0, data, message: 'ok' });
const paginated = <T>(items: T[]) => ({ code: 0, data: { items, total: items.length, page: 1, pageSize: 20 }, message: 'ok' });

export const m01Handlers = [
  http.get('/api/m01/organizations', () => HttpResponse.json(paginated(mockOrganizations))),
  http.get('/api/m01/organizations/:id', ({ params }) => {
    const item = mockOrganizations.find((o) => o.id === params['id']);
    return HttpResponse.json(ok(item));
  }),
  http.post('/api/m01/organizations', async ({ request }) => {
    const body = (await request.json()) as Partial<Organization>;
    const item = { ...body, id: `org${Date.now()}`, audit: { createdBy: '1', createdAt: now, updatedBy: '1', updatedAt: now } } as Organization;
    mockOrganizations.push(item);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m01/organizations/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Organization>;
    const idx = mockOrganizations.findIndex((o) => o.id === params['id']);
    if (idx >= 0) Object.assign(mockOrganizations[idx], body);
    return HttpResponse.json(ok(mockOrganizations[idx]));
  }),
  http.delete('/api/m01/organizations/:id', ({ params }) => {
    const idx = mockOrganizations.findIndex((o) => o.id === params['id']);
    if (idx >= 0) mockOrganizations.splice(idx, 1);
    return HttpResponse.json(ok(null));
  }),

  http.get('/api/m01/users', () => HttpResponse.json(paginated(mockUsers))),
  http.get('/api/m01/users/:id', ({ params }) => {
    const item = mockUsers.find((u) => u.id === params['id']);
    return HttpResponse.json(ok(item));
  }),
  http.post('/api/m01/users', async ({ request }) => {
    const body = (await request.json()) as Partial<User>;
    const item = { ...body, id: `u${Date.now()}`, audit: { createdBy: '1', createdAt: now, updatedBy: '1', updatedAt: now } } as User;
    mockUsers.push(item);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m01/users/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<User>;
    const idx = mockUsers.findIndex((u) => u.id === params['id']);
    if (idx >= 0) Object.assign(mockUsers[idx], body);
    return HttpResponse.json(ok(mockUsers[idx]));
  }),
  http.delete('/api/m01/users/:id', ({ params }) => {
    const idx = mockUsers.findIndex((u) => u.id === params['id']);
    if (idx >= 0) mockUsers.splice(idx, 1);
    return HttpResponse.json(ok(null));
  }),

  http.get('/api/m01/roles', () => HttpResponse.json(paginated(mockRoles))),
  http.get('/api/m01/roles/:id', ({ params }) => {
    const item = mockRoles.find((r) => r.id === params['id']);
    return HttpResponse.json(ok(item));
  }),
  http.post('/api/m01/roles', async ({ request }) => {
    const body = (await request.json()) as Partial<Role>;
    const item = { ...body, id: `role${Date.now()}`, audit: { createdBy: '1', createdAt: now, updatedBy: '1', updatedAt: now } } as Role;
    mockRoles.push(item);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m01/roles/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Role>;
    const idx = mockRoles.findIndex((r) => r.id === params['id']);
    if (idx >= 0) Object.assign(mockRoles[idx], body);
    return HttpResponse.json(ok(mockRoles[idx]));
  }),
  http.delete('/api/m01/roles/:id', ({ params }) => {
    const idx = mockRoles.findIndex((r) => r.id === params['id']);
    if (idx >= 0) mockRoles.splice(idx, 1);
    return HttpResponse.json(ok(null));
  }),

  http.get('/api/m01/permissions', () => HttpResponse.json(ok([
    { id: 'p1', name: '全部权限', code: '*', type: 'menu', parentId: null, sort: 0 },
    { id: 'p2', name: '客户管理', code: 'm02:*', type: 'menu', parentId: null, sort: 1 },
    { id: 'p3', name: '生产管理', code: 'm10:*', type: 'menu', parentId: null, sort: 2 },
  ]))),
  http.get('/api/m01/dictionaries', () => HttpResponse.json(paginated(mockDictionaries))),
  http.post('/api/m01/dictionaries', async ({ request }) => {
    const body = (await request.json()) as Partial<Dictionary>;
    const item = { ...body, id: `dict${Date.now()}` } as Dictionary;
    mockDictionaries.push(item);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m01/dictionaries/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Dictionary>;
    const idx = mockDictionaries.findIndex((d) => d.id === params['id']);
    if (idx >= 0) Object.assign(mockDictionaries[idx], body);
    return HttpResponse.json(ok(mockDictionaries[idx]));
  }),
  http.delete('/api/m01/dictionaries/:id', ({ params }) => {
    const idx = mockDictionaries.findIndex((d) => d.id === params['id']);
    if (idx >= 0) mockDictionaries.splice(idx, 1);
    return HttpResponse.json(ok(null));
  }),

  http.get('/api/m01/logs', () => HttpResponse.json(paginated(mockLogs))),
  http.get('/api/m01/configs', () => HttpResponse.json(paginated(mockConfigs))),
  http.put('/api/m01/configs/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<SystemConfig>;
    const idx = mockConfigs.findIndex((c) => c.id === params['id']);
    if (idx >= 0) Object.assign(mockConfigs[idx], body);
    return HttpResponse.json(ok(mockConfigs[idx]));
  }),
];

export { mockOrganizations as m01MockOrgs, mockUsers as m01MockUsers, mockRoles as m01MockRoles, mockDictionaries as m01MockDicts, mockLogs as m01MockLogs, mockConfigs as m01MockConfigs };
