import { create } from 'zustand';
import type { Quotation, QuotationVersion, Currency, CostItem } from '@/types/m05';
import * as m05Service from '@/services/m05';

function extractItems(res: { data: unknown }): unknown[] {
  const d = res.data;
  if (Array.isArray(d)) return d;
  if (d && typeof d === 'object' && 'items' in d) return (d as { items: unknown[] }).items;
  return [];
}

interface M05State {
  quotations: Quotation[];
  versions: QuotationVersion[];
  currencies: Currency[];
  costItems: CostItem[];
  currentQuotation: Quotation | null;
  loading: boolean;
  error: string | null;
  fetchQuotations: () => Promise<void>;
  fetchQuotationById: (id: string) => Promise<void>;
  fetchVersions: (quotationId: string) => Promise<void>;
  fetchCurrencies: () => Promise<void>;
  fetchCostItems: (quotationId: string) => Promise<void>;
  createQuotation: (data: Record<string, unknown>) => Promise<void>;
  updateQuotation: (id: string, data: Record<string, unknown>) => Promise<void>;
  submitQuotation: (id: string) => Promise<void>;
  removeQuotation: (id: string) => Promise<void>;
  compareVersions: (quotationId: string, v1: number, v2: number) => Promise<void>;
}

export const useM05Store = create<M05State>((set) => ({
  quotations: [],
  versions: [],
  currencies: [],
  costItems: [],
  currentQuotation: null,
  loading: false,
  error: null,

  fetchQuotations: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m05Service.getQuotations();
      set({ quotations: extractItems(res) as Quotation[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchQuotationById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await m05Service.getQuotationById(id);
      set({ currentQuotation: res.data as Quotation });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchVersions: async (quotationId) => {
    set({ error: null });
    try {
      const res = await m05Service.getQuotationVersions(quotationId);
      set({ versions: extractItems(res) as QuotationVersion[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchCurrencies: async () => {
    set({ error: null });
    try {
      const res = await m05Service.getCurrencies();
      set({ currencies: extractItems(res) as Currency[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchCostItems: async (quotationId) => {
    set({ error: null });
    try {
      const res = await m05Service.getCostItems(quotationId);
      set({ costItems: extractItems(res) as CostItem[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createQuotation: async (data) => {
    try {
      await m05Service.createQuotation(data);
      const res = await m05Service.getQuotations();
      set({ quotations: extractItems(res) as Quotation[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateQuotation: async (id, data) => {
    try {
      await m05Service.updateQuotation(id, data);
      const res = await m05Service.getQuotations();
      set({ quotations: extractItems(res) as Quotation[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  submitQuotation: async (id) => {
    try {
      await m05Service.submitQuotation(id);
      const res = await m05Service.getQuotations();
      set({ quotations: extractItems(res) as Quotation[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeQuotation: async (id) => {
    try {
      await m05Service.deleteQuotation(id);
      const res = await m05Service.getQuotations();
      set({ quotations: extractItems(res) as Quotation[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  compareVersions: async (quotationId, v1, v2) => {
    set({ error: null });
    try {
      const res = await m05Service.compareVersions(quotationId, v1, v2);
      const d = res.data as { version1: QuotationVersion; version2: QuotationVersion };
      set({ versions: [d.version1, d.version2] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },
}));
