/** 合同状态 */
export type ContractStatus = 'draft' | 'reviewing' | 'approved' | 'executing' | 'completed' | 'terminated';

/** 回款计划状态 */
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue';

/** 发票状态 */
export type InvoiceStatus = 'pending' | 'issued' | 'cancelled';

/** 发票类型 */
export type InvoiceType = 'normal' | 'special';

/** 合同 */
export interface Contract {
  id: string;
  code: string;
  quotationId: string | null;
  customerId: string;
  customerName: string | null;
  title: string;
  amount: number;
  currencyId: string | null;
  signDate: string | null;
  deliveryDate: string | null;
  paymentTerms: string | null;
  status: ContractStatus;
  terms: string | null;
  projectId: string | null;
  paidAmount: number;
  invoiceAmount: number;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

/** 回款计划 */
export interface PaymentPlan {
  id: string;
  contractId: string;
  stage: string;
  amount: number;
  ratio: number | null;
  plannedDate: string | null;
  actualDate: string | null;
  status: PaymentStatus;
  remark: string | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

/** 发票 */
export interface Invoice {
  id: string;
  contractId: string;
  code: string;
  type: InvoiceType;
  amount: number;
  taxRate: number | null;
  taxAmount: number | null;
  issuedDate: string | null;
  status: InvoiceStatus;
  remark: string | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}
