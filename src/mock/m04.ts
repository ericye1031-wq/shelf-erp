import { http, HttpResponse } from 'msw';
import type { ShelfType, ShelfConfig, Specification, BomCalcResult, SpecMatchResult } from '@/types/m04';

const now = '2025-01-15T10:00:00Z';

const mockShelfTypes: ShelfType[] = [
  {
    id: 'st1', name: '横梁式货架', code: 'HBS', category: 'heavy', description: '最常用的重型货架',
    parameterTemplate: [
      { key: 'length', label: '长度(m)', type: 'number', unit: 'm', required: true, defaultValue: 2.7, min: 0.5, max: 12 },
      { key: 'width', label: '宽度(m)', type: 'number', unit: 'm', required: true, defaultValue: 1.0, min: 0.3, max: 1.5 },
      { key: 'height', label: '高度(m)', type: 'number', unit: 'm', required: true, defaultValue: 2.0, min: 1.0, max: 12 },
      { key: 'layers', label: '层数', type: 'number', unit: '层', required: true, defaultValue: 4, min: 2, max: 8 },
      { key: 'loadPerLayer', label: '层载(kg)', type: 'number', unit: 'kg', required: true, defaultValue: 500, min: 100, max: 5000 },
    ],
    status: 'active', audit: { createdBy: '1', createdAt: now, updatedBy: '1', updatedAt: now },
  },
  {
    id: 'st2', name: '阁楼式货架', code: 'GLS', category: 'medium', description: '双层/多层阁楼货架',
    parameterTemplate: [
      { key: 'length', label: '长度(m)', type: 'number', unit: 'm', required: true, defaultValue: 2.0, min: 1, max: 10 },
      { key: 'width', label: '宽度(m)', type: 'number', unit: 'm', required: true, defaultValue: 0.8, min: 0.5, max: 1.2 },
      { key: 'height', label: '总高度(m)', type: 'number', unit: 'm', required: true, defaultValue: 4.0, min: 3, max: 8 },
      { key: 'floors', label: '楼层数', type: 'number', unit: '层', required: true, defaultValue: 2, min: 2, max: 3 },
      { key: 'loadPerFloor', label: '楼面承重(kg/m²)', type: 'number', unit: 'kg/m²', required: true, defaultValue: 500, min: 200, max: 1000 },
    ],
    status: 'active', audit: { createdBy: '1', createdAt: now, updatedBy: '1', updatedAt: now },
  },
];

const mockConfigs: ShelfConfig[] = [
  { id: 'cfg1', shelfTypeId: 'st1', shelfTypeName: '横梁式货架', name: '标准横梁式 L2700*W1000*H2000 4层500kg', parameters: { length: 2.7, width: 1.0, height: 2.0, layers: 4, loadPerLayer: 500 }, status: 'active', audit: { createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now } },
  { id: 'cfg2', shelfTypeId: 'st2', shelfTypeName: '阁楼式货架', name: '2层阁楼 L2000*W800*H4000', parameters: { length: 2.0, width: 0.8, height: 4.0, floors: 2, loadPerFloor: 500 }, status: 'active', audit: { createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now } },
];

const mockSpecs: Specification[] = [
  {
    id: 'spec1', shelfTypeId: 'st1', name: '标准横梁式规格',
    parameterConstraints: { length: { min: 2.0, max: 3.0 }, width: { min: 0.8, max: 1.2 }, loadPerLayer: { min: 300, max: 1000 } },
    structureTemplate: [
      { partCode: 'P01', partName: '立柱', material: 'Q235', quantityFormula: 'layers + 1', lengthFormula: 'height', unit: '件' },
      { partCode: 'P02', partName: '横梁', material: 'Q235', quantityFormula: 'layers * 2', lengthFormula: 'width', unit: '件' },
      { partCode: 'P03', partName: '层板', material: 'Q235', quantityFormula: 'layers', lengthFormula: 'length', unit: '件' },
    ],
    audit: { createdBy: '1', createdAt: now, updatedBy: '1', updatedAt: now },
  },
];

const ok = <T>(data: T) => ({ code: 0, data, message: 'ok' });
const paginated = <T>(items: T[]) => ({ code: 0, data: { items, total: items.length, page: 1, pageSize: 20 }, message: 'ok' });

