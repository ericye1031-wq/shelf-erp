import { http, HttpResponse } from 'msw';
import type { BOM, BomVersion, AlternativeMaterial } from '@/types/m08';

const now = '2025-01-15T10:00:00Z';

const mockBoms: BOM[] = [
  {
    id: 'bom1', projectId: 'p1', shelfConfigId: 'cfg1', version: 1, status: 'active',
    items: [
      { id: 'bi1', bomId: 'bom1', partCode: 'P01', partName: '立柱', material: 'Q235', spec: '90*70*2.0', quantity: 10000, unit: '件', length: 2.0, weight: 12.5, unitCost: 62.5, totalCost: 625000, wasteRate: 0.03, parentId: null, level: 1, sort: 1, alternativeIds: ['alt1'], remark: '' },
      { id: 'bi2', bomId: 'bom1', partCode: 'P02', partName: '横梁', material: 'Q235', spec: '120*50*1.5', quantity: 16000, unit: '件', length: 1.0, weight: 5.8, unitCost: 29.0, totalCost: 464000, wasteRate: 0.02, parentId: null, level: 1, sort: 2, alternativeIds: [], remark: '' },
      { id: 'bi3', bomId: 'bom1', partCode: 'P03', partName: '层板', material: 'Q235', spec: '2.7m*1.0m', quantity: 8000, unit: '件', length: 2.7, weight: 28.0, unitCost: 140.0, totalCost: 1120000, wasteRate: 0.05, parentId: null, level: 1, sort: 3, alternativeIds: [], remark: '' },
    ],
    totalWeight: 475400, totalCost: 2209000,
    audit: { createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now },
  },
];

const mockVersions: BomVersion[] = [
  { id: 'bv1', bomId: 'bom1', version: 1, changeNote: '初始版本', changedItemIds: [], createdAt: now, createdBy: '2' },
];

const mockAlternatives: Record<string, AlternativeMaterial[]> = {
  bi1: [
    { id: 'alt1', originalItemId: 'bi1', partCode: 'P01A', partName: '立柱(加厚)', material: 'Q345', spec: '90*70*2.5', priority: 1, priceDiff: 15.0, available: true, remark: '强度更高' },
  ],
};

const ok = <T>(data: T) => ({ code: 0, data, message: 'ok' });
const paginated = <T>(items: T[]) => ({ code: 0, data: { items, total: items.length, page: 1, pageSize: 20 }, message: 'ok' });

export const m08Handlers = [
  http.get('/api/m08/boms', () => HttpResponse.json(paginated(mockBoms))),
  http.get('/api/m08/boms/:id', ({ params }) => {
    const item = mockBoms.find((b) => b.id === params['id']);
    return HttpResponse.json(ok(item));
  }),
  http.post('/api/m08/boms', async ({ request }) => {
    const body = (await request.json()) as Partial<BOM>;
    const item = { ...body, id: `bom${Date.now()}`, audit: { createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now } } as BOM;
    mockBoms.push(item);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m08/boms/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<BOM>;
    const idx = mockBoms.findIndex((b) => b.id === params['id']);
    if (idx >= 0) Object.assign(mockBoms[idx], body);
    return HttpResponse.json(ok(mockBoms[idx]));
  }),
  http.delete('/api/m08/boms/:id', ({ params }) => {
    const idx = mockBoms.findIndex((b) => b.id === params['id']);
    if (idx >= 0) mockBoms.splice(idx, 1);
    return HttpResponse.json(ok(null));
  }),
  http.get('/api/m08/boms/:bomId/versions', ({ params }) => {
    const items = mockVersions.filter((v) => v.bomId === params['bomId']);
    return HttpResponse.json(ok(items));
  }),
  http.post('/api/m08/boms/:bomId/versions', async ({ params, request }) => {
    const body = (await request.json()) as Partial<BomVersion>;
    const item = { ...body, id: `bv${Date.now()}`, bomId: params['bomId'] as string, createdAt: now, createdBy: '2' } as BomVersion;
    mockVersions.push(item);
    return HttpResponse.json(ok(item));
  }),
  http.get('/api/m08/bom-items/:bomItemId/alternatives', ({ params }) => {
    const items = mockAlternatives[params['bomItemId'] as string] ?? [];
    return HttpResponse.json(ok(items));
  }),
  http.post('/api/m08/bom-items/:bomItemId/alternatives', async ({ params, request }) => {
    const body = (await request.json()) as Partial<AlternativeMaterial>;
    const item = { ...body, id: `alt${Date.now()}`, originalItemId: params['bomItemId'] as string } as AlternativeMaterial;
    const bid = params['bomItemId'] as string;
    if (!mockAlternatives[bid]) mockAlternatives[bid] = [];
    mockAlternatives[bid].push(item);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m08/bom-items/:bomItemId/alternatives/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<AlternativeMaterial>;
    const bid = params['bomItemId'] as string;
    const items = mockAlternatives[bid] ?? [];
    const idx = items.findIndex((a) => a.id === params['id']);
    if (idx >= 0) Object.assign(items[idx], body);
    return HttpResponse.json(ok(items[idx]));
  }),
  http.delete('/api/m08/bom-items/:bomItemId/alternatives/:id', ({ params }) => {
    const bid = params['bomItemId'] as string;
    const items = mockAlternatives[bid] ?? [];
    const idx = items.findIndex((a) => a.id === params['id']);
    if (idx >= 0) items.splice(idx, 1);
    return HttpResponse.json(ok(null));
  }),
];

export { mockBoms as m08MockBoms, mockVersions as m08MockVersions, mockAlternatives as m08MockAlternatives };
