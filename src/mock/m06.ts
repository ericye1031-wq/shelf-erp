import { http, HttpResponse } from 'msw';
import type { Contract, PaymentPlan, Invoice } from '@/types/m06';

const now = '2025-01-15T10:00:00Z';

const mockContracts: Contract[] = [
  { id: 'ct1', code: 'CT202501001', quotationId: 'q1', projectId: 'p1', customerId: 'c1', customerName: '顺丰物流', title: '华东分拨中心货架采购合同', amount: 2900000, currencyId: 'cur1', signDate: '2025-01-20', deliveryDate: '2025-04-01', paymentTerms: '3-6-1', status: 'executing', terms: '预付30%，发货前60%，验收后10%', paidAmount: 870000, invoiceAmount: 870000, createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now },
  { id: 'ct2', code: 'CT202501002', quotationId: 'q2', projectId: 'p1', customerId: 'c2', customerName: '京东仓储', title: '南京仓扩建货架合同', amount: 1600000, currencyId: 'cur1', signDate: '2025-02-01', deliveryDate: '2025-05-01', paymentTerms: '3-6-1', status: 'reviewing', terms: '预付30%，发货前60%，验收后10%', paidAmount: 0, invoiceAmount: 0, createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now },
];

const mockPayments: Record<string, PaymentPlan[]> = {
  ct1: [
    { id: 'pay1', contractId: 'ct1', stage: '预付款', amount: 870000, ratio: 0.3, plannedDate: '2025-01-25', actualDate: '2025-01-26', status: 'paid', remark: '', createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now },
    { id: 'pay2', contractId: 'ct1', stage: '发货款', amount: 1740000, ratio: 0.6, plannedDate: '2025-03-25', actualDate: null, status: 'pending', remark: '', createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now },
    { id: 'pay3', contractId: 'ct1', stage: '验收款', amount: 290000, ratio: 0.1, plannedDate: '2025-04-15', actualDate: null, status: 'pending', remark: '', createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now },
  ],
};

const mockInvoices: Record<string, Invoice[]> = {
  ct1: [
    { id: 'inv1', contractId: 'ct1', code: 'INV202501001', type: 'special', amount: 870000, taxRate: 0.13, taxAmount: 113100, issuedDate: '2025-01-28', status: 'issued', remark: '', createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now },
  ],
};

const ok = <T>(data: T) => ({ code: 0, data, message: 'ok' });
const paginated = <T>(items: T[]) => ({ code: 0, data: { items, total: items.length, page: 1, pageSize: 20 }, message: 'ok' });

export const m06Handlers = [
  http.get('/api/m06/contracts', () => HttpResponse.json(paginated(mockContracts))),
  http.get('/api/m06/contracts/:id', ({ params }) => {
    const item = mockContracts.find((c) => c.id === params['id']);
    return HttpResponse.json(ok(item));
  }),
  http.post('/api/m06/contracts', async ({ request }) => {
    const body = (await request.json()) as Partial<Contract>;
    const item = { ...body, id: `ct${Date.now()}`, createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now } as Contract;
    mockContracts.push(item);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m06/contracts/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Contract>;
    const idx = mockContracts.findIndex((c) => c.id === params['id']);
    if (idx >= 0) Object.assign(mockContracts[idx], body);
    return HttpResponse.json(ok(mockContracts[idx]));
  }),
  http.delete('/api/m06/contracts/:id', ({ params }) => {
    const idx = mockContracts.findIndex((c) => c.id === params['id']);
    if (idx >= 0) mockContracts.splice(idx, 1);
    return HttpResponse.json(ok(null));
  }),
  http.post('/api/m06/contracts/:id/submit', ({ params }) => {
    const idx = mockContracts.findIndex((c) => c.id === params['id']);
    if (idx >= 0) mockContracts[idx].status = 'reviewing';
    return HttpResponse.json(ok(mockContracts[idx]));
  }),
  http.post('/api/m06/contracts/:id/approve', ({ params }) => {
    const idx = mockContracts.findIndex((c) => c.id === params['id']);
    if (idx >= 0) mockContracts[idx].status = 'executing';
    return HttpResponse.json(ok(mockContracts[idx]));
  }),
  http.get('/api/m06/contracts/:contractId/payments', ({ params }) => {
    const items = mockPayments[params['contractId'] as string] ?? [];
    return HttpResponse.json(ok(items));
  }),
  http.post('/api/m06/contracts/:contractId/payments', async ({ params, request }) => {
    const body = (await request.json()) as Partial<PaymentPlan>;
    const item = { ...body, id: `pay${Date.now()}`, contractId: params['contractId'] as string, createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now } as PaymentPlan;
    const cid = params['contractId'] as string;
    if (!mockPayments[cid]) mockPayments[cid] = [];
    mockPayments[cid].push(item);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m06/contracts/:contractId/payments/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<PaymentPlan>;
    const cid = params['contractId'] as string;
    const payments = mockPayments[cid] ?? [];
    const idx = payments.findIndex((p) => p.id === params['id']);
    if (idx >= 0) Object.assign(payments[idx], body);
    return HttpResponse.json(ok(payments[idx]));
  }),
  http.post('/api/m06/contracts/:contractId/payments/:id/confirm', async ({ params, request }) => {
    const body = (await request.json()) as { actualDate: string };
    const cid = params['contractId'] as string;
    const payments = mockPayments[cid] ?? [];
    const idx = payments.findIndex((p) => p.id === params['id']);
    if (idx >= 0) { payments[idx].actualDate = body.actualDate; payments[idx].status = 'paid'; }
    return HttpResponse.json(ok(payments[idx]));
  }),
  http.get('/api/m06/contracts/:contractId/invoices', ({ params }) => {
    const items = mockInvoices[params['contractId'] as string] ?? [];
    return HttpResponse.json(ok(items));
  }),
  http.post('/api/m06/contracts/:contractId/invoices', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Invoice>;
    const item = { ...body, id: `inv${Date.now()}`, contractId: params['contractId'] as string, createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now } as Invoice;
    const cid = params['contractId'] as string;
    if (!mockInvoices[cid]) mockInvoices[cid] = [];
    mockInvoices[cid].push(item);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m06/contracts/:contractId/invoices/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Invoice>;
    const cid = params['contractId'] as string;
    const invoices = mockInvoices[cid] ?? [];
    const idx = invoices.findIndex((i) => i.id === params['id']);
    if (idx >= 0) Object.assign(invoices[idx], body);
    return HttpResponse.json(ok(invoices[idx]));
  }),
];

export { mockContracts as m06MockContracts, mockPayments as m06MockPayments, mockInvoices as m06MockInvoices };
