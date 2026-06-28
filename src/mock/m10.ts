import { http, HttpResponse } from 'msw';
import type { WorkOrder, ProcessStep, ScheduleItem, ScanRecord, Equipment, QualityCheck, OeeData, ProcessRoute, MaterialDemand } from '@/types/m10';

const now = '2025-01-15T10:00:00Z';

const mockWorkOrders: WorkOrder[] = [
  { id: 'wo1', code: 'WO202501001', projectId: 'p1', bomId: 'bom1', shelfConfigId: 'cfg1', quantity: 2000, completedQty: 300, priority: 'high', status: 'in_progress', plannedStart: '2025-02-16', plannedEnd: '2025-03-20', actualStart: '2025-02-16', actualEnd: null, createdBy: '3', createdAt: now, updatedBy: '3', updatedAt: now },
  { id: 'wo2', code: 'WO202501002', projectId: 'p1', bomId: 'bom1', shelfConfigId: 'cfg1', quantity: 500, completedQty: 0, priority: 'normal', status: 'pending', plannedStart: '2025-03-01', plannedEnd: '2025-03-25', actualStart: null, actualEnd: null, createdBy: '3', createdAt: now, updatedBy: '3', updatedAt: now },
];

const mockProcessSteps: Record<string, ProcessStep[]> = {
  wo1: [
    { id: 'ps1', workOrderId: 'wo1', stepCode: 'SJ', stepName: '开卷', sequence: 1, equipmentName: '开卷机A', plannedMinutes: 480, actualMinutes: 450, status: 'completed', operatorName: '李四', startedAt: '2025-02-16T08:00:00Z', completedAt: '2025-02-16T15:30:00Z', remark: null },
    { id: 'ps2', workOrderId: 'wo1', stepCode: 'CK', stepName: '冲孔', sequence: 2, equipmentName: '冲孔机A', plannedMinutes: 600, actualMinutes: 320, status: 'in_progress', operatorName: '李四', startedAt: '2025-02-17T08:00:00Z', completedAt: null, remark: null },
    { id: 'ps3', workOrderId: 'wo1', stepCode: 'LW', stepName: '冷弯成型', sequence: 3, equipmentName: '冷弯成型线A', plannedMinutes: 720, actualMinutes: null, status: 'pending', operatorName: null, startedAt: null, completedAt: null, remark: null },
  ],
};

const mockSchedule: ScheduleItem[] = [
  { id: 'sc1', workOrderId: 'wo1', processStepId: 'ps1', equipmentId: 'eq1', equipmentName: '开卷机A', startTime: '2025-02-16T08:00:00Z', endTime: '2025-02-16T16:00:00Z', status: 'completed' },
  { id: 'sc2', workOrderId: 'wo1', processStepId: 'ps2', equipmentId: 'eq2', equipmentName: '冲孔机A', startTime: '2025-02-17T08:00:00Z', endTime: '2025-02-17T18:00:00Z', status: 'started' },
  { id: 'sc3', workOrderId: 'wo1', processStepId: 'ps3', equipmentId: 'eq3', equipmentName: '冷弯成型线A', startTime: '2025-02-18T08:00:00Z', endTime: '2025-02-18T20:00:00Z', status: 'planned' },
];

const mockEquipment: Equipment[] = [
  { id: 'eq1', name: '开卷机A', code: 'SJ-01', type: '开卷', workshop: '一车间', status: 'idle', capacity: 100, currentLoad: 0, nextMaintenance: '2025-02-28', createdBy: '3', createdAt: now, updatedBy: '3', updatedAt: now },
  { id: 'eq2', name: '冲孔机A', code: 'CK-01', type: '冲孔', workshop: '一车间', status: 'running', capacity: 100, currentLoad: 85, nextMaintenance: '2025-03-15', createdBy: '3', createdAt: now, updatedBy: '3', updatedAt: now },
  { id: 'eq3', name: '冷弯成型线A', code: 'LW-01', type: '冷弯成型', workshop: '二车间', status: 'running', capacity: 100, currentLoad: 70, nextMaintenance: '2025-03-10', createdBy: '3', createdAt: now, updatedBy: '3', updatedAt: now },
];

