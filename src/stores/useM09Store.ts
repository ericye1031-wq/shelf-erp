import { create } from 'zustand';
import type { PurchaseOrder, PurchaseItem, Supplier, SupplierQuote, SupplierPrice } from '@/types/m09';
import * as m09Service from '@/services/m09';

/** 统一提取列表数据（兼容分页格式和纯数组） */
function extractItems(res: { data: unknown }): unknown[] {
  const d = res.data;
  if (Array.isArray(d)) return d;
  if (d && typeof d === 'object' && 'items' in d) {
    return (d as { items: unknown[] }).items;
  }
  return [];
}

interface M09State {
  orders: PurchaseOrder[];
  items: PurchaseItem[];
  currentOrder: PurchaseOrder | null;
  suppliers: Supplier[];
  supplierQuotes: SupplierQuote[];
  supplierPrices: SupplierPrice[];
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  fetchOrderById: (id: string) => Promise<void>;
  fetchItems: (orderId: string) => Promise<void>;
  createOrder: (data: Record<string, unknown>) => Promise<void>;
  updateOrder: (id: string, data: Record<string, unknown>) => Promise<void>;
  removeOrder: (id: string) => Promise<void>;
  submitOrder: (id: string) => Promise<void>;
  approveOrder: (id: string) => Promise<void>;
  createItem: (orderId: string, data: Record<string, unknown>) => Promise<void>;
  updateItem: (orderId: string, id: string, data: Record<string, unknown>) => Promise<void>;
  removeItem: (orderId: string, id: string) => Promise<void>;
  fetchSuppliers: () => Promise<void>;
  createSupplier: (data: Record<string, unknown>) => Promise<void>;
  updateSupplier: (id: string, data: Record<string, unknown>) => Promise<void>;
  removeSupplier: (id: string) => Promise<void>;
  fetchSupplierPrices: (params?: Record<string, unknown>) => Promise<void>;
  fetchSupplierQuotes: (params?: Record<string, unknown>) => Promise<void>;
}

export const useM09Store = create<M09State>((set, _get) => ({
  orders: [],
  items: [],
  currentOrder: null,
  suppliers: [],
  supplierQuotes: [],
  supplierPrices: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m09Service.getPurchaseOrders();
      set({ orders: extractItems(res) as PurchaseOrder[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchOrderById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await m09Service.getPurchaseOrderById(id);
      set({ currentOrder: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchItems: async (orderId) => {
    set({ error: null });
    try {
      const res = await m09Service.getPurchaseItems(orderId);
      set({ items: extractItems(res) as PurchaseItem[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createOrder: async (data) => {
    set({ error: null });
    try {
      await m09Service.createPurchaseOrder(data);
      const res = await m09Service.getPurchaseOrders();
      set({ orders: extractItems(res) as PurchaseOrder[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateOrder: async (id, data) => {
    set({ error: null });
    try {
      await m09Service.updatePurchaseOrder(id, data);
      const res = await m09Service.getPurchaseOrders();
      set({ orders: extractItems(res) as PurchaseOrder[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeOrder: async (id) => {
    set({ error: null });
    try {
      await m09Service.deletePurchaseOrder(id);
      const res = await m09Service.getPurchaseOrders();
      set({ orders: extractItems(res) as PurchaseOrder[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  submitOrder: async (id) => {
    set({ error: null });
    try {
      await m09Service.submitPurchaseOrder(id);
      const res = await m09Service.getPurchaseOrders();
      set({ orders: extractItems(res) as PurchaseOrder[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  approveOrder: async (id) => {
    set({ error: null });
    try {
      await m09Service.approvePurchaseOrder(id);
      const res = await m09Service.getPurchaseOrders();
      set({ orders: extractItems(res) as PurchaseOrder[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createItem: async (orderId, data) => {
    set({ error: null });
    try {
      await m09Service.createPurchaseItem(orderId, data);
      const res = await m09Service.getPurchaseItems(orderId);
      set({ items: extractItems(res) as PurchaseItem[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateItem: async (orderId, id, data) => {
    set({ error: null });
    try {
      await m09Service.updatePurchaseItem(orderId, id, data);
      const res = await m09Service.getPurchaseItems(orderId);
      set({ items: extractItems(res) as PurchaseItem[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeItem: async (orderId, id) => {
    set({ error: null });
    try {
      await m09Service.deletePurchaseItem(orderId, id);
      const res = await m09Service.getPurchaseItems(orderId);
      set({ items: extractItems(res) as PurchaseItem[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchSuppliers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m09Service.getSuppliers();
      set({ suppliers: extractItems(res) as Supplier[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  createSupplier: async (data) => {
    set({ error: null });
    try {
      await m09Service.createSupplier(data);
      const res = await m09Service.getSuppliers();
      set({ suppliers: extractItems(res) as Supplier[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateSupplier: async (id, data) => {
    set({ error: null });
    try {
      await m09Service.updateSupplier(id, data);
      const res = await m09Service.getSuppliers();
      set({ suppliers: extractItems(res) as Supplier[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeSupplier: async (id) => {
    set({ error: null });
    try {
      await m09Service.deleteSupplier(id);
      const res = await m09Service.getSuppliers();
      set({ suppliers: extractItems(res) as Supplier[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchSupplierPrices: async (params) => {
    set({ error: null });
    try {
      const res = await m09Service.getSupplierPrices(params);
      set({ supplierPrices: extractItems(res) as SupplierPrice[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchSupplierQuotes: async (params) => {
    set({ error: null });
    try {
      const res = await m09Service.getSupplierQuotes(params);
      set({ supplierQuotes: extractItems(res) as SupplierQuote[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },
}));