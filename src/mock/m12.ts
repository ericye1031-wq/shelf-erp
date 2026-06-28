import { http, HttpResponse } from 'msw';
import type { CostDimension, CostVariance, CostAlert } from '@/types/m12';

const now = '2025-01-15T10:00:00Z';

const mockDimensions: CostDimension[] = [
  { id: 'cd1', projectId: 'p1', category: 'material', budgetAmount: 1680000, actualAmount: 1720000, committedAmount: 1700000, remainingBudget: -40000, unit: '元', period: '2025-01', audit: { createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now, projectId: 'p1' } },
  { id: 'cd2', projectId: 'p1', category: 'labor', budgetAmount: 420000, actualAmount: 180000, committedAmount: 300000, remainingBudget: 120000, unit: '元', period: '2025-01', audit: { createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now, projectId: 'p1' } },
  { id: 'cd3', projectId: 'p1', category: 'overhead', budgetAmount: 280000, actualAmount: 95000, committedAmount: 150000, remainingBudget: 130000, unit: '元', period: '2025-01', audit: { createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now, projectId: 'p1' } },
  { id: 'cd4', projectId: 'p1', category: 'logistics', budgetAmount: 160000, actualAmount: 0, committedAmount: 50000, remainingBudget: 110000, unit: '元', period: '2025-01', audit: { createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now, projectId: 'p1' } },
];

const mockVariances: CostVariance[] = [
  { id: 'cv1', projectId: 'p1', dimensionId: 'cd1', category: 'material', budgetAmount: 1680000, actualAmount: 1720000, variance: -40000, varianceRate: -0.024, reason: '钢材价格上涨', period: '2025-01', createdAt: now },
  { id: 'cv2', projectId: 'p1', dimensionId: 'cd2', category: 'labor', budgetAmount: 420000, actualAmount: 180000, variance: 240000, varianceRate: 0.571, reason: '项目初期人工投入较少', period: '2025-01', createdAt: now },
];

const mockAlerts: CostAlert[] = [
  { id: 'ca1', projectId: 'p1', dimensionId: 'cd1', category: 'material', type: 'over_budget', level: 'critical', threshold: 0, actualValue: -40000, message: '材料成本超预算 ¥40,000', isRead: false, triggeredAt: now, resolvedAt: null, resolvedBy: null },
  { id: 'ca2', projectId: 'p1', dimensionId: 'cd3', category: 'overhead', type: 'approaching_budget', level: 'warning', threshold: 0.8, actualValue: 0.54, message: '制造费用已达预算54%', isRead: true, triggeredAt: now, resolvedAt: null, resolvedBy: null },
];

const ok = <T>(data: T) => ({ code: 0, data, message: 'ok' });
const paginated = <T>(items: T[]) => ({ code: 0, data: { items, total: items.length, page: 1, pageSize: 20 }, message: 'ok' });

export const m12Handlers = [
  http.get('/api/m12/dimensions', () => HttpResponse.json(paginated(mockDimensions))),
  http.get('/api/m12/dimensions/:id', ({ params }) => {
    const item = mockDimensions.find((d) => d.id === params['id']);
    return HttpResponse.json(ok(item));
  }),
  http.post('/api/m12/dimensions', async ({ request }) => {
    const body = (await request.json()) as Partial<CostDimension>;
    const item = { ...body, id: `cd${Date.now()}`, audit: { createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now } } as CostDimension;
    mockDimensions.push(item);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m12/dimensions/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<CostDimension>;
    const idx = mockDimensions.findIndex((d) => d.id === params['id']);
    if (idx >= 0) Object.assign(mockDimensions[idx], body);
    return HttpResponse.json(ok(mockDimensions[idx]));
  }),
  http.get('/api/m12/variances', () => HttpResponse.json(paginated(mockVariances))),
  http.get('/api/m12/alerts', () => HttpResponse.json(paginated(mockAlerts))),
  http.post('/api/m12/alerts/:id/resolve', ({ params }) => {
    const idx = mockAlerts.findIndex((a) => a.id === params['id']);
    if (idx >= 0) { mockAlerts[idx].resolvedAt = now; mockAlerts[idx].isRead = true; mockAlerts[idx].resolvedBy = '2'; }
    return HttpResponse.json(ok(mockAlerts[idx]));
  }),
  http.get('/api/m12/projects/:projectId/cost-summary', ({ params }) => {
    const items = mockDimensions.filter((d) => d.projectId === params['projectId']);
    return HttpResponse.json(ok(items));
  }),
];

export { mockDimensions as m12MockDimensions, mockVariances as m12MockVariances, mockAlerts as m12MockAlerts };
