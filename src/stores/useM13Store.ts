import { create } from 'zustand';
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
import * as m13Service from '@/services/m13';

function extractItems(res: { data: unknown }): unknown[] {
  const d = res.data;
  if (Array.isArray(d)) return d;
  if (d && typeof d === 'object' && 'items' in d) {
    return (d as { items: unknown[] }).items;
  }
  return [];
}

interface M13State {
  accounts: Account[];
  accountTree: Account[];
  vouchers: Voucher[];
  currentVoucher: Voucher | null;
  receivables: AccountsReceivable[];
  receivableStats: ReceivablePayableStats | null;
  aging: AgingData | null;
  payables: AccountsPayable[];
  payableStats: ReceivablePayableStats | null;
  paymentRequests: PaymentRequest[];
  bankAccounts: BankAccountEntity[];
  currentBankAccount: BankAccountEntity | null;
  bankTransactions: BankTransaction[];
  fundReport: FundDailyReport | null;
  loading: boolean;
  error: string | null;

  // Accounts
  fetchAccounts: (params?: Record<string, unknown>) => Promise<void>;
  fetchAccountTree: () => Promise<void>;
  createAccount: (data: Record<string, unknown>) => Promise<void>;
  updateAccount: (id: string, data: Record<string, unknown>) => Promise<void>;
  removeAccount: (id: string) => Promise<void>;

  // Vouchers
  fetchVouchers: (params?: Record<string, unknown>) => Promise<void>;
  fetchVoucherById: (id: string) => Promise<void>;
  createVoucher: (data: Record<string, unknown>) => Promise<void>;
  updateVoucher: (id: string, data: Record<string, unknown>) => Promise<void>;
  removeVoucher: (id: string) => Promise<void>;
  submitVoucher: (id: string) => Promise<void>;
  auditVoucher: (id: string, action: string) => Promise<void>;
  postVoucher: (id: string) => Promise<void>;
  reverseVoucher: (id: string) => Promise<void>;
  cancelVoucher: (id: string) => Promise<void>;

  // Receivables
  fetchReceivables: (params?: Record<string, unknown>) => Promise<void>;
  fetchReceivableStats: () => Promise<void>;
  fetchAging: () => Promise<void>;
  createReceivable: (data: Record<string, unknown>) => Promise<void>;
  addReceipt: (data: Record<string, unknown>) => Promise<void>;
  cancelReceipt: (receiptId: string) => Promise<void>;
  removeReceivable: (id: string) => Promise<void>;

  // Payables
  fetchPayables: (params?: Record<string, unknown>) => Promise<void>;
  fetchPayableStats: () => Promise<void>;
  fetchPaymentRequests: (params?: Record<string, unknown>) => Promise<void>;
  createPayable: (data: Record<string, unknown>) => Promise<void>;
  createPaymentRequest: (data: Record<string, unknown>) => Promise<void>;
  submitPaymentRequest: (requestId: string) => Promise<void>;
  approvePaymentRequest: (requestId: string) => Promise<void>;
  rejectPaymentRequest: (requestId: string) => Promise<void>;
  addPayment: (data: Record<string, unknown>) => Promise<void>;
  cancelPayment: (paymentId: string) => Promise<void>;
  removePayable: (id: string) => Promise<void>;

  // Bank Accounts
  fetchBankAccounts: (params?: Record<string, unknown>) => Promise<void>;
  fetchBankAccountById: (id: string) => Promise<void>;
  fetchBankTransactions: (id: string, params?: Record<string, unknown>) => Promise<void>;
  createBankAccount: (data: Record<string, unknown>) => Promise<void>;
  addBankTransaction: (data: Record<string, unknown>) => Promise<void>;
  updateBankAccount: (id: string, data: Record<string, unknown>) => Promise<void>;
  removeBankAccount: (id: string) => Promise<void>;

  // Fund Reports
  fetchFundDailyReport: (date: string) => Promise<void>;

  clearError: () => void;
}

