import { create } from 'zustand';
import type { Contract, PaymentPlan, Invoice } from '@/types/m06';
import * as m06Service from '@/services/m06';

/** 统一提取列表数据（兼容分页格式和纯数组） */
function extractItems(res: { data: unknown }): unknown[] {
  const d = res.data;
  if (Array.isArray(d)) return d;
  if (d && typeof d === 'object' && 'items' in d) {
    return (d as { items: unknown[] }).items;
  }
  return [];
}

interface M06State {
  contracts: Contract[];
  payments: PaymentPlan[];
  invoices: Invoice[];
  currentContract: Contract | null;
  loading: boolean;
  error: string | null;
  fetchContracts: () => Promise<void>;
  fetchContractById: (id: string) => Promise<void>;
  fetchPayments: (contractId: string) => Promise<void>;
  fetchInvoices: (contractId: string) => Promise<void>;
  createContract: (data: Record<string, unknown>) => Promise<void>;
  updateContract: (id: string, data: Record<string, unknown>) => Promise<void>;
  submitContract: (id: string) => Promise<void>;
  approveContract: (id: string) => Promise<void>;
  removeContract: (id: string) => Promise<void>;
  createPayment: (contractId: string, data: Record<string, unknown>) => Promise<void>;
  updatePayment: (contractId: string, id: string, data: Record<string, unknown>) => Promise<void>;
  confirmPayment: (contractId: string, id: string, actualDate: string) => Promise<void>;
  createInvoice: (contractId: string, data: Record<string, unknown>) => Promise<void>;
  updateInvoice: (contractId: string, id: string, data: Record<string, unknown>) => Promise<void>;
}

export const useM06Store = create<M06State>((set, _get) => ({
  contracts: [],
  payments: [],
  invoices: [],
  currentContract: null,
  loading: false,
  error: null,

  fetchContracts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m06Service.getContracts();
      set({ contracts: extractItems(res) as Contract[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchContractById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await m06Service.getContractById(id);
      set({ currentContract: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchPayments: async (contractId) => {
    set({ error: null });
    try {
      const res = await m06Service.getPayments(contractId);
      set({ payments: extractItems(res) as PaymentPlan[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchInvoices: async (contractId) => {
    set({ error: null });
    try {
      const res = await m06Service.getInvoices(contractId);
      set({ invoices: extractItems(res) as Invoice[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createContract: async (data) => {
    set({ error: null });
    try {
      await m06Service.createContract(data);
      const res = await m06Service.getContracts();
      set({ contracts: extractItems(res) as Contract[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateContract: async (id, data) => {
    set({ error: null });
    try {
      await m06Service.updateContract(id, data);
      const res = await m06Service.getContracts();
      set({ contracts: extractItems(res) as Contract[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  submitContract: async (id) => {
    set({ error: null });
    try {
      await m06Service.submitContract(id);
      const res = await m06Service.getContracts();
      set({ contracts: extractItems(res) as Contract[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  approveContract: async (id) => {
    set({ error: null });
    try {
      await m06Service.approveContract(id);
      const res = await m06Service.getContracts();
      set({ contracts: extractItems(res) as Contract[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeContract: async (id) => {
    set({ error: null });
    try {
      await m06Service.deleteContract(id);
      const res = await m06Service.getContracts();
      set({ contracts: extractItems(res) as Contract[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createPayment: async (contractId, data) => {
    set({ error: null });
    try {
      await m06Service.createPayment(contractId, data);
      const res = await m06Service.getPayments(contractId);
      set({ payments: extractItems(res) as PaymentPlan[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updatePayment: async (contractId, id, data) => {
    set({ error: null });
    try {
      await m06Service.updatePayment(contractId, id, data);
      const res = await m06Service.getPayments(contractId);
      set({ payments: extractItems(res) as PaymentPlan[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  confirmPayment: async (contractId, id, actualDate) => {
    set({ error: null });
    try {
      await m06Service.confirmPayment(contractId, id, actualDate);
      const res = await m06Service.getPayments(contractId);
      set({ payments: extractItems(res) as PaymentPlan[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createInvoice: async (contractId, data) => {
    set({ error: null });
    try {
      await m06Service.createInvoice(contractId, data);
      const res = await m06Service.getInvoices(contractId);
      set({ invoices: extractItems(res) as Invoice[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateInvoice: async (contractId, id, data) => {
    set({ error: null });
    try {
      await m06Service.updateInvoice(contractId, id, data);
      const res = await m06Service.getInvoices(contractId);
      set({ invoices: extractItems(res) as Invoice[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },
}));
