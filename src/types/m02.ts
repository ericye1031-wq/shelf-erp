/** 客户 — 匹配后端 Customer Entity 的扁平字段 */
export interface Customer {
  id: string;
  name: string;
  code: string;
  shortName: string | null;
  type: string; // direct, agent, distributor
  industry: string | null;
  region: string | null;
  level: string; // A, B, C, D
  source: string | null;
  status: string;
  projectId: string | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  contacts?: Contact[];
}

/** 联系人 — 匹配后端 Contact Entity */
export interface Contact {
  id: string;
  customerId: string;
  name: string;
  position: string | null;
  phone: string | null;
  email: string | null;
  isPrimary: boolean;
  remark: string | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

/** 商机 — 匹配后端 Opportunity Entity */
export interface Opportunity {
  id: string;
  customerId: string;
  customerName: string | null;
  title: string;
  amount: number | null;
  stage: string; // initial, qualification, proposal, negotiation, closed_won, closed_lost
  probability: number;
  expectedDate: string | null;
  description: string | null;
  status: string;
  projectId: string | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

/** 询价 — 匹配后端 Inquiry Entity */
export interface Inquiry {
  id: string;
  code: string;
  customerId: string;
  customerName: string | null;
  opportunityId: string | null;
  shelfType: string | null;
  requirement: string | null;
  quantity: number;
  unit: string | null;
  deliveryDate: string | null;
  status: string;
  projectId: string | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

/** 跟进记录 — 匹配后端 FollowUp Entity (无 updatedBy/updatedAt) */
export interface FollowUp {
  id: string;
  customerId: string;
  opportunityId: string | null;
  type: string; // call, visit, email, wechat, other
  content: string;
  nextAction: string | null;
  nextDate: string | null;
  createdBy: string;
  createdAt: string;
}