export const useM13Store = create<M13State>((set, _get) => ({
  accounts: [],
  accountTree: [],
  vouchers: [],
  currentVoucher: null,
  receivables: [],
  receivableStats: null,
  aging: null,
  payables: [],
  payableStats: null,
  paymentRequests: [],
  bankAccounts: [],
  currentBankAccount: null,
  bankTransactions: [],
  fundReport: null,
  loading: false,
  error: null,

  // ---- Accounts ----
  fetchAccounts: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await m13Service.getAccounts(params);
      set({ accounts: extractItems(res) as Account[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchAccountTree: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m13Service.getAccountTree();
      set({ accountTree: (res.data || []) as Account[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  createAccount: async (data) => {
    set({ error: null });
    try {
      await m13Service.createAccount(data);
      const res = await m13Service.getAccounts();
      set({ accounts: extractItems(res) as Account[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateAccount: async (id, data) => {
    set({ error: null });
    try {
      await m13Service.updateAccount(id, data);
      const res = await m13Service.getAccounts();
      set({ accounts: extractItems(res) as Account[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeAccount: async (id) => {
    set({ error: null });
    try {
      await m13Service.deleteAccount(id);
      const res = await m13Service.getAccounts();
      set({ accounts: extractItems(res) as Account[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  // ---- Vouchers ----
  fetchVouchers: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await m13Service.getVouchers(params);
      set({ vouchers: extractItems(res) as Voucher[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchVoucherById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await m13Service.getVoucherById(id);
      set({ currentVoucher: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  createVoucher: async (data) => {
    set({ error: null });
    try {
      await m13Service.createVoucher(data);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateVoucher: async (id, data) => {
    set({ error: null });
    try {
      await m13Service.updateVoucher(id, data);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeVoucher: async (id) => {
    set({ error: null });
    try {
      await m13Service.deleteVoucher(id);
      const res = await m13Service.getVouchers();
      set({ vouchers: extractItems(res) as Voucher[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  submitVoucher: async (id) => {
    set({ error: null });
    try {
      const res = await m13Service.submitVoucher(id);
      set({ currentVoucher: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  auditVoucher: async (id, action) => {
    set({ error: null });
    try {
      const res = await m13Service.auditVoucher(id, action);
      set({ currentVoucher: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  postVoucher: async (id) => {
    set({ error: null });
    try {
      const res = await m13Service.postVoucher(id);
      set({ currentVoucher: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  reverseVoucher: async (id) => {
    set({ error: null });
    try {
      await m13Service.reverseVoucher(id);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  cancelVoucher: async (id) => {
    set({ error: null });
    try {
      const res = await m13Service.cancelVoucher(id);
      set({ currentVoucher: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  // ---- Receivables ----
  fetchReceivables: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await m13Service.getReceivables(params);
      set({ receivables: extractItems(res) as AccountsReceivable[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchReceivableStats: async () => {
    try {
      const res = await m13Service.getReceivableStats();
      set({ receivableStats: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchAging: async () => {
    try {
      const res = await m13Service.getAging();
      set({ aging: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createReceivable: async (data) => {
    set({ error: null });
    try {
      await m13Service.createReceivable(data);
      const res = await m13Service.getReceivables();
      set({ receivables: extractItems(res) as AccountsReceivable[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  addReceipt: async (data) => {
    set({ error: null });
    try {
      await m13Service.addReceipt(data);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  cancelReceipt: async (receiptId) => {
    set({ error: null });
    try {
      await m13Service.cancelReceipt(receiptId);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeReceivable: async (id) => {
    set({ error: null });
    try {
      await m13Service.deleteReceivable(id);
      const res = await m13Service.getReceivables();
      set({ receivables: extractItems(res) as AccountsReceivable[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  // ---- Payables ----
  fetchPayables: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await m13Service.getPayables(params);
      set({ payables: extractItems(res) as AccountsPayable[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchPayableStats: async () => {
    try {
      const res = await m13Service.getPayableStats();
      set({ payableStats: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchPaymentRequests: async (params) => {
    set({ error: null });
    try {
      const res = await m13Service.getPaymentRequests(params);
      set({ paymentRequests: extractItems(res) as PaymentRequest[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createPayable: async (data) => {
    set({ error: null });
    try {
      await m13Service.createPayable(data);
      const res = await m13Service.getPayables();
      set({ payables: extractItems(res) as AccountsPayable[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createPaymentRequest: async (data) => {
    set({ error: null });
    try {
      await m13Service.createPaymentRequest(data);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  submitPaymentRequest: async (requestId) => {
    set({ error: null });
    try {
      await m13Service.submitPaymentRequest(requestId);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  approvePaymentRequest: async (requestId) => {
    set({ error: null });
    try {
      await m13Service.approvePaymentRequest(requestId);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  rejectPaymentRequest: async (requestId) => {
    set({ error: null });
    try {
      await m13Service.rejectPaymentRequest(requestId);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  addPayment: async (data) => {
    set({ error: null });
    try {
      await m13Service.addPayment(data);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  cancelPayment: async (paymentId) => {
    set({ error: null });
    try {
      await m13Service.cancelPayment(paymentId);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removePayable: async (id) => {
    set({ error: null });
    try {
      await m13Service.deletePayable(id);
      const res = await m13Service.getPayables();
      set({ payables: extractItems(res) as AccountsPayable[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  // ---- Bank Accounts ----
  fetchBankAccounts: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await m13Service.getBankAccounts(params);
      set({ bankAccounts: extractItems(res) as BankAccountEntity[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchBankAccountById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await m13Service.getBankAccountById(id);
      set({ currentBankAccount: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchBankTransactions: async (id, params) => {
    set({ error: null });
    try {
      const res = await m13Service.getBankTransactions(id, params);
      set({ bankTransactions: extractItems(res) as BankTransaction[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createBankAccount: async (data) => {
    set({ error: null });
    try {
      await m13Service.createBankAccount(data);
      const res = await m13Service.getBankAccounts();
      set({ bankAccounts: extractItems(res) as BankAccountEntity[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  addBankTransaction: async (data) => {
    set({ error: null });
    try {
      await m13Service.addBankTransaction(data);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateBankAccount: async (id, data) => {
    set({ error: null });
    try {
      await m13Service.updateBankAccount(id, data);
      const res = await m13Service.getBankAccounts();
      set({ bankAccounts: extractItems(res) as BankAccountEntity[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeBankAccount: async (id) => {
    set({ error: null });
    try {
      await m13Service.deleteBankAccount(id);
      const res = await m13Service.getBankAccounts();
      set({ bankAccounts: extractItems(res) as BankAccountEntity[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  // ---- Fund Reports ----
  fetchFundDailyReport: async (date) => {
    set({ loading: true, error: null });
    try {
      const res = await m13Service.getFundDailyReport(date);
      set({ fundReport: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
