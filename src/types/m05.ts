/** 币种 */
export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  rate: number;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

/** 成本项 — 匹配后端 CostItem Entity */
export interface CostItem {
  id: string;
  quotationId: string;
  category: 'material' | 'labor' | 'overhead' | 'outsourcing' | 'logistics' | 'other';
  name: string;
  amount: number;
  unit: string | null;
  remark: string | null;
  sortOrder: number;
}

/** 报价 — 匹配后端 Quotation Entity (扁平字段) */
export interface Quotation {
  id: string;
  code: string;
  inquiryId: string | null;
  customerId: string;
  customerName: string | null;
  shelfTypeId: string | null;
  shelfTypeName: string | null;
  configId: string | null;
  configName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currencyId: string | null;
  exchangeRate: number;
  margin: number;
  deliveryDays: number;
  validUntil: string | null;
  version: number;
  status: string; // draft, pending_review, approved, sent, accepted, rejected, expired
  remark: string | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  costItems?: CostItem[];
  versions?: QuotationVersion[];
}

/** 报价版本 — 匹配后端 QuotationVersion Entity */
export interface QuotationVersion {
  id: string;
  quotationId: string;
  version: number;
  unitPrice: number;
  totalPrice: number;
  margin: number;
  changedFields: string[];
  remark: string | null;
  createdAt: string;
  createdBy: string;
}