const mockScanRecords: ScanRecord[] = [
  { id: 'sr1', workOrderId: 'wo1', processStepId: 'ps1', operatorId: '3', operatorName: '李四', type: 'start', quantity: 0, defectQty: 0, scannedAt: '2025-02-16T08:00:00Z', remark: '' },
  { id: 'sr2', workOrderId: 'wo1', processStepId: 'ps1', operatorId: '3', operatorName: '李四', type: 'complete', quantity: 500, defectQty: 3, scannedAt: '2025-02-16T15:30:00Z', remark: '' },
];

const mockQualityChecks: QualityCheck[] = [
  { id: 'qc1', workOrderId: 'wo1', processStepId: 'ps1', inspectorId: '4', inspectorName: '质检员A', type: 'in_process', result: 'pass', defects: [], checkedAt: '2025-02-16T15:00:00Z', remark: '' },
];

const mockOee: OeeData[] = [
  { id: 'oee1', equipmentId: 'eq2', equipmentName: '冲孔机A', date: '2025-02-17', availability: 0.92, performance: 0.88, quality: 0.97, oee: 0.79, plannedTime: 480, runTime: 442, idealCycle: 1.2, actualCycle: 1.36, totalOutput: 325, goodOutput: 315 },
  { id: 'oee2', equipmentId: 'eq3', equipmentName: '冷弯成型线A', date: '2025-02-17', availability: 0.95, performance: 0.91, quality: 0.99, oee: 0.86, plannedTime: 480, runTime: 456, idealCycle: 2.0, actualCycle: 2.2, totalOutput: 207, goodOutput: 205 },
];

const mockProcessRoutes: ProcessRoute[] = [
  { id: 'pr1', name: '横梁式货架标准工艺', shelfTypeId: 'st1', steps: [
    { stepCode: 'SJ', stepName: '开卷', sequence: 1, equipmentType: '开卷机', standardMinutes: 480, dependency: null },
    { stepCode: 'CK', stepName: '冲孔', sequence: 2, equipmentType: '冲孔机', standardMinutes: 600, dependency: 'SJ' },
    { stepCode: 'LW', stepName: '冷弯成型', sequence: 3, equipmentType: '冷弯成型线', standardMinutes: 720, dependency: 'CK' },
  ], createdBy: '1', createdAt: now, updatedBy: '1', updatedAt: now },
];

const mockMaterialDemands: Record<string, MaterialDemand[]> = {
  wo1: [
    { id: 'md1', workOrderId: 'wo1', bomItemId: 'bi1', material: 'Q235', spec: '90*70*2.0', requiredQty: 10000, availableQty: 8500, shortageQty: 1500, unit: '件', plannedDate: '2025-02-16', status: 'shortage' },
    { id: 'md2', workOrderId: 'wo1', bomItemId: 'bi2', material: 'Q235', spec: '120*50*1.5', requiredQty: 16000, availableQty: 16000, shortageQty: 0, unit: '件', plannedDate: '2025-02-18', status: 'allocated' },
  ],
};

const ok = <T>(data: T) => ({ code: 0, data, message: 'ok' });
const paginated = <T>(items: T[]) => ({ code: 0, data: { items, total: items.length, page: 1, pageSize: 20 }, message: 'ok' });

