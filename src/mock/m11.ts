import { http, HttpResponse } from 'msw';
import type { Warehouse, WarehouseLocation, Batch, InventoryItem, PdaOperation } from '@/types/m11';

const now = '2025-01-15T10:00:00Z';

const mockWarehouses: Warehouse[] = [
  { id: 'wh1', name: '原料仓A', code: 'YL-A', type: '原料仓', address: '一车间北侧', managerId: '5', managerName: '仓管员A', status: 'active', audit: { createdBy: '3', createdAt: now, updatedBy: '3', updatedAt: now } },
  { id: 'wh2', name: '成品仓B', code: 'CP-B', type: '成品仓', address: '二车间南侧', managerId: '6', managerName: '仓管员B', status: 'active', audit: { createdBy: '3', createdAt: now, updatedBy: '3', updatedAt: now } },
  { id: 'wh3', name: '半成品仓C', code: 'BCP-C', type: '半成品仓', address: '二车间东侧', managerId: '5', managerName: '仓管员A', status: 'active', audit: { createdBy: '3', createdAt: now, updatedBy: '3', updatedAt: now } },
];

const mockLocations: Record<string, WarehouseLocation[]> = {
  wh1: [
    { id: 'loc1', warehouseId: 'wh1', code: 'YL-A-01-01', name: 'A区1排1列', zone: 'A', row: '1', column: '1', layer: '1', type: 'storage', status: 'active' },
    { id: 'loc2', warehouseId: 'wh1', code: 'YL-A-01-02', name: 'A区1排2列', zone: 'A', row: '1', column: '2', layer: '1', type: 'storage', status: 'active' },
  ],
  wh2: [
    { id: 'loc3', warehouseId: 'wh2', code: 'CP-B-01-01', name: 'B区1排1列', zone: 'B', row: '1', column: '1', layer: '1', type: 'storage', status: 'active' },
  ],
};

const mockBatches: Batch[] = [
  { id: 'b1', code: 'BT202501001', material: 'Q235', spec: '90*70*2.0', supplier: '宝钢', quantity: 10000, remainingQty: 8500, unit: '件', productionDate: '2025-01-10', expiryDate: null, status: 'qualified', locationId: 'loc1', locationCode: 'YL-A-01-01', audit: { createdBy: '5', createdAt: now, updatedBy: '5', updatedAt: now } },
  { id: 'b2', code: 'BT202501002', material: 'Q235', spec: '120*50*1.5', supplier: '沙钢', quantity: 20000, remainingQty: 16000, unit: '件', productionDate: '2025-01-08', expiryDate: null, status: 'qualified', locationId: 'loc2', locationCode: 'YL-A-01-02', audit: { createdBy: '5', createdAt: now, updatedBy: '5', updatedAt: now } },
];

const mockInventory: InventoryItem[] = [
  { id: 'inv1', material: 'Q235', spec: '90*70*2.0', warehouseId: 'wh1', warehouseName: '原料仓A', locationId: 'loc1', locationCode: 'YL-A-01-01', batchId: 'b1', batchCode: 'BT202501001', quantity: 8500, unit: '件', safetyStock: 5000, status: 'normal', lastUpdated: now },
  { id: 'inv2', material: 'Q235', spec: '120*50*1.5', warehouseId: 'wh1', warehouseName: '原料仓A', locationId: 'loc2', locationCode: 'YL-A-01-02', batchId: 'b2', batchCode: 'BT202501002', quantity: 16000, unit: '件', safetyStock: 10000, status: 'normal', lastUpdated: now },
  { id: 'inv3', material: 'Q235', spec: '2.7m层板', warehouseId: 'wh2', warehouseName: '成品仓B', locationId: 'loc3', locationCode: 'CP-B-01-01', batchId: '', batchCode: '', quantity: 300, unit: '件', safetyStock: 200, status: 'normal', lastUpdated: now },
];

