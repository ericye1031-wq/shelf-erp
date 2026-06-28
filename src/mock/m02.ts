import { http, HttpResponse } from 'msw';
import type { Customer, Contact, Opportunity, Inquiry, FollowUp } from '@/types/m02';

const now = '2025-01-15T10:00:00Z';

const mockCustomers: Customer[] = [
  { id: 'c1', name: '顺丰物流有限公司', code: 'SF001', shortName: '顺丰', type: 'direct', industry: '物流', region: '华东', level: 'A', source: '展会', status: 'active', createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now, projectId: 'p1' },
  { id: 'c2', name: '京东仓储科技有限公司', code: 'JD001', shortName: '京东仓储', type: 'direct', industry: '电商仓储', region: '华东', level: 'A', source: '老客户推荐', status: 'active', createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now, projectId: 'p1' },
  { id: 'c3', name: '中储股份南京分公司', code: 'ZC001', shortName: '中储', type: 'agent', industry: '仓储', region: '华东', level: 'B', source: '电话营销', status: 'active', createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now, projectId: 'p1' },
];

const mockContacts: Contact[] = [
  { id: 'ct1', customerId: 'c1', name: '王经理', position: '采购经理', phone: '13900000001', email: 'wang@sf.com', isPrimary: true, remark: '', createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now },
  { id: 'ct2', customerId: 'c1', name: '赵主管', position: '仓储主管', phone: '13900000002', email: 'zhao@sf.com', isPrimary: false, remark: '', createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now },
  { id: 'ct3', customerId: 'c2', name: '刘总监', position: '运营总监', phone: '13900000003', email: 'liu@jd.com', isPrimary: true, remark: '', createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now },
];

const mockOpportunities: Opportunity[] = [
  { id: 'op1', customerId: 'c1', customerName: '顺丰物流', title: '华东分拨中心货架项目', amount: 580000, stage: 'proposal', probability: 0.6, expectedDate: '2025-03-01', description: '需要横梁式货架约2000组', status: 'active', createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now, projectId: 'p1' },
  { id: 'op2', customerId: 'c2', customerName: '京东仓储', title: '南京仓扩建项目', amount: 1200000, stage: 'negotiation', probability: 0.8, expectedDate: '2025-02-15', description: '阁楼式货架3层方案', status: 'active', createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now, projectId: 'p1' },
];

const mockInquiries: Inquiry[] = [
  { id: 'iq1', code: 'INQ202501001', customerId: 'c1', customerName: '顺丰物流', opportunityId: 'op1', shelfType: '横梁式货架', requirement: '层高2m，5层，承重500kg/层', quantity: 2000, unit: '组', deliveryDate: '2025-04-01', status: 'active', createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now, projectId: 'p1' },
  { id: 'iq2', code: 'INQ202501002', customerId: 'c2', customerName: '京东仓储', opportunityId: 'op2', shelfType: '阁楼式货架', requirement: '3层阁楼，每层承重800kg', quantity: 500, unit: '组', deliveryDate: '2025-03-15', status: 'active', createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now, projectId: 'p1' },
];

const mockFollowups: FollowUp[] = [
  { id: 'fu1', customerId: 'c1', opportunityId: 'op1', type: 'visit', content: '现场勘测完成，确认仓库尺寸', nextAction: '提交方案', nextDate: '2025-01-20', createdBy: '2', createdAt: now },
  { id: 'fu2', customerId: 'c2', opportunityId: 'op2', type: 'call', content: '电话沟通技术参数变更', nextAction: '更新报价', nextDate: '2025-01-18', createdBy: '2', createdAt: now },
];

const ok = <T>(data: T) => ({ code: 0, data, message: 'ok' });
const paginated = <T>(items: T[]) => ({ code: 0, data: { items, total: items.length, page: 1, pageSize: 20 }, message: 'ok' });

