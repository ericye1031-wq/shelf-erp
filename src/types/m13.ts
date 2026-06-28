import type { AuditFields } from './common';

/** 科目类别 */
export type AccountCategory = '资产' | '负债' | '权益' | '成本' | '损益';
export type BalanceDirection = 'debit' | 'credit';
export type AccountStatus = 'active' | 'inactive';

/** 会计科目 */
export interface Account extends AuditFields {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
  category: AccountCategory;
  balanceDirection: BalanceDirection;
  isLeaf: boolean;
  hasAux: boolean;
  auxTypes: string | null;
  status: AccountStatus;
  children?: Account[];
}

/** 凭证状态 */
export type VoucherStatus = 'draft' | 'submitted' | 'audited' | 'posted' | 'cancelled';

/** 凭证 */
export interface Voucher extends AuditFields {
  id: string;
  voucherNo: string;
  voucherDate: string;
  attachmentCount: number;
  totalDebit: number;
  totalCredit: number;
  status: VoucherStatus;
  postedBy: string | null;
  postedAt: string | null;
  remark: string | null;
  entries?: VoucherEntry[];
}

/** 凭证明细 */
export interface VoucherEntry {
  id: string;
  voucherId: string;
  accountId: string;
  summary: string | null;
  debitAmount: number;
  creditAmount: number;
  auxData: string | null;
  sortOrder: number;
}

/** 应收状态 */
export type ReceivableStatus = 'pending' | 'partial' | 'settled' | 'written_off';

/** 应收 */
export interface AccountsReceivable extends AuditFields {
  id: string;
  receivableNo: string;
  customerId: string;
  customerName: string;
  contractId: string | null;
  contractNo: string | null;
  amount: number;
  settledAmount: number;
  balance: number;
  dueDate: string | null;
  status: ReceivableStatus;
  remark: string | null;
  receipts?: Receipt[];
}

/** 收款记录 */
export interface Receipt {
  id: string;
  receivableId: string;
  receiptNo: string;
  receiptDate: string;
  amount: number;
  status: 'confirmed' | 'cancelled';
  remark: string | null;
  createdBy: string;
  createdAt: string;
}

/** 应付状态 */
export type PayableStatus = 'pending' | 'partial' | 'settled' | 'written_off';

/** 应付 */
export interface AccountsPayable extends AuditFields {
  id: string;
  payableNo: string;
  supplierId: string;
  supplierName: string;
  purchaseOrderNo: string | null;
  amount: number;
  settledAmount: number;
  balance: number;
  dueDate: string | null;
  status: PayableStatus;
  remark: string | null;
  payments?: Payment[];
}

/** 付款申请状态 */
export type PaymentRequestStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';

/** 付款申请 */
export interface PaymentRequest {
  id: string;
  payableId: string;
  requestNo: string;
  bankAccountId: string | null;
  amount: number;
  requestDate: string;
  status: PaymentRequestStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  remark: string | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

/** 付款记录 */
export interface PaymentInterface {
  id: string;
  payableId: string;
  paymentNo: string;
  paymentDate: string;
  bankAccountId: string | null;
  amount: number;
  status: 'confirmed' | 'cancelled';
  remark: string | null;
  createdBy: string;
  createdAt: string;
}

/** 银行账户类型 */
export type AccountType = 'cash' | 'bank' | 'other';

/** 银行账户 */
export interface BankAccountEntity extends AuditFields {
  id: string;
  name: string;
  accountNo: string;
  bankName: string;
  branchName: string | null;
  currency: string;
  balance: number;
  accountType: AccountType;
  active: boolean;
  remark: string | null;
}

/** 银行交易方向 */
export type TransactionDirection = 'in' | 'out';

/** 银行流水 */
export interface BankTransaction {
  id: string;
  bankAccountId: string;
  transactionDate: string;
  description: string;
  direction: TransactionDirection;
  amount: number;
  balanceAfter: number;
  referenceNo: string | null;
  remark: string | null;
  createdBy: string;
  createdAt: string;
}

/** 资金日报 */
export interface FundDailyReport {
  date: string;
  accounts: {
    id: string;
    name: string;
    accountNo: string;
    bankName: string;
    balance: number;
    totalIn: number;
    totalOut: number;
    txCount: number;
  }[];
  summary: {
    totalBalance: number;
    totalIn: number;
    totalOut: number;
    netFlow: number;
  };
}

/** 应收/应付统计 */
export interface ReceivablePayableStats {
  totalAmount: number;
  settledAmount: number;
  balance: number;
  count: number;
  overdueCount: number;
}

/** 账龄 */
export interface AgingData {
  current: number;
  within30: number;
  within90: number;
  within180: number;
  over180: number;
}