export const m10Handlers = [
  http.get('/api/m10/work-orders', () => HttpResponse.json(paginated(mockWorkOrders))),
  http.get('/api/m10/work-orders/:id', ({ params }) => {
    const item = mockWorkOrders.find((w) => w.id === params['id']);
    return HttpResponse.json(ok(item));
  }),
  http.post('/api/m10/work-orders', async ({ request }) => {
    const body = (await request.json()) as Partial<WorkOrder>;
    const item = { ...body, id: `wo${Date.now()}`, audit: { createdBy: '3', createdAt: now, updatedBy: '3', updatedAt: now } } as WorkOrder;
    mockWorkOrders.push(item);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m10/work-orders/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<WorkOrder>;
    const idx = mockWorkOrders.findIndex((w) => w.id === params['id']);
    if (idx >= 0) Object.assign(mockWorkOrders[idx], body);
    return HttpResponse.json(ok(mockWorkOrders[idx]));
  }),
  http.delete('/api/m10/work-orders/:id', ({ params }) => {
    const idx = mockWorkOrders.findIndex((w) => w.id === params['id']);
    if (idx >= 0) mockWorkOrders.splice(idx, 1);
    return HttpResponse.json(ok(null));
  }),
  http.post('/api/m10/work-orders/:id/release', ({ params }) => {
    const idx = mockWorkOrders.findIndex((w) => w.id === params['id']);
    if (idx >= 0) mockWorkOrders[idx].status = 'released';
    return HttpResponse.json(ok(mockWorkOrders[idx]));
  }),
  http.get('/api/m10/work-orders/:workOrderId/process-steps', ({ params }) => {
    const items = mockProcessSteps[params['workOrderId'] as string] ?? [];
    return HttpResponse.json(ok(items));
  }),
  http.get('/api/m10/schedule', () => HttpResponse.json(paginated(mockSchedule))),
  http.put('/api/m10/schedule/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<ScheduleItem>;
    const idx = mockSchedule.findIndex((s) => s.id === params['id']);
    if (idx >= 0) Object.assign(mockSchedule[idx], body);
    return HttpResponse.json(ok(mockSchedule[idx]));
  }),
  http.get('/api/m10/scan-records', () => HttpResponse.json(paginated(mockScanRecords))),
  http.post('/api/m10/scan-records', async ({ request }) => {
    const body = (await request.json()) as Partial<ScanRecord>;
    const item = { ...body, id: `sr${Date.now()}` } as ScanRecord;
    mockScanRecords.push(item);
    return HttpResponse.json(ok(item));
  }),
  http.get('/api/m10/equipment', () => HttpResponse.json(paginated(mockEquipment))),
  http.get('/api/m10/equipment/:id', ({ params }) => {
    const item = mockEquipment.find((e) => e.id === params['id']);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m10/equipment/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Equipment>;
    const idx = mockEquipment.findIndex((e) => e.id === params['id']);
    if (idx >= 0) Object.assign(mockEquipment[idx], body);
    return HttpResponse.json(ok(mockEquipment[idx]));
  }),
  http.get('/api/m10/quality-checks', () => HttpResponse.json(paginated(mockQualityChecks))),
  http.post('/api/m10/quality-checks', async ({ request }) => {
    const body = (await request.json()) as Partial<QualityCheck>;
    const item = { ...body, id: `qc${Date.now()}` } as QualityCheck;
    mockQualityChecks.push(item);
    return HttpResponse.json(ok(item));
  }),
  http.get('/api/m10/oee', () => HttpResponse.json(paginated(mockOee))),
  http.get('/api/m10/process-routes', ({ request }) => {
    const url = new URL(request.url);
    const shelfTypeId = url.searchParams.get('shelfTypeId');
    const items = shelfTypeId ? mockProcessRoutes.filter((r) => r.shelfTypeId === shelfTypeId) : mockProcessRoutes;
    return HttpResponse.json(ok(items));
  }),
  http.post('/api/m10/process-routes', async ({ request }) => {
    const body = (await request.json()) as Partial<ProcessRoute>;
    const item = { ...body, id: `pr${Date.now()}`, audit: { createdBy: '1', createdAt: now, updatedBy: '1', updatedAt: now } } as ProcessRoute;
    mockProcessRoutes.push(item);
    return HttpResponse.json(ok(item));
  }),
  http.get('/api/m10/work-orders/:workOrderId/material-demands', ({ params }) => {
    const items = mockMaterialDemands[params['workOrderId'] as string] ?? [];
    return HttpResponse.json(ok(items));
  }),
];

export { mockWorkOrders as m10MockWorkOrders, mockEquipment as m10MockEquipment, mockOee as m10MockOee, mockSchedule as m10MockSchedule };
