import { http, HttpResponse } from 'msw';
import type { Quotation, QuotationVersion, Currency } from '@/types/m05';

const now = '2025-01-15T10:00:00Z';

const mockCurrencies: Currency[] = [
  { id: 'cur1', code: 'CNY', name: '人民币', symbol: '¥', rate: 1.0, createdBy: '1', createdAt: now, updatedBy: '1', updatedAt: now },
  { id: 'cur2', code: 'USD', name: '美元', symbol: '$', rate: 7.25, createdBy: '1', createdAt: now, updatedBy: '1', updatedAt: now },
  { id: 'cur3', code: 'EUR', name: '欧元', symbol: '€', rate: 7.88, createdBy: '1', createdAt: now, updatedBy: '1', updatedAt: now },
];

const mockQuotations: Quotation[] = [
  {
    id: 'q1', code: 'QT202501001', inquiryId: 'iq1', customerId: 'c1', customerName: '顺丰物流',
    shelfTypeId: 'st1', shelfTypeName: '横梁式货架', configId: 'cfg1', configName: '标准横梁式 L2700*W1000*H2000 4层500kg',
    quantity: 2000, unitPrice: 1450, totalPrice: 2900000, currencyId: 'cur1', exchangeRate: 1.0,
    costItems: [
      { id: 'ci1', quotationId: 'q1', category: 'material', name: '原材料', amount: 1680000, unit: '元', remark: 'Q235钢材', sortOrder: 1 },
      { id: 'ci2', quotationId: 'q1', category: 'labor', name: '人工费', amount: 420000, unit: '元', remark: '', sortOrder: 2 },
      { id: 'ci3', quotationId: 'q1', category: 'overhead', name: '制造费用', amount: 280000, unit: '元', remark: '', sortOrder: 3 },
      { id: 'ci4', quotationId: 'q1', category: 'logistics', name: '物流费', amount: 160000, unit: '元', remark: '含安装', sortOrder: 4 },
    ],
    margin: 0.22, deliveryDays: 45, validUntil: '2025-03-15', version: 2,
    status: 'active', remark: '', createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now,
  },
  {
    id: 'q2', code: 'QT202501002', inquiryId: 'iq2', customerId: 'c2', customerName: '京东仓储',
    shelfTypeId: 'st2', shelfTypeName: '阁楼式货架', configId: 'cfg2', configName: '2层阁楼 L2000*W800*H4000',
    quantity: 500, unitPrice: 3200, totalPrice: 1600000, currencyId: 'cur1', exchangeRate: 1.0,
    costItems: [
      { id: 'ci5', quotationId: 'q2', category: 'material', name: '原材料', amount: 880000, unit: '元', remark: '', sortOrder: 1 },
      { id: 'ci6', quotationId: 'q2', category: 'labor', name: '人工费', amount: 280000, unit: '元', remark: '', sortOrder: 2 },
      { id: 'ci7', quotationId: 'q2', category: 'overhead', name: '制造费用', amount: 180000, unit: '元', remark: '', sortOrder: 3 },
    ],
    margin: 0.18, deliveryDays: 60, validUntil: '2025-03-01', version: 1,
    status: 'draft', remark: '', createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now,
  },
];

const mockVersions: QuotationVersion[] = [
  { id: 'qv1', quotationId: 'q1', version: 1, unitPrice: 1500, totalPrice: 3000000, margin: 0.20, changedFields: [], remark: '初始报价', createdAt: now, createdBy: '2' },
  { id: 'qv2', quotationId: 'q1', version: 2, unitPrice: 1450, totalPrice: 2900000, margin: 0.22, changedFields: ['unitPrice', 'totalPrice', 'margin'], remark: '调整后报价', createdAt: now, createdBy: '2' },
];

const ok = <T>(data: T) => ({ code: 0, data, message: 'ok' });
const paginated = <T>(items: T[]) => ({ code: 0, data: { items, total: items.length, page: 1, pageSize: 20 }, message: 'ok' });

export const m05Handlers = [
  http.get('/api/m05/quotations', () => HttpResponse.json(paginated(mockQuotations))),
  http.get('/api/m05/quotations/:id', ({ params }) => {
    const item = mockQuotations.find((q) => q.id === params['id']);
    return HttpResponse.json(ok(item));
  }),
  http.post('/api/m05/quotations', async ({ request }) => {
    const body = (await request.json()) as Partial<Quotation>;
    const item = { ...body, id: `q${Date.now()}`, createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now } as Quotation;
    mockQuotations.push(item);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m05/quotations/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Quotation>;
    const idx = mockQuotations.findIndex((q) => q.id === params['id']);
    if (idx >= 0) Object.assign(mockQuotations[idx], body);
    return HttpResponse.json(ok(mockQuotations[idx]));
  }),
  http.delete('/api/m05/quotations/:id', ({ params }) => {
    const idx = mockQuotations.findIndex((q) => q.id === params['id']);
    if (idx >= 0) mockQuotations.splice(idx, 1);
    return HttpResponse.json(ok(null));
  }),
  http.get('/api/m05/quotations/:quotationId/versions', ({ params }) => {
    const items = mockVersions.filter((v) => v.quotationId === params['quotationId']);
    return HttpResponse.json(ok(items));
  }),
  http.get('/api/m05/quotations/:quotationId/compare', ({ params, request }) => {
    const url = new URL(request.url);
    const v1 = Number(url.searchParams.get('v1'));
    const v2 = Number(url.searchParams.get('v2'));
    const version1 = mockVersions.find((v) => v.quotationId === params['quotationId'] && v.version === v1);
    const version2 = mockVersions.find((v) => v.quotationId === params['quotationId'] && v.version === v2);
    return HttpResponse.json(ok({ version1, version2 }));
  }),
  http.get('/api/m05/currencies', () => HttpResponse.json(ok(mockCurrencies))),
  http.get('/api/m05/quotations/:quotationId/cost-items', ({ params }) => {
    const q = mockQuotations.find((q) => q.id === params['quotationId']);
    return HttpResponse.json(ok(q?.costItems ?? []));
  }),
  http.post('/api/m05/quotations/:id/submit', ({ params }) => {
    const idx = mockQuotations.findIndex((q) => q.id === params['id']);
    if (idx >= 0) mockQuotations[idx].status = 'active';
    return HttpResponse.json(ok(mockQuotations[idx]));
  }),
];

export { mockQuotations as m05MockQuotations, mockVersions as m05MockVersions, mockCurrencies as m05MockCurrencies };
