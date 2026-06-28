import { http, HttpResponse } from 'msw';
import type { Project, Milestone, GanttTask, Alert } from '@/types/m07';

const now = '2025-01-15T10:00:00Z';

const mockProjects: Project[] = [
  { id: 'p1', code: 'PRJ202501001', name: '顺丰华东分拨中心货架项目', contractId: 'ct1', customerId: 'c1', customerName: '顺丰物流', managerId: '2', managerName: '张三', startDate: '2025-01-20', endDate: '2025-04-30', progress: 15, status: 'in_progress', description: '横梁式货架2000组', createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now },
  { id: 'p2', code: 'PRJ202501002', name: '京东南京仓扩建项目', contractId: 'ct2', customerId: 'c2', customerName: '京东仓储', managerId: '2', managerName: '张三', startDate: '2025-02-01', endDate: '2025-06-30', progress: 0, status: 'planning', description: '阁楼式货架500组', createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now },
];

const mockMilestones: Record<string, Milestone[]> = {
  p1: [
    { id: 'ms1', projectId: 'p1', name: '技术方案确认', plannedDate: '2025-01-25', actualDate: '2025-01-24', progress: 100, status: 'completed', description: '', createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now },
    { id: 'ms2', projectId: 'p1', name: '原材料采购完成', plannedDate: '2025-02-15', actualDate: null, progress: 30, status: 'in_progress', description: '', createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now },
    { id: 'ms3', projectId: 'p1', name: '生产完成', plannedDate: '2025-03-20', actualDate: null, progress: 0, status: 'pending', description: '', createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now },
  ],
};

const mockGanttTasks: Record<string, GanttTask[]> = {
  p1: [
    { id: 'gt1', projectId: 'p1', name: '方案设计', startDate: '2025-01-20', endDate: '2025-01-25', progress: 100, parentId: null, assignee: '张三', color: '#005591', dependency: null },
    { id: 'gt2', projectId: 'p1', name: '原材料采购', startDate: '2025-01-26', endDate: '2025-02-15', progress: 30, parentId: null, assignee: '李四', color: '#2271B3', dependency: 'gt1' },
    { id: 'gt3', projectId: 'p1', name: '立柱生产', startDate: '2025-02-16', endDate: '2025-03-05', progress: 0, parentId: 'gt4', assignee: '王五', color: '#F44611', dependency: 'gt2' },
    { id: 'gt4', projectId: 'p1', name: '生产制造', startDate: '2025-02-16', endDate: '2025-03-20', progress: 0, parentId: null, assignee: '李四', color: '#005591', dependency: 'gt2' },
    { id: 'gt5', projectId: 'p1', name: '安装调试', startDate: '2025-03-25', endDate: '2025-04-15', progress: 0, parentId: null, assignee: '张三', color: '#2271B3', dependency: 'gt4' },
    { id: 'gt6', projectId: 'p1', name: '验收交付', startDate: '2025-04-16', endDate: '2025-04-30', progress: 0, parentId: null, assignee: '张三', color: '#005591', dependency: 'gt5' },
  ],
};

const mockAlerts: Alert[] = [
  { id: 'al1', projectId: 'p1', type: 'deadline', level: 'warning', title: '原材料采购即将延期', content: '钢材供应商交期延后5天', isRead: false, triggeredAt: now, resolvedAt: null },
  { id: 'al2', projectId: 'p1', type: 'cost', level: 'info', title: '材料成本波动', content: 'Q235钢材价格上涨3%', isRead: true, triggeredAt: now, resolvedAt: null },
];

const ok = <T>(data: T) => ({ code: 0, data, message: 'ok' });
const paginated = <T>(items: T[]) => ({ code: 0, data: { items, total: items.length, page: 1, pageSize: 20 }, message: 'ok' });

export const m07Handlers = [
  http.get('/api/m07/projects', () => HttpResponse.json(paginated(mockProjects))),
  http.get('/api/m07/projects/:id', ({ params }) => {
    const item = mockProjects.find((p) => p.id === params['id']);
    return HttpResponse.json(ok(item));
  }),
  http.post('/api/m07/projects', async ({ request }) => {
    const body = (await request.json()) as Partial<Project>;
    const item = { ...body, id: `p${Date.now()}`, createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now } as Project;
    mockProjects.push(item);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m07/projects/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Project>;
    const idx = mockProjects.findIndex((p) => p.id === params['id']);
    if (idx >= 0) Object.assign(mockProjects[idx], body);
    return HttpResponse.json(ok(mockProjects[idx]));
  }),
  http.delete('/api/m07/projects/:id', ({ params }) => {
    const idx = mockProjects.findIndex((p) => p.id === params['id']);
    if (idx >= 0) mockProjects.splice(idx, 1);
    return HttpResponse.json(ok(null));
  }),
  http.get('/api/m07/projects/:projectId/milestones', ({ params }) => {
    const items = mockMilestones[params['projectId'] as string] ?? [];
    return HttpResponse.json(ok(items));
  }),
  http.post('/api/m07/projects/:projectId/milestones', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Milestone>;
    const item = { ...body, id: `ms${Date.now()}`, projectId: params['projectId'] as string, createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now } as Milestone;
    const pid = params['projectId'] as string;
    if (!mockMilestones[pid]) mockMilestones[pid] = [];
    mockMilestones[pid].push(item);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m07/projects/:projectId/milestones/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Milestone>;
    const pid = params['projectId'] as string;
    const items = mockMilestones[pid] ?? [];
    const idx = items.findIndex((m) => m.id === params['id']);
    if (idx >= 0) Object.assign(items[idx], body);
    return HttpResponse.json(ok(items[idx]));
  }),
  http.get('/api/m07/projects/:projectId/gantt', ({ params }) => {
    const items = mockGanttTasks[params['projectId'] as string] ?? [];
    return HttpResponse.json(ok(items));
  }),
  http.post('/api/m07/projects/:projectId/gantt', async ({ params, request }) => {
    const body = (await request.json()) as Partial<GanttTask>;
    const item = { ...body, id: `gt${Date.now()}`, projectId: params['projectId'] as string } as GanttTask;
    const pid = params['projectId'] as string;
    if (!mockGanttTasks[pid]) mockGanttTasks[pid] = [];
    mockGanttTasks[pid].push(item);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m07/projects/:projectId/gantt/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<GanttTask>;
    const pid = params['projectId'] as string;
    const items = mockGanttTasks[pid] ?? [];
    const idx = items.findIndex((g) => g.id === params['id']);
    if (idx >= 0) Object.assign(items[idx], body);
    return HttpResponse.json(ok(items[idx]));
  }),
  http.get('/api/m07/alerts', () => HttpResponse.json(paginated(mockAlerts))),
  http.post('/api/m07/alerts/:id/resolve', ({ params }) => {
    const idx = mockAlerts.findIndex((a) => a.id === params['id']);
    if (idx >= 0) { mockAlerts[idx].resolvedAt = now; mockAlerts[idx].isRead = true; }
    return HttpResponse.json(ok(mockAlerts[idx]));
  }),
];

export { mockProjects as m07MockProjects, mockMilestones as m07MockMilestones, mockGanttTasks as m07MockGanttTasks, mockAlerts as m07MockAlerts };