export const m04Handlers = [
  http.get('/api/m04/shelf-types', () => HttpResponse.json(paginated(mockShelfTypes))),
  http.get('/api/m04/shelf-types/:id', ({ params }) => {
    const item = mockShelfTypes.find((s) => s.id === params['id']);
    return HttpResponse.json(ok(item));
  }),
  http.post('/api/m04/shelf-types', async ({ request }) => {
    const body = (await request.json()) as Partial<ShelfType>;
    const item = { ...body, id: `st${Date.now()}`, audit: { createdBy: '1', createdAt: now, updatedBy: '1', updatedAt: now } } as ShelfType;
    mockShelfTypes.push(item);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m04/shelf-types/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<ShelfType>;
    const idx = mockShelfTypes.findIndex((s) => s.id === params['id']);
    if (idx >= 0) Object.assign(mockShelfTypes[idx], body);
    return HttpResponse.json(ok(mockShelfTypes[idx]));
  }),
  http.delete('/api/m04/shelf-types/:id', ({ params }) => {
    const idx = mockShelfTypes.findIndex((s) => s.id === params['id']);
    if (idx >= 0) mockShelfTypes.splice(idx, 1);
    return HttpResponse.json(ok(null));
  }),
  http.get('/api/m04/configs', () => HttpResponse.json(paginated(mockConfigs))),
  http.get('/api/m04/configs/:id', ({ params }) => {
    const item = mockConfigs.find((c) => c.id === params['id']);
    return HttpResponse.json(ok(item));
  }),
  http.post('/api/m04/configs', async ({ request }) => {
    const body = (await request.json()) as Partial<ShelfConfig>;
    const item = { ...body, id: `cfg${Date.now()}`, audit: { createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now } } as ShelfConfig;
    mockConfigs.push(item);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m04/configs/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<ShelfConfig>;
    const idx = mockConfigs.findIndex((c) => c.id === params['id']);
    if (idx >= 0) Object.assign(mockConfigs[idx], body);
    return HttpResponse.json(ok(mockConfigs[idx]));
  }),
  http.delete('/api/m04/configs/:id', ({ params }) => {
    const idx = mockConfigs.findIndex((c) => c.id === params['id']);
    if (idx >= 0) mockConfigs.splice(idx, 1);
    return HttpResponse.json(ok(null));
  }),
  http.post('/api/m04/configs/:configId/calculate-bom', () => {
    const result: BomCalcResult = {
      configId: 'cfg1', shelfTypeName: '横梁式货架', parameters: { length: 2.7, width: 1.0, height: 2.0, layers: 4, loadPerLayer: 500 },
      items: [
        { partCode: 'P01', partName: '立柱', material: 'Q235', quantity: 5, unit: '件', length: 2.0, unitWeight: 12.5, unitCost: 62.5, totalCost: 312.5, wasteRate: 0.03, category: 'main', isAccessory: false },
        { partCode: 'P02', partName: '横梁', material: 'Q235', quantity: 8, unit: '件', length: 1.0, unitWeight: 5.8, unitCost: 29.0, totalCost: 232.0, wasteRate: 0.02, category: 'main', isAccessory: false },
        { partCode: 'P03', partName: '层板', material: 'Q235', quantity: 4, unit: '件', length: 2.7, unitWeight: 28.0, unitCost: 140.0, totalCost: 560.0, wasteRate: 0.05, category: 'main', isAccessory: false },
      ],
      totalWeight: 237.7, totalCost: 1104.5, calculatedAt: now,
    };
    return HttpResponse.json(ok(result));
  }),
  http.get('/api/m04/shelf-types/:shelfTypeId/specifications', ({ params }) => {
    const items = mockSpecs.filter((s) => s.shelfTypeId === params['shelfTypeId']);
    return HttpResponse.json(ok(items));
  }),
  http.post('/api/m04/specifications', async ({ request }) => {
    const body = (await request.json()) as Partial<Specification>;
    const item = { ...body, id: `spec${Date.now()}`, audit: { createdBy: '1', createdAt: now, updatedBy: '1', updatedAt: now } } as Specification;
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m04/specifications/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Specification>;
    const idx = mockSpecs.findIndex((s) => s.id === params['id']);
    if (idx >= 0) Object.assign(mockSpecs[idx], body);
    return HttpResponse.json(ok(mockSpecs[idx]));
  }),
  http.post('/api/m04/configs/:configId/match-spec', () => {
    const result: SpecMatchResult = { matched: true, specification: mockSpecs[0] || null, unmatchedParams: [] };
    return HttpResponse.json(ok(result));
  }),
];

export { mockShelfTypes as m04MockShelfTypes, mockConfigs as m04MockConfigs, mockSpecs as m04MockSpecs };