const mockPdaOps: PdaOperation[] = [
  { id: 'pda1', type: 'inbound', operatorId: '5', operatorName: '仓管员A', warehouseId: 'wh1', locationId: 'loc1', batchId: 'b1', material: 'Q235', spec: '90*70*2.0', quantity: 10000, unit: '件', referenceNo: 'PO202501001', operatedAt: '2025-01-10T09:00:00Z', remark: '宝钢来料入库' },
  { id: 'pda2', type: 'outbound', operatorId: '5', operatorName: '仓管员A', warehouseId: 'wh1', locationId: 'loc1', batchId: 'b1', material: 'Q235', spec: '90*70*2.0', quantity: 1500, unit: '件', referenceNo: 'WO202501001', operatedAt: '2025-02-16T08:30:00Z', remark: '工单领料' },
];

const ok = <T>(data: T) => ({ code: 0, data, message: 'ok' });
const paginated = <T>(items: T[]) => ({ code: 0, data: { items, total: items.length, page: 1, pageSize: 20 }, message: 'ok' });

export const m11Handlers = [
  http.get('/api/m11/warehouses', () => HttpResponse.json(paginated(mockWarehouses))),
  http.get('/api/m11/warehouses/:id', ({ params }) => {
    const item = mockWarehouses.find((w) => w.id === params['id']);
    return HttpResponse.json(ok(item));
  }),
  http.post('/api/m11/warehouses', async ({ request }) => {
    const body = (await request.json()) as Partial<Warehouse>;
    const item = { ...body, id: `wh${Date.now()}`, audit: { createdBy: '3', createdAt: now, updatedBy: '3', updatedAt: now } } as Warehouse;
    mockWarehouses.push(item);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m11/warehouses/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Warehouse>;
    const idx = mockWarehouses.findIndex((w) => w.id === params['id']);
    if (idx >= 0) Object.assign(mockWarehouses[idx], body);
    return HttpResponse.json(ok(mockWarehouses[idx]));
  }),
  http.delete('/api/m11/warehouses/:id', ({ params }) => {
    const idx = mockWarehouses.findIndex((w) => w.id === params['id']);
    if (idx >= 0) mockWarehouses.splice(idx, 1);
    return HttpResponse.json(ok(null));
  }),
  http.get('/api/m11/warehouses/:warehouseId/locations', ({ params }) => {
    const items = mockLocations[params['warehouseId'] as string] ?? [];
    return HttpResponse.json(ok(items));
  }),
  http.post('/api/m11/warehouses/:warehouseId/locations', async ({ params, request }) => {
    const body = (await request.json()) as Partial<WarehouseLocation>;
    const item = { ...body, id: `loc${Date.now()}`, warehouseId: params['warehouseId'] as string } as WarehouseLocation;
    const wid = params['warehouseId'] as string;
    if (!mockLocations[wid]) mockLocations[wid] = [];
    mockLocations[wid].push(item);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m11/warehouses/:warehouseId/locations/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<WarehouseLocation>;
    const wid = params['warehouseId'] as string;
    const items = mockLocations[wid] ?? [];
    const idx = items.findIndex((l) => l.id === params['id']);
    if (idx >= 0) Object.assign(items[idx], body);
    return HttpResponse.json(ok(items[idx]));
  }),
  http.get('/api/m11/batches', () => HttpResponse.json(paginated(mockBatches))),
  http.get('/api/m11/batches/:id', ({ params }) => {
    const item = mockBatches.find((b) => b.id === params['id']);
    return HttpResponse.json(ok(item));
  }),
  http.post('/api/m11/batches', async ({ request }) => {
    const body = (await request.json()) as Partial<Batch>;
    const item = { ...body, id: `b${Date.now()}`, audit: { createdBy: '5', createdAt: now, updatedBy: '5', updatedAt: now } } as Batch;
    mockBatches.push(item);
    return HttpResponse.json(ok(item));
  }),
  http.get('/api/m11/inventory', () => HttpResponse.json(paginated(mockInventory))),
  http.get('/api/m11/pda-operations', () => HttpResponse.json(paginated(mockPdaOps))),
  http.post('/api/m11/pda-operations', async ({ request }) => {
    const body = (await request.json()) as Partial<PdaOperation>;
    const item = { ...body, id: `pda${Date.now()}` } as PdaOperation;
    mockPdaOps.push(item);
    return HttpResponse.json(ok(item));
  }),
];

export { mockWarehouses as m11MockWarehouses, mockBatches as m11MockBatches, mockInventory as m11MockInventory };