export const m02Handlers = [
  http.get('/api/m02/customers', () => HttpResponse.json(paginated(mockCustomers))),
  http.get('/api/m02/customers/:id', ({ params }) => {
    const item = mockCustomers.find((c) => c.id === params['id']);
    return HttpResponse.json(ok(item));
  }),
  http.post('/api/m02/customers', async ({ request }) => {
    const body = (await request.json()) as Partial<Customer>;
    const item = { ...body, id: `c${Date.now()}`, createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now } as Customer;
    mockCustomers.push(item);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m02/customers/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Customer>;
    const idx = mockCustomers.findIndex((c) => c.id === params['id']);
    if (idx >= 0) Object.assign(mockCustomers[idx], body);
    return HttpResponse.json(ok(mockCustomers[idx]));
  }),
  http.delete('/api/m02/customers/:id', ({ params }) => {
    const idx = mockCustomers.findIndex((c) => c.id === params['id']);
    if (idx >= 0) mockCustomers.splice(idx, 1);
    return HttpResponse.json(ok(null));
  }),
  http.get('/api/m02/customers/:customerId/contacts', ({ params }) => {
    const items = mockContacts.filter((ct) => ct.customerId === params['customerId']);
    return HttpResponse.json(ok(items));
  }),
  http.post('/api/m02/customers/:customerId/contacts', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Contact>;
    const item = { ...body, id: `ct${Date.now()}`, customerId: params['customerId'] as string, createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now } as Contact;
    mockContacts.push(item);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m02/customers/:customerId/contacts/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Contact>;
    const idx = mockContacts.findIndex((ct) => ct.id === params['id']);
    if (idx >= 0) Object.assign(mockContacts[idx], body);
    return HttpResponse.json(ok(mockContacts[idx]));
  }),
  http.delete('/api/m02/customers/:customerId/contacts/:id', ({ params }) => {
    const idx = mockContacts.findIndex((ct) => ct.id === params['id']);
    if (idx >= 0) mockContacts.splice(idx, 1);
    return HttpResponse.json(ok(null));
  }),
  http.get('/api/m02/opportunities', () => HttpResponse.json(paginated(mockOpportunities))),
  http.get('/api/m02/opportunities/:id', ({ params }) => {
    const item = mockOpportunities.find((o) => o.id === params['id']);
    return HttpResponse.json(ok(item));
  }),
  http.post('/api/m02/opportunities', async ({ request }) => {
    const body = (await request.json()) as Partial<Opportunity>;
    const item = { ...body, id: `op${Date.now()}`, createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now } as Opportunity;
    mockOpportunities.push(item);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m02/opportunities/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Opportunity>;
    const idx = mockOpportunities.findIndex((o) => o.id === params['id']);
    if (idx >= 0) Object.assign(mockOpportunities[idx], body);
    return HttpResponse.json(ok(mockOpportunities[idx]));
  }),
  http.delete('/api/m02/opportunities/:id', ({ params }) => {
    const idx = mockOpportunities.findIndex((o) => o.id === params['id']);
    if (idx >= 0) mockOpportunities.splice(idx, 1);
    return HttpResponse.json(ok(null));
  }),
  http.get('/api/m02/inquiries', () => HttpResponse.json(paginated(mockInquiries))),
  http.get('/api/m02/inquiries/:id', ({ params }) => {
    const item = mockInquiries.find((i) => i.id === params['id']);
    return HttpResponse.json(ok(item));
  }),
  http.post('/api/m02/inquiries', async ({ request }) => {
    const body = (await request.json()) as Partial<Inquiry>;
    const item = { ...body, id: `iq${Date.now()}`, createdBy: '2', createdAt: now, updatedBy: '2', updatedAt: now } as Inquiry;
    mockInquiries.push(item);
    return HttpResponse.json(ok(item));
  }),
  http.put('/api/m02/inquiries/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Inquiry>;
    const idx = mockInquiries.findIndex((i) => i.id === params['id']);
    if (idx >= 0) Object.assign(mockInquiries[idx], body);
    return HttpResponse.json(ok(mockInquiries[idx]));
  }),
  http.delete('/api/m02/inquiries/:id', ({ params }) => {
    const idx = mockInquiries.findIndex((i) => i.id === params['id']);
    if (idx >= 0) mockInquiries.splice(idx, 1);
    return HttpResponse.json(ok(null));
  }),
  http.get('/api/m02/followups', () => HttpResponse.json(paginated(mockFollowups))),
  http.post('/api/m02/followups', async ({ request }) => {
    const body = (await request.json()) as Partial<FollowUp>;
    const item = { ...body, id: `fu${Date.now()}` } as FollowUp;
    mockFollowups.push(item);
    return HttpResponse.json(ok(item));
  }),
];

export { mockCustomers as m02MockCustomers, mockContacts as m02MockContacts, mockOpportunities as m02MockOpportunities, mockInquiries as m02MockInquiries, mockFollowups as m02MockFollowups };
