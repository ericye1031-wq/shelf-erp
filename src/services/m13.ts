import api from './api';
import type { PaginatedResponse } from '@/types/common';
import type {
  Account,
  Voucher,
  VoucherEntry,
  AccountsReceivable,
  Receipt,
  AccountsPayable,
  PaymentRequest,
  PaymentInterface,
  BankAccountEntity,
  BankTransaction,
  FundDailyReport,
  ReceivablePayableStats,
  AgingData,
} from '@/types/m13';

const BASE = '/m13';

// ===== 科目 =====
export const getAccounts = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Account>>(`${BASE}/accounts`, { params });

export const getAccountTree = () =>
  api.get<Account[]>(`${BASE}/accounts/tree`);

export const getAccountById = (id: string) =>
  api.get<Account>(`${BASE}/accounts/${id}`);

export const getAccountChildren = (id: string) =>
  api.get<Account[]>(`${BASE}/accounts/${id}/children`);

export const createAccount = (data: Partial<Account>) =>
  api.post<Account>(`${BASE}/accounts`, data);

export const updateAccount = (id: string, data: Partial<Account>) =>
  api.put<Account>(`${BASE}/accounts/${id}`, data);

export const deleteAccount = (id: string) =>
  api.delete(`${BASE}/accounts/${id}`);

// ===== 凭证 =====
export const getVouchers = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Voucher>>(`${BASE}/vouchers`, { params });

export const getVoucherById = (id: string) =>
  api.get<Voucher>(`${BASE}/vouchers/${id}`);

export const getVoucherEntries = (id: string) =>
  api.get<VoucherEntry[]>(`${BASE}/vouchers/${id}/entries`);

export const createVoucher = (data: Record<string, unknown>) =>
  api.post<Voucher>(`${BASE}/vouchers`, data);

export const updateVoucher = (id: string, data: Record<string, unknown>) =>
  api.put<Voucher>(`${BASE}/vouchers/${id}`, data);

export const deleteVoucher = (id: string) =>
  api.delete(`${BASE}/vouchers/${id}`);

export const submitVoucher = (id: string) =>
  api.patch<Voucher>(`${BASE}/vouchers/${id}/submit`);

export const auditVoucher = (id: string, action: string) =>
  api.patch<Voucher>(`${BASE}/vouchers/${id}/audit`, { action });

export const postVoucher = (id: string) =>
  api.patch<Voucher>(`${BASE}/vouchers/${id}/post`);

export const reverseVoucher = (id: string) =>
  api.patch<Voucher>(`${BASE}/vouchers/${id}/reverse`);

export const cancelVoucher = (id: string) =>
  api.patch<Voucher>(`${BASE}/vouchers/${id}/cancel`);

// ===== 应收 =====
export const getReceivables = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<AccountsReceivable>>(`${BASE}/receivables`, { params });

export const getReceivableById = (id: string) =>
  api.get<AccountsReceivable>(`${BASE}/receivables/${id}`);

export const getReceivableStats = () =>
  api.get<ReceivablePayableStats>(`${BASE}/receivables/stats`);

export const getAging = () =>
  api.get<AgingData>(`${BASE}/receivables/aging`);

export const createReceivable = (data: Record<string, unknown>) =>
  api.post<AccountsReceivable>(`${BASE}/receivables`, data);

export const getReceipts = (receivableId: string) =>
  api.get<Receipt[]>(`${BASE}/receivables/${receivableId}/receipts`);

export const addReceipt = (data: Record<string, unknown>) =>
  api.post<Receipt>(`${BASE}/receivables/receipts`, data);

export const cancelReceipt = (receiptId: string) =>
  api.patch(`${BASE}/receivables/receipts/${receiptId}/cancel`);

export const deleteReceivable = (id: string) =>
  api.delete(`${BASE}/receivables/${id}`);

// ===== 应付 =====
export const getPayables = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<AccountsPayable>>(`${BASE}/payables`, { params });

export const getPayableById = (id: string) =>
  api.get<AccountsPayable>(`${BASE}/payables/${id}`);

export const getPayableStats = () =>
  api.get<ReceivablePayableStats>(`${BASE}/payables/stats`);

export const getPaymentRequests = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<PaymentRequest>>(`${BASE}/payables/requests`, { params });

export const createPayable = (data: Record<string, unknown>) =>
  api.post<AccountsPayable>(`${BASE}/payables`, data);

export const createPaymentRequest = (data: Record<string, unknown>) =>
  api.post<PaymentRequest>(`${BASE}/payables/requests`, data);

export const submitPaymentRequest = (requestId: string) =>
  api.patch<PaymentRequest>(`${BASE}/payables/requests/${requestId}/submit`);

export const approvePaymentRequest = (requestId: string) =>
  api.patch<PaymentRequest>(`${BASE}/payables/requests/${requestId}/approve`);

export const rejectPaymentRequest = (requestId: string) =>
  api.patch<PaymentRequest>(`${BASE}/payables/requests/${requestId}/reject`);

export const addPayment = (data: Record<string, unknown>) =>
  api.post<PaymentInterface>(`${BASE}/payables/payments`, data);

export const getPayments = (payableId: string) =>
  api.get<PaymentInterface[]>(`${BASE}/payables/${payableId}/payments`);

export const cancelPayment = (paymentId: string) =>
  api.patch(`${BASE}/payables/payments/${paymentId}/cancel`);

export const deletePayable = (id: string) =>
  api.delete(`${BASE}/payables/${id}`);

// ===== 银行账户 =====
export const getBankAccounts = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<BankAccountEntity>>(`${BASE}/bank-accounts`, { params });

export const getBankAccountById = (id: string) =>
  api.get<BankAccountEntity>(`${BASE}/bank-accounts/${id}`);

export const getBankTransactions = (id: string, params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<BankTransaction>>(`${BASE}/bank-accounts/${id}/transactions`, { params });

export const createBankAccount = (data: Record<string, unknown>) =>
  api.post<BankAccountEntity>(`${BASE}/bank-accounts`, data);

export const addBankTransaction = (data: Record<string, unknown>) =>
  api.post<BankTransaction>(`${BASE}/bank-accounts/transactions`, data);

export const updateBankAccount = (id: string, data: Record<string, unknown>) =>
  api.put<BankAccountEntity>(`${BASE}/bank-accounts/${id}`, data);

export const deleteBankAccount = (id: string) =>
  api.delete(`${BASE}/bank-accounts/${id}`);

// ===== 资金报表 =====
export const getFundDailyReport = (date: string) =>
  api.get<FundDailyReport>(`${BASE}/fund-reports/daily`, { params: { date } });
